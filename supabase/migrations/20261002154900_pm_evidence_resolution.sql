begin;

-- Existing resolved state and message activity suffice; no table/schema expansion.
create function fixlens_private.resolve_evidence_request(p_case_key text, p_request_id uuid)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  manager_id uuid;
  target public.cases;
  request public.evidence_requests;
begin
  manager_id := fixlens_private.pm_profile_id();
  if manager_id is null then raise exception 'Property manager access required' using errcode='42501'; end if;
  -- Linked exhibition PMs can see all cases under the existing PM access model.
  -- Lock in the same order as renter submission and PM workflow operations.
  select * into target from public.cases where case_key=p_case_key for update;
  if not found then raise exception 'Case not found' using errcode='P0002'; end if;
  select * into request from public.evidence_requests where id=p_request_id and case_id=target.id for update;
  if not found then raise exception 'Request not found for this case' using errcode='P0002'; end if;
  -- The request never reopens. Its resolved state is the stable idempotency key,
  -- including a retry after the canonical case has subsequently progressed.
  if request.status='resolved' then
    return jsonb_build_object('outcome','already_applied','request_id',request.id,'status',request.status);
  end if;
  if target.status<>'under_review' or request.status<>'submitted' then
    raise exception 'Evidence is not awaiting review on an under-review case' using errcode='22023';
  end if;
  if not exists(select 1 from public.evidence e where e.case_id=target.id and e.evidence_request_id=request.id and e.evidence_type='requested_photo') then
    raise exception 'Submitted evidence is unavailable' using errcode='22023';
  end if;
  update public.evidence_requests set status='resolved',resolved_at=now() where id=request.id;
  insert into public.case_updates(case_id,update_type,message,created_by)
  values(target.id,'message','Requested evidence reviewed.',manager_id);
  update public.cases set updated_at=now() where id=target.id;
  return jsonb_build_object('outcome','applied','request_id',request.id,'status','resolved');
end;
$$;
revoke all on function fixlens_private.resolve_evidence_request(text,uuid) from public,anon,authenticated;
grant execute on function fixlens_private.resolve_evidence_request(text,uuid) to authenticated;
create function public.resolve_evidence_request(p_case_key text,p_request_id uuid)
returns jsonb language sql security invoker set search_path = '' as $$
  select fixlens_private.resolve_evidence_request(p_case_key,p_request_id);
$$;
revoke all on function public.resolve_evidence_request(text,uuid) from public,anon,authenticated;
grant execute on function public.resolve_evidence_request(text,uuid) to authenticated;

-- Existing PM RPC definitions follow with only the unresolved-request gates changed.

create or replace function fixlens_private.advance_case(p_case_key text, p_action text)
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
    select 1 from public.evidence_requests where case_id = target.id and status in ('requested', 'submitted')
  ) then
    raise exception 'Evidence request is still unresolved' using errcode = '22023';
  end if;
  update public.cases set status = to_status where id = target.id;
  insert into public.case_updates(case_id, update_type, message, created_by)
  values (target.id, event_type, event_message, manager_id);
  return jsonb_build_object('outcome', 'applied', 'status', to_status);
end;
$$;
revoke all on function fixlens_private.advance_case(text, text) from public, anon, authenticated;
grant execute on function fixlens_private.advance_case(text, text) to authenticated;
create or replace function public.advance_case(p_case_key text, p_action text)
returns jsonb language sql security invoker set search_path = '' as $$
  select fixlens_private.advance_case(p_case_key, p_action);
$$;
revoke all on function public.advance_case(text, text) from public, anon, authenticated;
grant execute on function public.advance_case(text, text) to authenticated;

create or replace function fixlens_private.request_case_evidence(p_case_key text, p_request_id uuid, p_instruction text)
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
  where case_id = target.id and status in ('requested', 'submitted');
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
create or replace function public.request_case_evidence(p_case_key text, p_request_id uuid, p_instruction text)
returns jsonb language sql security invoker set search_path = '' as $$
  select fixlens_private.request_case_evidence(p_case_key, p_request_id, p_instruction);
$$;
revoke all on function public.request_case_evidence(text, uuid, text) from public, anon, authenticated;
grant execute on function public.request_case_evidence(text, uuid, text) to authenticated;


-- No changes to table grants, RLS or Storage policies.
commit;
