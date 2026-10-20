-- PREPARED ONLY. Separate approval required for BOTH the status correction
-- and removal of the single final demo completion event. NOT a migration.
-- Target project: ycnilqoqtgjmptxzuhty (FixLens).
-- Run as database administrator, not through a browser or PM workflow RPC.
-- Save the returned updated_at for the guarded rollback. Do not reseed.
begin;
set local lock_timeout = '5s';
set local statement_timeout = '15s';

do $$
declare
  target public.cases;
  affected integer;
begin
  select * into target from public.cases
  where id = '30000000-0000-4000-8000-000000000001' for update;
  if not found then raise exception 'Target missing'; end if;
  if target.case_key is distinct from 'bedroom-window-leak'
    or target.property_id is distinct from '20000000-0000-4000-8000-000000000001'::uuid
    or target.renter_id is distinct from '10000000-0000-4000-8000-000000000001'::uuid
    or target.handled_by is distinct from '10000000-0000-4000-8000-000000000002'::uuid
    or target.demo_session_id is not null
    or target.status is distinct from 'completed'
    or target.updated_at is distinct from '2026-10-02T04:42:27.625203Z'::timestamptz
    or target.issue_type is distinct from 'Water leak'
    or target.location is distinct from 'Bedroom window'
    or target.description is distinct from 'Water enters through the bedroom window frame during rain.'
  then raise exception 'Target differs from reviewed snapshot; stop'; end if;

  perform 1 from public.case_updates where case_id = target.id for update;
  if (select array_agg(id order by id) from public.case_updates where case_id = target.id)
    is distinct from array[
      '2b621994-755e-401a-9ced-094f9fcb505b'::uuid,
      '50000000-0000-4000-8000-000000000001'::uuid,
      '50000000-0000-4000-8000-000000000002'::uuid,
      'abc4c794-67a8-49c5-9fd3-85d340cf20b1'::uuid,
      'bbdc6bce-6285-4cca-b6b2-e518ee81823e'::uuid
    ]
    or not exists (select 1 from public.case_updates
      where id = 'abc4c794-67a8-49c5-9fd3-85d340cf20b1'
        and case_id = target.id and update_type = 'repair_scheduled'
        and message = 'Repair scheduled.'
        and created_at = '2026-10-02T04:42:14.694568Z'::timestamptz)
    or exists (select 1 from public.evidence where case_id = target.id)
    or exists (select 1 from public.evidence_requests where case_id = target.id)
  then raise exception 'Related data differs from reviewed snapshot; stop'; end if;

  delete from public.case_updates
  where id = 'bbdc6bce-6285-4cca-b6b2-e518ee81823e'
    and case_id = target.id and update_type = 'completed'
    and message = 'Repair marked completed.'
    and created_by = '10000000-0000-4000-8000-000000000002'
    and created_at = '2026-10-02T04:42:27.625203Z'::timestamptz;
  get diagnostics affected = row_count;
  if affected <> 1 then raise exception 'Completion snapshot mismatch'; end if;

  update public.cases set status = 'repair_scheduled' where id = target.id;
  get diagnostics affected = row_count;
  if affected <> 1 then raise exception 'Expected exactly one case update'; end if;
  -- Existing trigger sets updated_at to this transaction's timestamp.
  -- No new case_update, request, appointment or contractor is created.
end $$;

select id, case_key, demo_session_id, status, updated_at
from public.cases where id = '30000000-0000-4000-8000-000000000001';
commit;
-- Re-execution aborts on the snapshot guard rather than changing anything.
