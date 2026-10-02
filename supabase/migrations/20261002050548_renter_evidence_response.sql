begin;
grant usage on schema fixlens_private to anon;

-- One immutable photo answers one request. Original report photos are unaffected.
create unique index evidence_one_request_photo on public.evidence(evidence_request_id)
where evidence_request_id is not null;

create function fixlens_private.submit_requested_evidence(p_request_id uuid, p_evidence_id uuid, p_metadata jsonb)
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
revoke all on function fixlens_private.submit_requested_evidence(uuid,uuid,jsonb) from public,anon,authenticated;
grant execute on function fixlens_private.submit_requested_evidence(uuid,uuid,jsonb) to anon,authenticated;

create function public.submit_requested_evidence(p_request_id uuid,p_evidence_id uuid,p_metadata jsonb)
returns jsonb language sql security invoker set search_path = '' as $$
  select fixlens_private.submit_requested_evidence(p_request_id,p_evidence_id,p_metadata);
$$;
revoke all on function public.submit_requested_evidence(uuid,uuid,jsonb) from public,anon,authenticated;
grant execute on function public.submit_requested_evidence(uuid,uuid,jsonb) to anon,authenticated;
-- No generic request UPDATE or requested-photo INSERT grants. Storage/RLS unchanged.
commit;
