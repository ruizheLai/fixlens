-- Administrative runner: all fixtures and helper functions roll back.
begin;
select set_config('fixlens.resolve_case',gen_random_uuid()::text,true);
select set_config('fixlens.resolve_key','demo-'||gen_random_uuid(),true);
select set_config('fixlens.resolve_request',gen_random_uuid()::text,true);
select set_config('fixlens.resolve_second',gen_random_uuid()::text,true);
insert into public.cases(id,case_key,demo_session_id,renter_id,property_id,handled_by,issue_type,description,status)
values(current_setting('fixlens.resolve_case')::uuid,current_setting('fixlens.resolve_key'),'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
'10000000-0000-4000-8000-000000000001','20000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000002','Disposable resolution test','Original report unchanged','under_review');
insert into public.evidence_requests(id,case_id,instruction,status,submitted_at)
values(current_setting('fixlens.resolve_request')::uuid,current_setting('fixlens.resolve_case')::uuid,'First response','requested',null),
(current_setting('fixlens.resolve_second')::uuid,current_setting('fixlens.resolve_case')::uuid,'Second response','submitted',now());
create function pg_temp.resolve_request() returns jsonb language sql as $$
 select public.resolve_evidence_request(current_setting('fixlens.resolve_key'),current_setting('fixlens.resolve_request')::uuid);
$$;
create function pg_temp.must_fail(statement text, code text) returns void language plpgsql as $$
begin execute statement; raise exception 'Unexpected success';
exception when others then if sqlstate<>code then raise; end if; end $$;

set local role anon;
select set_config('request.headers','{"x-fixlens-demo-session":"aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa"}',true);
select pg_temp.must_fail('select pg_temp.resolve_request()','42501');
select pg_temp.must_fail('select fixlens_private.resolve_evidence_request(current_setting(''fixlens.resolve_key''),current_setting(''fixlens.resolve_request'')::uuid)','42501');
select pg_temp.must_fail('update public.evidence_requests set status=''resolved''','42501');
reset role;
set local role authenticated;
select set_config('request.jwt.claims','{"sub":"bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb","role":"authenticated"}',true);
select pg_temp.must_fail('select pg_temp.resolve_request()','42501');
select set_config('request.jwt.claims','{"sub":"1c727326-27cd-4012-9201-c585817c9a7d","role":"authenticated"}',true);
select pg_temp.must_fail('select pg_temp.resolve_request()','22023'); -- requested cannot resolve
select pg_temp.must_fail('select public.advance_case(current_setting(''fixlens.resolve_key''),''request_approval'')','22023');
select pg_temp.must_fail('select public.resolve_evidence_request(''kitchen-tap'',current_setting(''fixlens.resolve_request'')::uuid)','P0002');
select pg_temp.must_fail('update public.evidence_requests set status=''resolved''','42501');
reset role;
update public.evidence_requests set status='submitted',submitted_at=now() where id=current_setting('fixlens.resolve_request')::uuid;
set local role authenticated;
select pg_temp.must_fail('select pg_temp.resolve_request()','22023'); -- missing evidence
reset role;
insert into public.evidence(case_id,evidence_request_id,evidence_type,storage_path,annotation_data,created_by)
select case_id,id,'requested_photo','rollback-fixture/'||id||'.jpg','{"version":1,"width":400,"height":600,"annotations":[]}'::jsonb,'10000000-0000-4000-8000-000000000001'
from public.evidence_requests where case_id=current_setting('fixlens.resolve_case')::uuid;
update public.cases set status='completed' where id=current_setting('fixlens.resolve_case')::uuid;
set local role authenticated;
select pg_temp.must_fail('select pg_temp.resolve_request()','22023');
reset role;
update public.cases set status='under_review' where id=current_setting('fixlens.resolve_case')::uuid;
set local role authenticated;
do $$ declare first jsonb; again jsonb; held jsonb; begin
 perform pg_temp.must_fail('select public.advance_case(current_setting(''fixlens.resolve_key''),''request_approval'')','22023'); -- submitted blocks too
 held:=public.request_case_evidence(current_setting('fixlens.resolve_key'),gen_random_uuid(),'Must not create while submitted');
 assert held->>'outcome'='existing_request';
 first:=pg_temp.resolve_request(); assert first->>'outcome'='applied';
 again:=pg_temp.resolve_request(); assert again->>'outcome'='already_applied';
 assert (select status from cases where id=current_setting('fixlens.resolve_case')::uuid)='under_review';
 assert (select description from cases where id=current_setting('fixlens.resolve_case')::uuid)='Original report unchanged';
 assert (select status from evidence_requests where id=current_setting('fixlens.resolve_request')::uuid)='resolved';
 assert (select submitted_at is not null and resolved_at is not null from evidence_requests where id=current_setting('fixlens.resolve_request')::uuid);
 assert (select count(*) from case_updates where case_id=current_setting('fixlens.resolve_case')::uuid and message='Requested evidence reviewed.')=1;
 assert (select count(*) from evidence where case_id=current_setting('fixlens.resolve_case')::uuid)=2;
 perform pg_temp.must_fail('select public.advance_case(current_setting(''fixlens.resolve_key''),''request_approval'')','22023'); -- second unresolved blocks
 perform public.resolve_evidence_request(current_setting('fixlens.resolve_key'),current_setting('fixlens.resolve_second')::uuid);
 assert (select count(*) from case_updates where case_id=current_setting('fixlens.resolve_case')::uuid and message='Requested evidence reviewed.')=2;
 held:=public.request_case_evidence(current_setting('fixlens.resolve_key'),gen_random_uuid(),'New historical cycle');
 assert held->>'outcome'='applied';
 perform pg_temp.must_fail('select public.advance_case(current_setting(''fixlens.resolve_key''),''request_approval'')','22023');
end $$;
reset role;
delete from public.evidence_requests where case_id=current_setting('fixlens.resolve_case')::uuid and status='requested';
set local role authenticated;
do $$ declare advanced jsonb; begin
 advanced:=public.advance_case(current_setting('fixlens.resolve_key'),'request_approval');
 assert advanced->>'outcome'='applied';
 assert (select status from cases where id=current_setting('fixlens.resolve_case')::uuid)='awaiting_approval';
 assert pg_temp.resolve_request()->>'outcome'='already_applied';
 assert (select count(*) from case_updates where case_id=current_setting('fixlens.resolve_case')::uuid and message='Requested evidence reviewed.')=2;
 perform pg_temp.must_fail('update public.evidence_requests set status=''submitted''','42501');
 perform pg_temp.must_fail('update public.evidence_requests set status=''requested''','42501');
end $$;
reset role;
rollback;
