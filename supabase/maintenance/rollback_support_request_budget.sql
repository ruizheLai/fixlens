-- REVIEW ONLY. Stop support traffic first; run only after separate live approval.
-- Intentionally no CASCADE. A dependency or unexpected object must stop rollback.
begin;
revoke all on function public.consume_support_budget(integer,integer) from service_role;
drop function public.consume_support_budget(integer,integer);
revoke all on function fixlens_support_private.consume_support_budget(integer,integer) from service_role;
revoke usage on schema fixlens_support_private from service_role;
drop function fixlens_support_private.consume_support_budget(integer,integer);
drop table fixlens_support_private.request_budget;
drop schema fixlens_support_private;
commit;
