begin;

-- Additive, explicit compatibility: old/seeded requests remain generic photos.
alter table public.evidence_requests
  add column request_type text not null default 'legacy_photo'
    check (request_type in ('legacy_photo','overview_photo','closeup_photo','written_details')),
  add column response_text text;
alter table public.evidence_requests add constraint evidence_request_response_text_check
  check (response_text is null or (request_type='written_details'
    and status in ('submitted','resolved') and char_length(response_text) between 1 and 4000
    and response_text ~ '[^[:space:]]'));
alter table public.evidence_requests add constraint evidence_request_written_state_check
  check (request_type<>'written_details' or (status='requested' and response_text is null)
    or (status in ('submitted','resolved') and response_text is not null));

-- Same case-first lock/order and one-unresolved-request rule as existing RPCs.
create function fixlens_private.request_case_information(p_case_key text,p_request_id uuid,p_instruction text,p_request_type text)
returns jsonb language plpgsql security definer set search_path='' as $$
declare
  manager_id uuid;
  target public.cases;
  existing public.evidence_requests;
  instruction_text text := btrim(p_instruction);
begin
  manager_id := fixlens_private.pm_profile_id();
  if manager_id is null then raise exception 'Property manager access required' using errcode='42501'; end if;
  if p_request_type is null or p_request_type not in ('legacy_photo','overview_photo','closeup_photo','written_details')
    or p_request_id is null or instruction_text is null or char_length(instruction_text) not between 1 and 1000
    or instruction_text !~ '[^[:space:]]' then
    raise exception 'Valid request type and instructions required' using errcode='22023';
  end if;
  select * into target from public.cases where case_key=p_case_key for update;
  if not found then raise exception 'Case not found' using errcode='P0002'; end if;
  select * into existing from public.evidence_requests where id=p_request_id;
  if found then
    if existing.case_id<>target.id or existing.instruction<>instruction_text or existing.request_type<>p_request_type then
      raise exception 'Request ID already used for different input' using errcode='22023';
    end if;
    return jsonb_build_object('outcome','already_applied','request_id',existing.id);
  end if;
  if target.status<>'under_review' then raise exception 'Information can only be requested during review' using errcode='22023'; end if;
  select * into existing from public.evidence_requests where case_id=target.id and status in ('requested','submitted');
  if found then return jsonb_build_object('outcome','existing_request','request_id',existing.id); end if;
  insert into public.evidence_requests(id,case_id,instruction,requested_by,status,request_type)
  values(p_request_id,target.id,instruction_text,manager_id,'requested',p_request_type);
  insert into public.case_updates(case_id,update_type,message,created_by)
  values(target.id,'evidence_requested',case when p_request_type='written_details' then 'More written details requested.' else 'Additional evidence requested.' end,manager_id);
  update public.cases set updated_at=now() where id=target.id;
  return jsonb_build_object('outcome','applied','request_id',p_request_id);
end;
$$;
revoke all on function fixlens_private.request_case_information(text,uuid,text,text) from public,anon,authenticated;
grant execute on function fixlens_private.request_case_information(text,uuid,text,text) to authenticated;

create function public.request_case_information(p_case_key text,p_request_id uuid,p_instruction text,p_request_type text)
returns jsonb language plpgsql security invoker set search_path='' as $$
begin
  if p_request_type is null or p_request_type not in ('overview_photo','closeup_photo','written_details') then
    raise exception 'Invalid request type' using errcode='22023';
  end if;
  return fixlens_private.request_case_information(p_case_key,p_request_id,p_instruction,p_request_type);
end;
$$;
revoke all on function public.request_case_information(text,uuid,text,text) from public,anon,authenticated;
grant execute on function public.request_case_information(text,uuid,text,text) to authenticated;

-- Preserve the old public three-argument RPC and its historical generic semantics.
create or replace function fixlens_private.request_case_evidence(p_case_key text,p_request_id uuid,p_instruction text)
returns jsonb language sql security definer set search_path='' as $$
  select fixlens_private.request_case_information(p_case_key,p_request_id,p_instruction,'legacy_photo');
$$;

create function fixlens_private.submit_requested_details(p_request_id uuid,p_response_text text)
returns jsonb language plpgsql security definer set search_path='' as $$
declare
  session_id text := nullif(current_setting('request.headers',true),'')::jsonb->>'x-fixlens-demo-session';
  target public.cases;
  request public.evidence_requests;
begin
  select c.* into target from public.cases c join public.evidence_requests r on r.case_id=c.id
  where r.id=p_request_id and c.demo_session_id=session_id and session_id is not null for update of c;
  if not found then raise exception 'Request access denied' using errcode='42501'; end if;
  select * into request from public.evidence_requests where id=p_request_id for update;
  if request.request_type<>'written_details' or p_response_text is null
    or char_length(p_response_text) not between 1 and 4000 or p_response_text !~ '[^[:space:]]' then
    raise exception 'Valid written response required' using errcode='22023';
  end if;
  if request.status in ('submitted','resolved') then
    if request.response_text=p_response_text then return jsonb_build_object('outcome','already_submitted','request_id',request.id); end if;
    raise exception 'Response already submitted with different text' using errcode='22023';
  end if;
  if request.status<>'requested' or target.status<>'under_review' then raise exception 'Request is no longer eligible' using errcode='22023'; end if;
  update public.evidence_requests set status='submitted',submitted_at=now(),response_text=p_response_text where id=request.id;
  insert into public.case_updates(case_id,update_type,message,created_by)
  values(target.id,'evidence_submitted','Written details submitted.',target.renter_id);
  update public.cases set updated_at=now() where id=target.id;
  return jsonb_build_object('outcome','submitted','request_id',request.id);
end;
$$;
revoke all on function fixlens_private.submit_requested_details(uuid,text) from public,anon,authenticated;
grant execute on function fixlens_private.submit_requested_details(uuid,text) to anon,authenticated;
create function public.submit_requested_details(p_request_id uuid,p_response_text text)
returns jsonb language sql security invoker set search_path='' as $$
  select fixlens_private.submit_requested_details(p_request_id,p_response_text);
$$;
revoke all on function public.submit_requested_details(uuid,text) from public,anon,authenticated;
grant execute on function public.submit_requested_details(uuid,text) to anon,authenticated;

-- Photo-submit and PM resolution definitions follow, with only type eligibility
-- and written-response validation added. Existing grants/RLS/Storage stay intact.
create or replace function fixlens_private.submit_requested_evidence(p_request_id uuid, p_evidence_id uuid, p_metadata jsonb)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  session_id text := nullif(current_setting('request.headers', true), '')::jsonb ->> 'x-fixlens-demo-session';
  target public.cases;
  request public.evidence_requests;
  existing public.evidence;
  object_path text;
  item jsonb;
  point jsonb;
begin
  -- Match the same visitor ownership used by renter RLS; seeded cases are read-only.
  select c.* into target from public.cases c join public.evidence_requests r on r.case_id=c.id
  where r.id=p_request_id and c.demo_session_id=session_id and session_id is not null
  for update of c;
  if not found then raise exception 'Request access denied' using errcode='42501'; end if;
  select * into request from public.evidence_requests where id=p_request_id for update;
  if request.request_type='written_details' then raise exception 'Photo cannot answer a written request' using errcode='22023'; end if;
  if p_evidence_id is null then raise exception 'Evidence ID required' using errcode='22023'; end if;
  object_path := session_id || '/' || target.id::text || '/' || p_evidence_id::text || '.jpg';
  select * into existing from public.evidence where evidence_request_id=request.id;
  if found then
    if existing.id=p_evidence_id and existing.case_id=target.id
      and existing.storage_path=object_path and existing.annotation_data=p_metadata
      and request.status in ('submitted','resolved') then
      return jsonb_build_object('outcome','already_submitted','evidence_id',existing.id);
    end if;
    raise exception 'Request already has evidence' using errcode='22023';
  end if;
  if request.status <> 'requested' then raise exception 'Request is no longer awaiting evidence' using errcode='22023'; end if;
  if p_metadata is null or jsonb_typeof(p_metadata) <> 'object'
    or p_metadata->>'version' is distinct from '1'
    or jsonb_typeof(p_metadata->'width') is distinct from 'number'
    or jsonb_typeof(p_metadata->'height') is distinct from 'number'
    or jsonb_typeof(p_metadata->'annotations') is distinct from 'array'
    or octet_length(p_metadata::text)>65536 then
    raise exception 'Invalid photo metadata' using errcode='22023';
  end if;
  if (p_metadata->>'width')::numeric not between 1 and 2048
    or (p_metadata->>'height')::numeric not between 1 and 2048
    or jsonb_array_length(p_metadata->'annotations')>50 then
    raise exception 'Invalid photo dimensions or annotations' using errcode='22023';
  end if;
  for item in select value from jsonb_array_elements(p_metadata->'annotations') loop
    if item->>'tool' is null or item->>'tool' not in ('circle','arrow','text','draw')
      or jsonb_typeof(item->'points') is distinct from 'array'
      or (item ? 'text' and (jsonb_typeof(item->'text')<>'string' or char_length(item->>'text')>80)) then
      raise exception 'Invalid annotation' using errcode='22023';
    end if;
    if jsonb_array_length(item->'points') not between 1 and 200 then
      raise exception 'Invalid annotation points' using errcode='22023';
    end if;
    for point in select value from jsonb_array_elements(item->'points') loop
      if jsonb_typeof(point->'x') is distinct from 'number' or jsonb_typeof(point->'y') is distinct from 'number' then
        raise exception 'Invalid annotation coordinates' using errcode='22023';
      end if;
      if (point->>'x')::numeric not between 0 and 1 or (point->>'y')::numeric not between 0 and 1 then
        raise exception 'Invalid annotation coordinates' using errcode='22023';
      end if;
    end loop;
  end loop;
  if not exists(select 1 from storage.objects where bucket_id='case-evidence' and name=object_path) then
    raise exception 'Uploaded photo required' using errcode='22023';
  end if;
  insert into public.evidence(id,case_id,evidence_request_id,evidence_type,storage_path,annotation_data,created_by)
  values(p_evidence_id,target.id,request.id,'requested_photo',object_path,p_metadata,target.renter_id);
  update public.evidence_requests set status='submitted',submitted_at=now() where id=request.id;
  insert into public.case_updates(case_id,update_type,message,created_by)
  values(target.id,'evidence_submitted','Requested evidence submitted.',target.renter_id);
  update public.cases set updated_at=now() where id=target.id;
  return jsonb_build_object('outcome','submitted','evidence_id',p_evidence_id);
end;
$$;
create or replace function fixlens_private.resolve_evidence_request(p_case_key text, p_request_id uuid)
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
  if request.request_type='written_details' then
    if request.response_text is null or request.response_text !~ '[^[:space:]]' then raise exception 'Written response unavailable' using errcode='22023'; end if;
  elsif not exists(select 1 from public.evidence e where e.case_id=target.id and e.evidence_request_id=request.id and e.evidence_type='requested_photo') then
    raise exception 'Submitted evidence is unavailable' using errcode='22023';
  end if;
  update public.evidence_requests set status='resolved',resolved_at=now() where id=request.id;
  insert into public.case_updates(case_id,update_type,message,created_by)
  values(target.id,'message',case when request.request_type='written_details' then 'Written details reviewed.' else 'Requested evidence reviewed.' end,manager_id);
  update public.cases set updated_at=now() where id=target.id;
  return jsonb_build_object('outcome','applied','request_id',request.id,'status','resolved');
end;
$$;
notify pgrst, 'reload schema';
commit;
