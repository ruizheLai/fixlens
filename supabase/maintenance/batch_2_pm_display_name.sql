-- PREPARED ONLY: explicit owner approval required before running against live.
-- Target: existing FixLens project ycnilqoqtgjmptxzuhty.
-- Data update, not a schema migration. Do not alter renter/seed ownership/Auth.
begin;
do $$
declare manager public.profiles;
begin
  select * into manager from public.profiles
  where id='10000000-0000-4000-8000-000000000002' for update;
  if not found or manager.role<>'property_manager'
    or manager.auth_user_id is distinct from '1c727326-27cd-4012-9201-c585817c9a7d'::uuid
    or manager.agency_name is distinct from 'Apex Rentals'
    or manager.name not in ('Sarah Chen','Brad Lai') then
    raise exception 'Unexpected PM profile; stop and review';
  end if;
  update public.profiles set name='Brad Lai' where id=manager.id and name='Sarah Chen';
end $$;
select id,name,role,agency_name,auth_user_id from public.profiles
where id='10000000-0000-4000-8000-000000000002';
commit;
-- Recovery, if separately approved: restore this same profile name to Sarah Chen.
-- No credentials, assignments, policies, activities or other profile fields change.
