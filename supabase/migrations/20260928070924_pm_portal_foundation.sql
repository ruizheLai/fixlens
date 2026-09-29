begin;

alter table public.profiles add column auth_user_id uuid unique references auth.users(id) on delete set null;
-- Link the existing exhibition account administratively after applying this
-- migration. Never infer authorization from user-editable Auth metadata.
create function fixlens_private.pm_profile_id() returns uuid
language sql stable security definer set search_path = '' as $$
  select id from public.profiles
  where auth_user_id = (select auth.uid()) and role = 'property_manager'
    and auth.uid() is not null;
$$;
revoke all on function fixlens_private.pm_profile_id() from public, anon, authenticated;
grant usage on schema fixlens_private to authenticated;
grant execute on function fixlens_private.pm_profile_id() to authenticated;

create policy pm_read_cases on public.cases for select to authenticated
using ((select fixlens_private.pm_profile_id()) is not null);
create policy pm_read_profiles on public.profiles for select to authenticated
using ((select fixlens_private.pm_profile_id()) is not null);
create policy pm_read_properties on public.properties for select to authenticated
using ((select fixlens_private.pm_profile_id()) is not null);
-- Child SELECT policies already follow RLS-visible cases.
create policy pm_read_photo_object on storage.objects for select to authenticated
using (bucket_id = 'case-evidence'
  and (select fixlens_private.pm_profile_id()) is not null
  and exists (select 1 from public.evidence e where e.storage_path = objects.name));

-- A narrowly authorized definer is necessary: browser roles retain no direct
-- case UPDATE or activity INSERT privilege. The public RPC is an invoker wrapper.
create function fixlens_private.review_case(p_case_key text) returns public.cases
language plpgsql security definer set search_path = '' as $$
declare
  manager_id uuid;
  target public.cases;
begin
  manager_id := fixlens_private.pm_profile_id();
  if manager_id is null then
    raise exception 'Property manager access required' using errcode = '42501';
  end if;
  select * into target from public.cases where case_key = p_case_key for update;
  if not found then raise exception 'Case not found' using errcode = 'P0002'; end if;
  if target.status = 'under_review' then return target; end if;
  if target.status <> 'submitted' then
    raise exception 'Only submitted cases can start review' using errcode = '22023';
  end if;
  update public.cases set status = 'under_review' where id = target.id returning * into target;
  insert into public.case_updates (case_id, update_type, message, created_by)
  values (target.id, 'review_started', 'Property manager started reviewing the report.', manager_id);
  return target;
end;
$$;
revoke all on function fixlens_private.review_case(text) from public, anon, authenticated;
grant execute on function fixlens_private.review_case(text) to authenticated;
create function public.review_case(p_case_key text) returns public.cases
language sql security invoker set search_path = '' as $$
  select * from fixlens_private.review_case(p_case_key);
$$;
revoke all on function public.review_case(text) from public, anon, authenticated;
grant execute on function public.review_case(text) to authenticated;
commit;
