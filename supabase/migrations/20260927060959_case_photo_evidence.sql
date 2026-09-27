-- Exhibition session isolation only; the caller-controlled header is not auth.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('case-evidence', 'case-evidence', false, 6291456, array['image/jpeg']);

-- Each original report has at most one immutable photo per capture role.
create unique index evidence_original_photo_role on public.evidence(case_id, evidence_type)
where evidence_request_id is null and evidence_type in ('overview', 'close_up');
create unique index evidence_storage_path on public.evidence(storage_path)
where storage_path is not null;

grant insert (id, case_id, evidence_type, storage_path, annotation_data, created_by)
on public.evidence to anon, authenticated;
revoke update, delete on public.evidence from anon, authenticated;

create policy visitor_insert_photo on public.evidence for insert to anon, authenticated
with check (
  evidence_type in ('overview', 'close_up') and evidence_request_id is null
  and created_by = '10000000-0000-4000-8000-000000000001'::uuid
  and jsonb_typeof(annotation_data) = 'object'
  and annotation_data->>'version' = '1'
  and jsonb_typeof(annotation_data->'annotations') = 'array'
  and octet_length(annotation_data::text) <= 65536
  and exists (
    select 1 from public.cases c where c.id = evidence.case_id
      and c.demo_session_id = (select nullif(current_setting('request.headers', true), '')::jsonb ->> 'x-fixlens-demo-session')
      and evidence.storage_path = c.demo_session_id || '/' || c.id::text || '/' || evidence.id::text || '.jpg'
  )
  and exists (select 1 from storage.objects o where o.bucket_id = 'case-evidence' and o.name = evidence.storage_path)
);

create policy visitor_read_photo_object on storage.objects for select to anon, authenticated
using (
  bucket_id = 'case-evidence'
  and (storage.foldername(name))[1] = (select nullif(current_setting('request.headers', true), '')::jsonb ->> 'x-fixlens-demo-session')
  and exists (select 1 from public.cases c where c.id::text = (storage.foldername(name))[2]
    and c.demo_session_id = (storage.foldername(name))[1])
);

create policy visitor_upload_photo_object on storage.objects for insert to anon, authenticated
with check (
  bucket_id = 'case-evidence'
  and name ~ '^[0-9a-f-]{36}/[0-9a-f-]{36}/[0-9a-f-]{36}\.jpg$'
  and (storage.foldername(name))[1] = (select nullif(current_setting('request.headers', true), '')::jsonb ->> 'x-fixlens-demo-session')
  and exists (select 1 from public.cases c where c.id::text = (storage.foldername(name))[2]
    and c.demo_session_id = (storage.foldername(name))[1])
);

-- No overwrite policy. Only unlinked objects in this session may be removed.
-- Used for cleanup; never delete after an ambiguous evidence INSERT response.
create policy visitor_remove_unlinked_photo on storage.objects for delete to anon, authenticated
using (
  bucket_id = 'case-evidence'
  and (storage.foldername(name))[1] = (select nullif(current_setting('request.headers', true), '')::jsonb ->> 'x-fixlens-demo-session')
  and exists (select 1 from public.cases c where c.id::text = (storage.foldername(name))[2]
    and c.demo_session_id = (storage.foldername(name))[1])
  and not exists (select 1 from public.evidence e where e.storage_path = name)
);
