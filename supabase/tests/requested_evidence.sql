-- Administrative runner. Object metadata is a rollback-only fixture, not an uploaded file.
begin;
select set_config('fixlens.response_case',gen_random_uuid()::text,true);
select set_config('fixlens.response_request',gen_random_uuid()::text,true);
select set_config('fixlens.response_photo',gen_random_uuid()::text,true);
insert into public.cases(id,case_key,demo_session_id,renter_id,property_id,handled_by,issue_type,description,status)
values(current_setting('fixlens.response_case')::uuid,'demo-'||gen_random_uuid(),'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
'10000000-0000-4000-8000-000000000001','20000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000002','Disposable response test','Original report unchanged','under_review');
insert into public.evidence_requests(id,case_id,instruction,status)
values(current_setting('fixlens.response_request')::uuid,current_setting('fixlens.response_case')::uuid,'One photo beneath the fixture','requested');
create function pg_temp.respond(photo uuid default current_setting('fixlens.response_photo')::uuid, metadata jsonb default '{"version":1,"width":600,"height":400,"annotations":[{"tool":"circle","points":[{"x":0.2,"y":0.3},{"x":0.5,"y":0.6}]}]}') returns jsonb language sql as $$
select public.submit_requested_evidence(current_setting('fixlens.response_request')::uuid,photo,metadata);
$$;
create function pg_temp.must_fail(statement text, code text) returns void language plpgsql as $$
begin execute statement; raise exception 'Unexpected success';
exception when others then if sqlstate<>code then raise; end if; end $$;

set local role anon;
select set_config('request.headers','{}',true);
select pg_temp.must_fail('select pg_temp.respond()','42501');
select set_config('request.headers','{"x-fixlens-demo-session":"bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb"}',true);
select pg_temp.must_fail('select pg_temp.respond()','42501');
do $$ begin
 assert not exists(select 1 from cases where id=current_setting('fixlens.response_case')::uuid);
 assert not exists(select 1 from evidence_requests where id=current_setting('fixlens.response_request')::uuid);
 assert not has_table_privilege('anon','public.evidence_requests','UPDATE');
 assert not has_function_privilege('anon','public.advance_case(text,text)','EXECUTE');
end $$;
reset role;
set local role authenticated;
select set_config('request.jwt.claims','{"sub":"bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb","role":"authenticated"}',true);
select pg_temp.must_fail('select pg_temp.respond()','42501');
select pg_temp.must_fail('select public.advance_case(''missing'',''request_approval'')','42501');
reset role;
set local role anon;
select set_config('request.headers','{"x-fixlens-demo-session":"aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa"}',true);
select pg_temp.must_fail('select pg_temp.respond()','22023'); -- no object yet
select pg_temp.must_fail('select pg_temp.respond(null)','22023');
select pg_temp.must_fail('select pg_temp.respond(current_setting(''fixlens.response_photo'')::uuid,''{}'')','22023');
reset role;
insert into storage.objects(bucket_id,name) values('case-evidence','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa/'||current_setting('fixlens.response_case')||'/'||current_setting('fixlens.response_photo')||'.jpg');
set local role anon;
do $$ declare first jsonb; again jsonb; begin
 first:=pg_temp.respond(); assert first->>'outcome'='submitted';
 again:=pg_temp.respond(); assert again->>'outcome'='already_submitted';
 assert (select status from cases where id=current_setting('fixlens.response_case')::uuid)='under_review';
 assert (select description from cases where id=current_setting('fixlens.response_case')::uuid)='Original report unchanged';
 assert (select status from evidence_requests where id=current_setting('fixlens.response_request')::uuid)='submitted';
 assert (select submitted_at is not null and resolved_at is null from evidence_requests where id=current_setting('fixlens.response_request')::uuid);
 assert (select count(*) from evidence where evidence_request_id=current_setting('fixlens.response_request')::uuid and case_id=current_setting('fixlens.response_case')::uuid)=1;
 assert (select count(*) from case_updates where case_id=current_setting('fixlens.response_case')::uuid and update_type='evidence_submitted')=1;
 perform pg_temp.must_fail('select pg_temp.respond(gen_random_uuid())','22023');
 perform pg_temp.must_fail('update public.evidence_requests set status=''resolved''','42501');
end $$;
select set_config('request.headers','{"x-fixlens-demo-session":"bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb"}',true);
select pg_temp.must_fail('select pg_temp.respond()','42501');
do $$ begin assert not exists(select 1 from evidence where evidence_request_id=current_setting('fixlens.response_request')::uuid); end $$;
reset role;
select set_config('request.headers','{}',true);
select set_config('request.jwt.claims',jsonb_build_object('sub',auth_user_id,'role','authenticated')::text,true) from profiles where id='10000000-0000-4000-8000-000000000002';
set local role authenticated;
do $$ begin assert (select count(*) from evidence where evidence_request_id=current_setting('fixlens.response_request')::uuid)=1; end $$;
select pg_temp.must_fail('select pg_temp.respond()','42501'); -- PM Auth is not renter ownership
reset role;
rollback;
