begin;

-- Explicit activity names let retries find the action even after later stages.
alter table public.case_updates drop constraint case_updates_update_type_check;
alter table public.case_updates add constraint case_updates_update_type_check
check (update_type in ('submitted', 'review_started', 'status_changed',
  'approval_requested', 'approval_recorded', 'evidence_requested',
  'evidence_submitted', 'repair_scheduled', 'completed', 'message'));

-- Preserve history; only one still-requested item may exist per case.
create unique index evidence_requests_one_requested_per_case
on public.evidence_requests(case_id) where status = 'requested';

create function fixlens_private.advance_case(p_case_key text, p_action text)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  manager_id uuid;
  target public.cases;
  from_status text;
  to_status text;
  event_type text;
  event_message text;
begin
  manager_id := fixlens_private.pm_profile_id();
  if manager_id is null then
    raise exception 'Property manager access required' using errcode = '42501';
  end if;
  case p_action
    when 'request_approval' then
      from_status := 'under_review'; to_status := 'awaiting_approval';
      event_type := 'approval_requested'; event_message := 'Landlord approval requested.';
    when 'record_approval' then
      from_status := 'awaiting_approval'; to_status := 'arranging_repair';
      event_type := 'approval_recorded'; event_message := 'Landlord approval recorded. Repair arrangement started.';
    when 'schedule_repair' then
      from_status := 'arranging_repair'; to_status := 'repair_scheduled';
      event_type := 'repair_scheduled'; event_message := 'Repair scheduled.';
    when 'complete_repair' then
      from_status := 'repair_scheduled'; to_status := 'completed';
      event_type := 'completed'; event_message := 'Repair marked completed.';
    else raise exception 'Unknown workflow action' using errcode = '22023';
  end case;
  select * into target from public.cases where case_key = p_case_key for update;
  if not found then raise exception 'Case not found' using errcode = 'P0002'; end if;
  -- The lifecycle has no reopening: each action is recorded at most once.
  -- Retry after a lost response never moves a later case backwards.
  if exists (select 1 from public.case_updates where case_id = target.id and update_type = event_type) then
    return jsonb_build_object('outcome', 'already_applied', 'status', target.status);
  end if;
  if target.status <> from_status then
    raise exception 'Case state changed; refresh before acting' using errcode = '22023';
  end if;
  if p_action = 'request_approval' and exists (
    select 1 from public.evidence_requests where case_id = target.id and status = 'requested'
  ) then
    raise exception 'Requested evidence is still pending' using errcode = '22023';
  end if;
  update public.cases set status = to_status where id = target.id;
  insert into public.case_updates(case_id, update_type, message, created_by)
  values (target.id, event_type, event_message, manager_id);
  return jsonb_build_object('outcome', 'applied', 'status', to_status);
end;
$$;
revoke all on function fixlens_private.advance_case(text, text) from public, anon, authenticated;
grant execute on function fixlens_private.advance_case(text, text) to authenticated;
create function public.advance_case(p_case_key text, p_action text)
returns jsonb language sql security invoker set search_path = '' as $$
  select fixlens_private.advance_case(p_case_key, p_action);
$$;
revoke all on function public.advance_case(text, text) from public, anon, authenticated;
grant execute on function public.advance_case(text, text) to authenticated;

create function fixlens_private.request_case_evidence(p_case_key text, p_request_id uuid, p_instruction text)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  manager_id uuid;
  target public.cases;
  existing public.evidence_requests;
  instruction_text text := btrim(p_instruction);
begin
  manager_id := fixlens_private.pm_profile_id();
  if manager_id is null then
    raise exception 'Property manager access required' using errcode = '42501';
  end if;
  if p_request_id is null or instruction_text is null or char_length(instruction_text) not between 1 and 1000 then
    raise exception 'Enter an instruction between 1 and 1000 characters' using errcode = '22023';
  end if;
  select * into target from public.cases where case_key = p_case_key for update;
  if not found then raise exception 'Case not found' using errcode = 'P0002'; end if;
  -- Stable request ID recovers this attempt even if its request later changes state.
  select * into existing from public.evidence_requests where id = p_request_id;
  if found then
    if existing.case_id <> target.id or existing.instruction <> instruction_text then
      raise exception 'Request ID already used for different input' using errcode = '22023';
    end if;
    return jsonb_build_object('outcome', 'already_applied', 'request_id', existing.id);
  end if;
  if target.status <> 'under_review' then
    raise exception 'Evidence can only be requested during review' using errcode = '22023';
  end if;
  select * into existing from public.evidence_requests
  where case_id = target.id and status = 'requested';
  if found then
    return jsonb_build_object('outcome', 'existing_request', 'request_id', existing.id);
  end if;
  insert into public.evidence_requests(id, case_id, instruction, requested_by, status)
  values (p_request_id, target.id, instruction_text, manager_id, 'requested');
  insert into public.case_updates(case_id, update_type, message, created_by)
  values (target.id, 'evidence_requested', 'Additional evidence requested.', manager_id);
  -- Refresh dashboard recency without overwriting the canonical lifecycle.
  update public.cases set updated_at = now() where id = target.id;
  return jsonb_build_object('outcome', 'applied', 'request_id', p_request_id);
end;
$$;
revoke all on function fixlens_private.request_case_evidence(text, uuid, text) from public, anon, authenticated;
grant execute on function fixlens_private.request_case_evidence(text, uuid, text) to authenticated;
create function public.request_case_evidence(p_case_key text, p_request_id uuid, p_instruction text)
returns jsonb language sql security invoker set search_path = '' as $$
  select fixlens_private.request_case_evidence(p_case_key, p_request_id, p_instruction);
$$;
revoke all on function public.request_case_evidence(text, uuid, text) from public, anon, authenticated;
grant execute on function public.request_case_evidence(text, uuid, text) to authenticated;

-- No browser table-write grants or RLS/Storage policy changes.
commit;
