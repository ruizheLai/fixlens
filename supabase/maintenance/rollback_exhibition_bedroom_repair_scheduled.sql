-- PREPARED ONLY. Separate approval required. Project ycnilqoqtgjmptxzuhty.
-- Replace the placeholder with updated_at returned by the approved apply.
-- If any intervening case activity exists, STOP and review instead.
begin;
set local lock_timeout = '5s';
set local statement_timeout = '15s';
do $$
declare
  applied_updated_at timestamptz := 'REPLACE_WITH_APPLY_RETURNED_UPDATED_AT';
  target public.cases;
begin
  select * into target from public.cases
  where id = '30000000-0000-4000-8000-000000000001' for update;
  if not found then raise exception 'Target missing'; end if;
  if target.case_key is distinct from 'bedroom-window-leak'
    or target.property_id is distinct from '20000000-0000-4000-8000-000000000001'::uuid
    or target.demo_session_id is not null
    or target.status is distinct from 'repair_scheduled'
    or target.updated_at is distinct from applied_updated_at
  then raise exception 'Target has changed; stop'; end if;
  perform 1 from public.case_updates where case_id = target.id for update;
  if (select array_agg(id order by id) from public.case_updates where case_id = target.id)
    is distinct from array[
      '2b621994-755e-401a-9ced-094f9fcb505b'::uuid,
      '50000000-0000-4000-8000-000000000001'::uuid,
      '50000000-0000-4000-8000-000000000002'::uuid,
      'abc4c794-67a8-49c5-9fd3-85d340cf20b1'::uuid
    ]
    or exists (select 1 from public.evidence where case_id = target.id)
    or exists (select 1 from public.evidence_requests where case_id = target.id)
  then raise exception 'Related data changed; stop'; end if;
  insert into public.case_updates(id, case_id, update_type, message, created_by, created_at)
  values ('bbdc6bce-6285-4cca-b6b2-e518ee81823e', target.id, 'completed',
    'Repair marked completed.', '10000000-0000-4000-8000-000000000002',
    '2026-10-02T04:42:27.625203Z');
  update public.cases set status = 'completed' where id = target.id;
end $$;
select id, status, updated_at from public.cases
where id = '30000000-0000-4000-8000-000000000001';
commit;
-- Restores the exact completion event and lifecycle, but updated_at correctly
-- reflects rollback execution time; the existing timestamp trigger stays enabled.
