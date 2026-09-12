-- Deterministic, non-destructive seed: reruns add missing fixed IDs only.
-- Existing records are not reset or overwritten. Run after the initial migration.
begin;

insert into public.profiles (id, role, name, agency_name, created_at) values
  ('10000000-0000-4000-8000-000000000001', 'renter', 'Brad Lai', null, '2026-08-01T00:00:00Z'),
  ('10000000-0000-4000-8000-000000000002', 'property_manager', 'Sarah Chen', 'Apex Rentals', '2026-08-01T00:00:00Z')
on conflict (id) do nothing;

insert into public.properties (id, address, renter_id, property_manager_id, created_at) values
  ('20000000-0000-4000-8000-000000000001', '12 Thornton St, Apt 4B, Melbourne VIC 3000',
   '10000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000002', '2026-08-01T00:00:00Z')
on conflict (id) do nothing;

insert into public.cases (id, case_key, property_id, renter_id, demo_session_id,
  issue_type, location, description, condition, safety_response, status, handled_by,
  created_at, updated_at) values
  ('30000000-0000-4000-8000-000000000001', 'bedroom-window-leak',
   '20000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000001', null,
   'Water leak', 'Bedroom window', 'Water enters through the bedroom window frame during rain.',
   'When it rains', 'No immediate danger reported', 'awaiting_approval',
   '10000000-0000-4000-8000-000000000002', '2026-09-09T00:30:00Z', '2026-09-10T05:20:00Z'),
  ('30000000-0000-4000-8000-000000000002', 'hot-water',
   '20000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000001', null,
   'Hot water issue', 'Bathroom', 'The bathroom had no hot water; the repair is now completed.',
   null, 'No immediate danger reported', 'completed',
   '10000000-0000-4000-8000-000000000002', '2026-08-04T01:00:00Z', '2026-08-12T04:00:00Z'),
  ('30000000-0000-4000-8000-000000000003', 'kitchen-tap',
   '20000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000001', null,
   'Water leak', 'Kitchen tap', 'Water is leaking beneath the kitchen tap.',
   null, 'No immediate danger reported', 'under_review',
   '10000000-0000-4000-8000-000000000002', '2026-09-09T00:00:00Z', '2026-09-09T04:15:00Z')
on conflict (id) do nothing;

insert into public.evidence_requests (id, case_id, instruction, requested_by, status, created_at) values
  ('40000000-0000-4000-8000-000000000001', '30000000-0000-4000-8000-000000000003',
   'Please provide a clearer photo showing the area beneath the kitchen tap.',
   '10000000-0000-4000-8000-000000000002', 'requested', '2026-09-09T04:15:00Z')
on conflict (id) do nothing;

insert into public.case_updates (id, case_id, update_type, message, created_by, created_at) values
  ('50000000-0000-4000-8000-000000000001', '30000000-0000-4000-8000-000000000001',
   'submitted', 'Bedroom window leak report received.', '10000000-0000-4000-8000-000000000001', '2026-09-09T00:30:00Z'),
  ('50000000-0000-4000-8000-000000000002', '30000000-0000-4000-8000-000000000001',
   'status_changed', 'Property manager requested landlord approval.', '10000000-0000-4000-8000-000000000002', '2026-09-10T05:20:00Z'),
  ('50000000-0000-4000-8000-000000000003', '30000000-0000-4000-8000-000000000002',
   'submitted', 'Hot water issue report received.', '10000000-0000-4000-8000-000000000001', '2026-08-04T01:00:00Z'),
  ('50000000-0000-4000-8000-000000000004', '30000000-0000-4000-8000-000000000002',
   'completed', 'Repair completed and hot water restored.', '10000000-0000-4000-8000-000000000002', '2026-08-12T04:00:00Z'),
  ('50000000-0000-4000-8000-000000000005', '30000000-0000-4000-8000-000000000003',
   'submitted', 'Kitchen tap leak report received.', '10000000-0000-4000-8000-000000000001', '2026-09-09T00:00:00Z'),
  ('50000000-0000-4000-8000-000000000006', '30000000-0000-4000-8000-000000000003',
   'evidence_requested', 'A clearer photo beneath the tap is needed.', '10000000-0000-4000-8000-000000000002', '2026-09-09T04:15:00Z')
on conflict (id) do nothing;

-- Evidence intentionally remains empty: no simulated URLs or fake storage paths.
commit;
