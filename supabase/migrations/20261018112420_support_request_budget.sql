-- LOCAL REVIEW ONLY. Additive and isolated from case/auth/storage objects.
begin;
-- Fail on an unexpected existing schema rather than changing its permissions.
create schema fixlens_support_private authorization postgres;
revoke all on schema fixlens_support_private from public, anon, authenticated, service_role;
create table fixlens_support_private.request_budget (
  singleton boolean primary key default true check (singleton),
  minute_start timestamptz not null,
  day_start timestamptz not null,
  minute_count integer not null default 0 check (minute_count >= 0),
  day_count integer not null default 0 check (day_count >= 0)
);
alter table fixlens_support_private.request_budget enable row level security;
alter table fixlens_support_private.request_budget owner to postgres;
revoke all on fixlens_support_private.request_budget from public, anon, authenticated, service_role;
insert into fixlens_support_private.request_budget(singleton, minute_start, day_start)
values (true, '-infinity', '-infinity');

create function fixlens_support_private.consume_support_budget(p_minute_limit integer, p_day_limit integer)
returns jsonb
language plpgsql security definer
set search_path = pg_catalog
set lock_timeout = '2s'
set statement_timeout = '3s'
as $$
declare
  budget fixlens_support_private.request_budget%rowtype;
  at_time timestamptz;
  minute_window timestamptz;
  day_window timestamptz;
  wait_seconds integer := 0;
begin
  -- GRANT is the primary boundary; this also rejects accidental broader grants.
  if current_setting('role', true) is distinct from 'service_role' then
    raise insufficient_privilege using message = 'Server budget access only';
  end if;
  if p_minute_limit is null or p_day_limit is null or p_minute_limit not between 1 and 120 or p_day_limit not between 1 and 3000 then
    raise invalid_parameter_value using message = 'Invalid support budget limits';
  end if;
  select * into strict budget from fixlens_support_private.request_budget where singleton = true for update;
  -- Compute clock AFTER lock acquisition, never from a client timestamp or transaction start.
  at_time := clock_timestamp();
  minute_window := date_trunc('minute', at_time at time zone 'UTC') at time zone 'UTC';
  day_window := date_trunc('day', at_time at time zone 'UTC') at time zone 'UTC';
  if budget.minute_start <> minute_window then budget.minute_start := minute_window; budget.minute_count := 0; end if;
  if budget.day_start <> day_window then budget.day_start := day_window; budget.day_count := 0; end if;
  if budget.minute_count >= p_minute_limit then wait_seconds := greatest(wait_seconds, ceil(extract(epoch from minute_window + interval '1 minute' - at_time))::integer); end if;
  if budget.day_count >= p_day_limit then wait_seconds := greatest(wait_seconds, ceil(extract(epoch from day_window + interval '1 day' - at_time))::integer); end if;
  if wait_seconds = 0 then budget.minute_count := budget.minute_count + 1; budget.day_count := budget.day_count + 1; end if;
  update fixlens_support_private.request_budget
  set minute_start=budget.minute_start, day_start=budget.day_start, minute_count=budget.minute_count, day_count=budget.day_count
  where singleton=true;
  return jsonb_build_object('allowed', wait_seconds=0, 'retry_after', wait_seconds);
end;
$$;
alter function fixlens_support_private.consume_support_budget(integer,integer) owner to postgres;
revoke all on function fixlens_support_private.consume_support_budget(integer,integer) from public, anon, authenticated, service_role;
grant usage on schema fixlens_support_private to service_role;
grant execute on function fixlens_support_private.consume_support_budget(integer,integer) to service_role;

-- Stable PostgREST entry point; no elevated privileges in the exposed schema.
create function public.consume_support_budget(p_minute_limit integer default 30, p_day_limit integer default 300)
returns jsonb
language sql security invoker
set search_path = pg_catalog
as $$
  select fixlens_support_private.consume_support_budget(p_minute_limit, p_day_limit);
$$;
alter function public.consume_support_budget(integer,integer) owner to postgres;
revoke all on function public.consume_support_budget(integer,integer) from public, anon, authenticated, service_role;
grant execute on function public.consume_support_budget(integer,integer) to service_role;
commit;
