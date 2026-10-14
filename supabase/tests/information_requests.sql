-- Run after the additive migration, with the existing exhibition PM Auth link.
-- Disposable transaction only. Does not touch canonical cases or real Storage.
begin;
select set_config('fixlens.info_case',gen_random_uuid()::text,true);
select set_config('fixlens.info_key','demo-'||gen_random_uuid()::text,true);
select set_config('fixlens.info_request',gen_random_uuid()::text,true);
insert into public.cases(id,case_key,property_id,renter_id,handled_by,demo_session_id,issue_type,description,status)
values(current_setting('fixlens.info_case')::uuid,current_setting('fixlens.info_key'),
'20000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000002',
'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','Test issue','Original report unchanged','under_review');
create function pg_temp.must_fail(statement text,code text) returns void language plpgsql as $$
begin execute statement;raise exception 'Unexpected success';exception when others then if sqlstate<>code then raise;end if;end $$;
set local role anon;
select set_config('request.headers','{"x-fixlens-demo-session":"aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa"}',true);
select pg_temp.must_fail('select public.request_case_information(current_setting(''fixlens.info_key''),gen_random_uuid(),''Question'',''written_details'')','42501');
select pg_temp.must_fail('select public.resolve_evidence_request(current_setting(''fixlens.info_key''),current_setting(''fixlens.info_request'')::uuid)','42501');
reset role;
set local role authenticated;
select set_config('request.jwt.claims','{"sub":"bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb","role":"authenticated"}',true);
select pg_temp.must_fail('select public.request_case_information(current_setting(''fixlens.info_key''),gen_random_uuid(),''Question'',''written_details'')','42501');
select set_config('request.jwt.claims','{"sub":"1c727326-27cd-4012-9201-c585817c9a7d","role":"authenticated"}',true);
do $$ declare result jsonb;begin
  perform pg_temp.must_fail('select public.request_case_information(current_setting(''fixlens.info_key''),gen_random_uuid(),''Question'',''invalid'')','22023');
  perform pg_temp.must_fail('select public.request_case_information(current_setting(''fixlens.info_key''),gen_random_uuid(),E''\n\t '',''written_details'')','22023');
  result:=public.request_case_information(current_setting('fixlens.info_key'),current_setting('fixlens.info_request')::uuid,'When did it start?','written_details');
  assert result->>'outcome'='applied';
  assert public.request_case_information(current_setting('fixlens.info_key'),current_setting('fixlens.info_request')::uuid,'When did it start?','written_details')->>'outcome'='already_applied';
  assert public.request_case_information(current_setting('fixlens.info_key'),gen_random_uuid(),'Another question','overview_photo')->>'outcome'='existing_request';
  assert (select count(*) from evidence_requests where case_id=current_setting('fixlens.info_case')::uuid)=1;
  assert (select count(*) from case_updates where case_id=current_setting('fixlens.info_case')::uuid and update_type='evidence_requested')=1;
  perform pg_temp.must_fail('select public.request_case_information(current_setting(''fixlens.info_key''),current_setting(''fixlens.info_request'')::uuid,''When did it start?'',''closeup_photo'')','22023');
  perform pg_temp.must_fail('select public.advance_case(current_setting(''fixlens.info_key''),''request_approval'')','22023');
  perform pg_temp.must_fail('select public.resolve_evidence_request(current_setting(''fixlens.info_key''),current_setting(''fixlens.info_request'')::uuid)','22023');
end $$;
reset role;
set local role anon;
select set_config('request.headers','{"x-fixlens-demo-session":"cccccccc-cccc-4ccc-8ccc-cccccccccccc"}',true);
do $$ begin
  assert (select count(*) from evidence_requests where id=current_setting('fixlens.info_request')::uuid)=0;
  perform pg_temp.must_fail('select public.submit_requested_details(current_setting(''fixlens.info_request'')::uuid,''Wrong visitor'')','42501');
end $$;
select set_config('request.headers','{"x-fixlens-demo-session":"aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa"}',true);
do $$ declare original text:=E'  Three days ago.\nIt happens every time.  ';begin
  perform pg_temp.must_fail('select public.submit_requested_details(current_setting(''fixlens.info_request'')::uuid,E'' \n\t'')','22023');
  perform pg_temp.must_fail('select public.submit_requested_details(current_setting(''fixlens.info_request'')::uuid,repeat(''a'',4001))','22023');
  perform pg_temp.must_fail('select public.submit_requested_evidence(current_setting(''fixlens.info_request'')::uuid,gen_random_uuid(),''{}''::jsonb)','22023');
  assert public.submit_requested_details(current_setting('fixlens.info_request')::uuid,original)->>'outcome'='submitted';
  assert public.submit_requested_details(current_setting('fixlens.info_request')::uuid,original)->>'outcome'='already_submitted';
  assert (select response_text from evidence_requests where id=current_setting('fixlens.info_request')::uuid)=original;
  assert (select submitted_at is not null from evidence_requests where id=current_setting('fixlens.info_request')::uuid);
  assert (select count(*) from evidence where case_id=current_setting('fixlens.info_case')::uuid)=0;
  assert (select count(*) from case_updates where case_id=current_setting('fixlens.info_case')::uuid and update_type='evidence_submitted')=1;
  perform pg_temp.must_fail('select public.submit_requested_details(current_setting(''fixlens.info_request'')::uuid,''Changed wording'')','22023');
  perform pg_temp.must_fail('update public.evidence_requests set request_type=''overview_photo''','42501');
end $$;
select set_config('request.headers','{"x-fixlens-demo-session":"cccccccc-cccc-4ccc-8ccc-cccccccccccc"}',true);
do $$ begin assert (select count(*) from evidence_requests where response_text is not null and case_id=current_setting('fixlens.info_case')::uuid)=0; end $$;
reset role;
set local role authenticated;
select pg_temp.must_fail('select public.advance_case(current_setting(''fixlens.info_key''),''request_approval'')','22023');
do $$ begin
  assert public.resolve_evidence_request(current_setting('fixlens.info_key'),current_setting('fixlens.info_request')::uuid)->>'outcome'='applied';
  assert public.resolve_evidence_request(current_setting('fixlens.info_key'),current_setting('fixlens.info_request')::uuid)->>'outcome'='already_applied';
  assert (select count(*) from case_updates where case_id=current_setting('fixlens.info_case')::uuid and message='Written details reviewed.')=1;
  assert (select status from cases where id=current_setting('fixlens.info_case')::uuid)='under_review';
  assert (select description from cases where id=current_setting('fixlens.info_case')::uuid)='Original report unchanged';
end $$;
reset role;
set local role anon;
select set_config('request.headers','{"x-fixlens-demo-session":"aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa"}',true);
select public.submit_requested_details(current_setting('fixlens.info_request')::uuid,E'  Three days ago.\nIt happens every time.  ');
reset role;

-- Each new photo type reuses the immutable upload/annotation RPC and resolution.
do $$ declare kind text; rid uuid; eid uuid; meta jsonb:='{"version":1,"width":400,"height":600,"annotations":[]}';begin
  foreach kind in array array['overview_photo','closeup_photo'] loop
    rid:=gen_random_uuid();eid:=gen_random_uuid();
    set local role authenticated;
    assert public.request_case_information(current_setting('fixlens.info_key'),rid,'Show the area',kind)->>'outcome'='applied';
    reset role;
    insert into storage.objects(bucket_id,name) values('case-evidence','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa/'||current_setting('fixlens.info_case')||'/'||eid||'.jpg');
    set local role anon;
    perform pg_temp.must_fail(format('select public.submit_requested_details(%L::uuid,''Wrong response type'')',rid),'22023');
    assert public.submit_requested_evidence(rid,eid,meta)->>'outcome'='submitted';
    assert public.submit_requested_evidence(rid,eid,meta)->>'outcome'='already_submitted';
    reset role;
    set local role authenticated;
    assert public.resolve_evidence_request(current_setting('fixlens.info_key'),rid)->>'outcome'='applied';
    assert public.resolve_evidence_request(current_setting('fixlens.info_key'),rid)->>'outcome'='already_applied';
    reset role;
    assert (select request_type from public.evidence_requests where id=rid)=kind;
    assert (select count(*) from public.evidence where evidence_request_id=rid)=1;
    assert (select status from public.cases where id=current_setting('fixlens.info_case')::uuid)='under_review';
  end loop;
end $$;
update public.cases set status='completed' where id=current_setting('fixlens.info_case')::uuid;
set local role authenticated;
select pg_temp.must_fail('select public.request_case_information(current_setting(''fixlens.info_key''),gen_random_uuid(),''Question'',''written_details'')','22023');
reset role;
do $$ begin
 assert (select request_type from public.evidence_requests where id='40000000-0000-4000-8000-000000000001')='legacy_photo';
 assert (select response_text is null from public.evidence_requests where id='40000000-0000-4000-8000-000000000001');
end $$;
rollback;
