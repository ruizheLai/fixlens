-- Phase 2A: apply once to a new Supabase project, before seed.sql.
begin;

create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  role text not null check (role in ('renter', 'property_manager')),
  name text not null,
  email text,
  phone text,
  agency_name text,
  created_at timestamptz not null default now()
);

create table public.properties (
  id uuid primary key default gen_random_uuid(),
  address text not null,
  renter_id uuid references public.profiles(id),
  property_manager_id uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create table public.cases (
  id uuid primary key default gen_random_uuid(),
  case_key text unique,
  property_id uuid references public.properties(id),
  renter_id uuid references public.profiles(id),
  demo_session_id text,
  issue_type text not null,
  location text,
  description text not null,
  condition text,
  safety_response text,
  status text not null check (status in (
    'submitted', 'under_review', 'awaiting_approval',
    'arranging_repair', 'repair_scheduled', 'completed'
  )),
  handled_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.evidence_requests (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.cases(id) on delete cascade,
  instruction text not null,
  requested_by uuid references public.profiles(id),
  status text not null check (status in ('requested', 'submitted', 'resolved')),
  created_at timestamptz not null default now(),
  submitted_at timestamptz,
  resolved_at timestamptz
);

create table public.evidence (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.cases(id) on delete cascade,
  evidence_request_id uuid references public.evidence_requests(id) on delete set null,
  evidence_type text not null check (evidence_type in ('overview', 'close_up', 'video', 'requested_photo')),
  storage_path text,
  annotation_data jsonb,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create table public.case_updates (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.cases(id) on delete cascade,
  update_type text not null check (update_type in (
    'submitted', 'review_started', 'status_changed', 'evidence_requested',
    'evidence_submitted', 'repair_scheduled', 'completed', 'message'
  )),
  message text,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create function public.set_case_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger cases_set_updated_at
before update on public.cases
for each row execute function public.set_case_updated_at();

create index cases_property_id_idx on public.cases(property_id);
create index cases_renter_id_idx on public.cases(renter_id);
create index cases_demo_session_id_idx on public.cases(demo_session_id);
create index cases_status_idx on public.cases(status);
create index case_updates_case_id_idx on public.case_updates(case_id);
create index evidence_case_id_idx on public.evidence(case_id);
create index evidence_requests_case_id_idx on public.evidence_requests(case_id);

alter table public.profiles enable row level security;
alter table public.properties enable row level security;
alter table public.cases enable row level security;
alter table public.evidence_requests enable row level security;
alter table public.evidence enable row level security;
alter table public.case_updates enable row level security;

-- TEMPORARY DEMO-DEVELOPMENT access, not user-level authorization.
-- Only fixed seeded identities/property/cases and their child rows are public.
-- Do not put real personal data into these publicly readable seed records.
-- TODO: Review grants and RLS before public showcase deployment, and before
-- introducing visitor creation/session ownership. A session ID is not a credential.
revoke all on table public.profiles, public.properties, public.cases,
  public.evidence_requests, public.evidence, public.case_updates
  from public, anon, authenticated;
grant usage on schema public to anon, authenticated;
grant select on table public.profiles, public.properties, public.cases,
  public.evidence_requests, public.evidence, public.case_updates
  to anon, authenticated;
revoke all on function public.set_case_updated_at() from public, anon, authenticated;

create policy demo_read_profiles on public.profiles for select to anon, authenticated
using (id in ('10000000-0000-4000-8000-000000000001'::uuid, '10000000-0000-4000-8000-000000000002'::uuid));

create policy demo_read_property on public.properties for select to anon, authenticated
using (id = '20000000-0000-4000-8000-000000000001'::uuid);

create policy demo_read_cases on public.cases for select to anon, authenticated
using (demo_session_id is null and id in (
  '30000000-0000-4000-8000-000000000001'::uuid,
  '30000000-0000-4000-8000-000000000002'::uuid,
  '30000000-0000-4000-8000-000000000003'::uuid
));

create policy demo_read_evidence_requests on public.evidence_requests for select to anon, authenticated
using (exists (select 1 from public.cases c where c.id = evidence_requests.case_id));

create policy demo_read_evidence on public.evidence for select to anon, authenticated
using (exists (select 1 from public.cases c where c.id = evidence.case_id));

create policy demo_read_case_updates on public.case_updates for select to anon, authenticated
using (exists (select 1 from public.cases c where c.id = case_updates.case_id));

-- No browser insert/update/delete grants or policies in Phase 2A.
commit;
