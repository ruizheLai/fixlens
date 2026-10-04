-- Administrative runner; fixtures, messages and helpers roll back.
begin;
select set_config('fixlens.live_case', gen_random_uuid()::text, true);
select set_config('fixlens.live_key', 'demo-' || gen_random_uuid(), true);
insert into public.cases(id,case_key,demo_session_id,renter_id,property_id,handled_by,issue_type,description,status)
values(current_setting('fixlens.live_case')::uuid,current_setting('fixlens.live_key'),'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
'10000000-0000-4000-8000-000000000001','20000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000002','Rollback notification test','Private content must not be broadcast','submitted');
create function pg_temp.check_signal(expected integer) returns void language plpgsql as $$
begin
  assert (select count(*) from realtime.messages where topic='fixlens:pm:case:'||current_setting('fixlens.live_key'))=expected;
end $$;
do $$ begin
  assert not exists(select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public');
  assert not has_function_privilege('anon','fixlens_private.notify_pm_invalidation()','EXECUTE');
  assert not has_function_privilege('authenticated','fixlens_private.notify_pm_invalidation()','EXECUTE');
  assert (select count(*) from pg_policies where schemaname='realtime' and tablename='messages')=1;
  -- Case creation also creates the existing initial activity event.
  perform pg_temp.check_signal(2);
  assert (select bool_and(private and event='invalidate' and extension='broadcast' and payload - 'id'='{}'::jsonb)
    from realtime.messages where topic='fixlens:pm:case:'||current_setting('fixlens.live_key'));
end $$;
select set_config('realtime.topic','fixlens:pm:case:'||current_setting('fixlens.live_key'),true);
set local role anon;
select pg_temp.check_signal(0);
reset role;
set local role authenticated;
select set_config('request.jwt.claims','{"sub":"bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb","role":"authenticated"}',true);
select pg_temp.check_signal(0);
select set_config('request.jwt.claims','{"sub":"1c727326-27cd-4012-9201-c585817c9a7d","role":"authenticated"}',true);
select pg_temp.check_signal(2);
select set_config('realtime.topic','fixlens:pm:case:other',true);
select pg_temp.check_signal(0);
reset role;
rollback;
