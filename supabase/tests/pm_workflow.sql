-- Administrative test runner. All disposable cases/requests/events roll back.
begin;
select set_config('fixlens.test_normal', 'demo-' || gen_random_uuid(), true);
select set_config('fixlens.test_evidence', 'demo-' || gen_random_uuid(), true);
insert into public.cases(case_key, demo_session_id, renter_id, property_id, handled_by, issue_type, description, status)
select key, 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
 '10000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000001',
 '10000000-0000-4000-8000-000000000002', 'Disposable workflow test', 'Unchanged report', 'submitted'
from unnest(array[current_setting('fixlens.test_normal'),current_setting('fixlens.test_evidence')]) key;

create function pg_temp.must_fail(statement text, expected_code text) returns void language plpgsql as $$
begin
  execute statement;
  raise exception 'Unexpected success: %', statement;
exception when others then
  if sqlstate <> expected_code then raise; end if;
end $$;

set local role anon;
select pg_temp.must_fail(format('select public.advance_case(%L,%L)', current_setting('fixlens.test_normal'), 'request_approval'), '42501');
select pg_temp.must_fail(format('select public.request_case_evidence(%L,%L,%L)', current_setting('fixlens.test_evidence'), gen_random_uuid(), 'Clear photo please'), '42501');
do $$ begin
  assert not has_table_privilege('anon','public.case_updates','INSERT');
  assert not has_table_privilege('anon','public.evidence_requests','INSERT');
end $$;
reset role;
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb","role":"authenticated"}', true);
select pg_temp.must_fail(format('select public.advance_case(%L,%L)', current_setting('fixlens.test_normal'), 'request_approval'), '42501');
select pg_temp.must_fail(format('select public.request_case_evidence(%L,%L,%L)', current_setting('fixlens.test_evidence'), gen_random_uuid(), 'Clear photo please'), '42501');
reset role;
select set_config('request.jwt.claims', jsonb_build_object('sub',auth_user_id,'role','authenticated')::text,true)
from public.profiles where id='10000000-0000-4000-8000-000000000002';
set local role authenticated;

do $$ declare
  key text := current_setting('fixlens.test_normal');
  actions text[] := array['request_approval','record_approval','schedule_repair','complete_repair'];
  statuses text[] := array['awaiting_approval','arranging_repair','repair_scheduled','completed'];
  events text[] := array['approval_requested','approval_recorded','repair_scheduled','completed'];
  target_id uuid;
  result jsonb;
begin
  select id into target_id from public.cases where case_key=key;
  foreach key in array array['complete_repair','schedule_repair','request_approval','completed','reopen',null] loop
    perform pg_temp.must_fail(format('select public.advance_case(%L,%L)', current_setting('fixlens.test_normal'),key), '22023');
  end loop;
  key := current_setting('fixlens.test_normal');
  perform public.review_case(key);
  perform pg_temp.must_fail(format('select public.advance_case(%L,%L)',key,'complete_repair'),'22023');
  for i in 1..4 loop
    result := public.advance_case(key, actions[i]);
    assert result->>'outcome'='applied';
    assert result->>'status'=statuses[i];
    result := public.advance_case(key, actions[i]);
    assert result->>'outcome'='already_applied';
    assert (select count(*) from public.case_updates where case_id=target_id and update_type=events[i])=1;
    assert (select status from public.cases where id=target_id)=statuses[i];
    assert (select description from public.cases where id=target_id)='Unchanged report';
  end loop;
  -- Late retry after subsequent actions returns the current state, never regresses.
  result := public.advance_case(key,'request_approval');
  assert result->>'status'='completed' and result->>'outcome'='already_applied';
  perform pg_temp.must_fail(format('select public.review_case(%L)',key),'22023');
  perform pg_temp.must_fail(format('select public.advance_case(%L,%L)',key,'under_review'),'22023');
  assert (select count(*) from public.case_updates where case_id=target_id)=6;
  assert not has_table_privilege('authenticated','public.cases','UPDATE');
  assert not has_table_privilege('authenticated','public.case_updates','INSERT');
  assert not has_table_privilege('authenticated','public.evidence_requests','INSERT');
end $$;

do $$ declare
  key text := current_setting('fixlens.test_evidence');
  request_id uuid := gen_random_uuid();
  target_id uuid;
  result jsonb;
begin
  select id into target_id from public.cases where case_key=key;
  perform pg_temp.must_fail(format('select public.request_case_evidence(%L,%L,%L)',key,request_id,'Clear photo please'),'22023');
  perform public.review_case(key);
  perform pg_temp.must_fail(format('select public.request_case_evidence(%L,%L,%L)',key,request_id,'   '),'22023');
  perform pg_temp.must_fail(format('select public.request_case_evidence(%L,%L,%L)',key,request_id,repeat('a',1001)),'22023');
  perform pg_temp.must_fail(format('select public.request_case_evidence(%L,null,%L)',key,'Clear photo please'),'22023');
  result := public.request_case_evidence(key,request_id,'  Clear photo please  ');
  assert result->>'outcome'='applied';
  result := public.request_case_evidence(key,request_id,'Clear photo please');
  assert result->>'outcome'='already_applied';
  result := public.request_case_evidence(key,gen_random_uuid(),'Different new request');
  assert result->>'outcome'='existing_request';
  perform pg_temp.must_fail(format('select public.request_case_evidence(%L,%L,%L)',key,request_id,'Changed retry text'),'22023');
  perform pg_temp.must_fail(format('select public.advance_case(%L,%L)',key,'request_approval'),'22023');
  assert (select status from public.cases where id=target_id)='under_review';
  assert (select count(*) from public.evidence_requests where case_id=target_id)=1;
  assert (select instruction from public.evidence_requests where id=request_id)='Clear photo please';
  assert (select count(*) from public.case_updates where case_id=target_id and update_type='evidence_requested')=1;
end $$;
reset role;
-- Historical requests remain valid. Simulate later resolution administratively,
-- solely inside this rolled-back test; no resolution API is introduced.
update public.evidence_requests set status='resolved',resolved_at=now()
where case_id=(select id from public.cases where case_key=current_setting('fixlens.test_evidence'));
set local role authenticated;
do $$ declare key text:=current_setting('fixlens.test_evidence'); old_request public.evidence_requests; result jsonb;
begin
  select * into old_request from public.evidence_requests where case_id=(select id from public.cases where case_key=key);
  result:=public.request_case_evidence(key,old_request.id,old_request.instruction);
  assert result->>'outcome'='already_applied';
  perform public.request_case_evidence(key,gen_random_uuid(),'A new historical-cycle request');
  assert (select count(*) from public.evidence_requests where case_id=old_request.case_id)=2;
  assert (select count(*) from public.evidence_requests where case_id=old_request.case_id and status='requested')=1;
end $$;
reset role;
rollback;
