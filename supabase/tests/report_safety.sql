-- Read/insert compatibility and isolation; all disposable writes roll back.
-- Normal two-photo completion remains a frontend + persistReportPhotos contract:
-- the existing database deliberately inserts a case BEFORE evidence upload.
begin;
set local role anon;
select set_config('request.headers','{"x-fixlens-demo-session":"b3333333-3333-4333-8333-333333333333"}',true);
insert into public.cases(case_key,demo_session_id,renter_id,property_id,handled_by,status,issue_type,description,safety_response)
values('demo-b3333333-3333-4333-8333-333333333333','b3333333-3333-4333-8333-333333333333','10000000-0000-4000-8000-000000000001','20000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000002','submitted','Safety test','Disposable rolled-back Batch 3 SQL test','Immediate danger reported');
do $$
declare target uuid;
begin
  select id into strict target from public.cases where case_key='demo-b3333333-3333-4333-8333-333333333333';
  if (select count(*) from public.evidence where case_id=target)<>0 then raise exception 'Unexpected evidence'; end if;
  if (select count(*) from public.case_updates where case_id=target and update_type='submitted')<>1 then raise exception 'Expected one submission activity'; end if;
  begin
    insert into public.cases(case_key,demo_session_id,renter_id,property_id,handled_by,status,issue_type,description,safety_response)
    values('demo-b3333333-3333-4333-8333-333333333333','b3333333-3333-4333-8333-333333333333','10000000-0000-4000-8000-000000000001','20000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000002','submitted','Safety test','Duplicate attempt','Immediate danger reported');
    raise exception 'Duplicate was accepted';
  exception when unique_violation then null;
  end;
end $$;
select set_config('request.headers','{"x-fixlens-demo-session":"b4444444-4444-4444-8444-444444444444"}',true);
do $$
begin
  if exists(select 1 from public.cases where case_key='demo-b3333333-3333-4333-8333-333333333333') then raise exception 'Cross-session read'; end if;
  begin
    insert into public.cases(case_key,demo_session_id,renter_id,property_id,handled_by,status,issue_type,description,safety_response)
    values('demo-b5555555-5555-4555-8555-555555555555','b3333333-3333-4333-8333-333333333333','10000000-0000-4000-8000-000000000001','20000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000002','submitted','Safety test','Wrong owner','Immediate danger reported');
    raise exception 'Cross-session write was accepted';
  exception when insufficient_privilege then null;
  end;
end $$;
set local role authenticated;
select set_config('request.jwt.claims','{"sub":"1c727326-27cd-4012-9201-c585817c9a7d","role":"authenticated"}',true);
do $$ begin
  if not exists(select 1 from public.cases where case_key='demo-b3333333-3333-4333-8333-333333333333' and safety_response='Immediate danger reported') then raise exception 'PM cannot see safety case'; end if;
end $$;
select 'PASS: safety insert, one activity, zero evidence, duplicate protection, ownership and PM visibility' result;
rollback;
