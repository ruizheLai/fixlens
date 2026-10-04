begin;

-- Domain tables stay out of Postgres Changes: renter HTTP headers are not WS identity.
-- Private channels expose invalidation only to the already-authorized exhibition PM.
create policy pm_receive_invalidation on realtime.messages for select to authenticated
using (
  extension = 'broadcast'
  and (select fixlens_private.pm_profile_id()) is not null
  and topic = (select realtime.topic())
  and (topic = 'fixlens:pm:cases' or topic like 'fixlens:pm:case:%')
);

create function fixlens_private.notify_pm_invalidation()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
  case_key_value text;
  case_id_value uuid;
begin
  if tg_table_name = 'cases' then
    case_key_value := case when tg_op = 'DELETE' then old.case_key else new.case_key end;
  else
    case_id_value := case when tg_op = 'DELETE' then old.case_id else new.case_id end;
    select case_key into case_key_value from public.cases where id = case_id_value;
  end if;
  if case_key_value is not null then
    perform realtime.send('{}'::jsonb, 'invalidate', 'fixlens:pm:case:' || case_key_value, true);
  end if;
  if tg_table_name in ('cases', 'evidence_requests') then
    perform realtime.send('{}'::jsonb, 'invalidate', 'fixlens:pm:cases', true);
  end if;
  return null;
exception when others then
  -- Notifications are best effort; never roll back a business write for transport.
  return null;
end;
$$;
revoke all on function fixlens_private.notify_pm_invalidation() from public, anon, authenticated;

create trigger notify_pm_cases after insert or update or delete on public.cases
for each row execute function fixlens_private.notify_pm_invalidation();
create trigger notify_pm_requests after insert or update or delete on public.evidence_requests
for each row execute function fixlens_private.notify_pm_invalidation();
create trigger notify_pm_evidence after insert or update or delete on public.evidence
for each row execute function fixlens_private.notify_pm_invalidation();
create trigger notify_pm_updates after insert or update or delete on public.case_updates
for each row execute function fixlens_private.notify_pm_invalidation();

-- No client INSERT policy for broadcasts; no domain/Storage grants or policies change.
commit;
