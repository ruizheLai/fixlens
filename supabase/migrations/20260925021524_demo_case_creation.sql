-- Temporary exhibition isolation, not authentication. Seed read policies remain.
create policy visitor_read_cases on public.cases
for select to anon, authenticated
using (
  demo_session_id is not null
  and demo_session_id = (select nullif(current_setting('request.headers', true), '')::jsonb ->> 'x-fixlens-demo-session')
);

grant insert (case_key, property_id, renter_id, demo_session_id, issue_type,
  location, description, condition, safety_response, status, handled_by)
on public.cases to anon, authenticated;
revoke update, delete on public.cases from anon, authenticated;

create policy visitor_create_case on public.cases
for insert to anon, authenticated
with check (
  demo_session_id is not null
  and demo_session_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
  and demo_session_id = (select nullif(current_setting('request.headers', true), '')::jsonb ->> 'x-fixlens-demo-session')
  and status = 'submitted'
  and renter_id = '10000000-0000-4000-8000-000000000001'::uuid
  and property_id = '20000000-0000-4000-8000-000000000001'::uuid
  and handled_by = '10000000-0000-4000-8000-000000000002'::uuid
  and case_key is not null
  and case_key ~ '^demo-[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
  and length(btrim(issue_type)) > 0
  and length(btrim(description)) > 0
);

create schema if not exists fixlens_private;
revoke all on schema fixlens_private from public, anon, authenticated;

-- Internal trigger only: the case and its initial activity commit atomically.
create function fixlens_private.record_case_submission()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.case_updates (case_id, update_type, message, created_by, created_at)
  values (new.id, 'submitted', 'Maintenance report submitted.', new.renter_id, new.created_at);
  return new;
end;
$$;
revoke all on function fixlens_private.record_case_submission() from public, anon, authenticated;

create trigger record_visitor_case_submission
after insert on public.cases
for each row when (new.demo_session_id is not null)
execute function fixlens_private.record_case_submission();

-- Existing case_updates SELECT uses EXISTS on the RLS-visible parent case.
-- No browser writes to activity, evidence or evidence requests are granted.
