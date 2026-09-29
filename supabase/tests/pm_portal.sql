-- Run administratively against a migrated exhibition database. All test changes
-- roll back. Claims simulate PostgREST roles; browser tests also exercise Auth.
begin;
select set_config('fixlens.test_key', 'demo-' || gen_random_uuid()::text, true);
insert into public.cases(case_key, demo_session_id, renter_id, property_id, handled_by, issue_type, description, status)
values (current_setting('fixlens.test_key'), 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
 '10000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000001',
 '10000000-0000-4000-8000-000000000002', 'Disposable PM policy test', 'Rolled back after assertions', 'submitted');

set local role anon;
select set_config('request.headers', '{"x-fixlens-demo-session":"bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb"}', true);
do $$ begin
  if exists (select 1 from public.cases where case_key = current_setting('fixlens.test_key')) then raise exception 'Cross-session leak'; end if;
  begin
    perform public.review_case(current_setting('fixlens.test_key'));
    raise exception 'Anon review allowed';
  exception when insufficient_privilege then null; end;
end $$;
select set_config('request.headers', '{"x-fixlens-demo-session":"aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa"}', true);
do $$ begin
  if not exists (select 1 from public.cases where case_key = current_setting('fixlens.test_key')) then raise exception 'Own session hidden'; end if;
end $$;
reset role;

set local role authenticated;
select set_config('request.headers', '{}', true);
select set_config('request.jwt.claims', '{"sub":"bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb","role":"authenticated"}', true);
do $$ begin
  if fixlens_private.pm_profile_id() is not null then raise exception 'Unlinked PM allowed'; end if;
  if exists (select 1 from public.cases where case_key = current_setting('fixlens.test_key')) then raise exception 'Unlinked user saw visitor case'; end if;
  begin
    perform public.review_case(current_setting('fixlens.test_key'));
    raise exception 'Unlinked review allowed';
  exception when insufficient_privilege then null; end;
end $$;
reset role;
select set_config('request.jwt.claims', jsonb_build_object('sub', auth_user_id, 'role', 'authenticated')::text, true)
from public.profiles where id = '10000000-0000-4000-8000-000000000002';
set local role authenticated;
do $$ declare result public.cases; begin
  if not exists (select 1 from public.cases where case_key = current_setting('fixlens.test_key')) then raise exception 'PM cannot read visitor case'; end if;
  result := public.review_case(current_setting('fixlens.test_key'));
  if result.status <> 'under_review' then raise exception 'Review transition failed'; end if;
  perform public.review_case(current_setting('fixlens.test_key'));
  if (select count(*) from public.case_updates where case_id = result.id and update_type = 'review_started') <> 1 then raise exception 'Duplicate review event'; end if;
  begin
    perform public.review_case('hot-water');
    raise exception 'Completed review allowed';
  exception when invalid_parameter_value then null; end;
  begin
    perform public.review_case('bedroom-window-leak');
    raise exception 'Awaiting approval review allowed';
  exception when invalid_parameter_value then null; end;
  begin
    delete from public.cases where id = result.id;
    raise exception 'PM DELETE allowed';
  exception when insufficient_privilege then null; end;
  begin
    update public.cases set status = 'completed' where id = result.id;
    raise exception 'Direct PM UPDATE allowed';
  exception when insufficient_privilege then null; end;
end $$;
reset role;
rollback;
