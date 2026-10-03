import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getPMCases, type PMCase, type PMProfile } from "../../services/pm";
import { PMReadState, PMStatus, pmDate } from "../../components/pm/PMShared";

const filters = ["All", "Needs attention", "Awaiting approval", "In progress", "Completed"] as const;
export default function PMDashboard({ profile }: { profile: PMProfile }) {
  const [cases, setCases] = useState<PMCase[] | null>(null);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [filter, setFilter] = useState<typeof filters[number]>("All");
  const [search, setSearch] = useState("");
  useEffect(() => {
    const controller = new AbortController(); setCases(null); setError(false);
    getPMCases(controller.signal).then(data => { if (!controller.signal.aborted) setCases(data); })
      .catch(() => { if (!controller.signal.aborted) setError(true); });
    return () => controller.abort();
  }, [attempt]);
  const visible = cases?.filter(c => {
    const matches = filter === "All" || (filter === "Needs attention" && c.evidenceRequests.some(r => r.status !== "resolved"))
      || (filter === "Awaiting approval" && c.status === "awaiting_approval")
      || (filter === "In progress" && ["arranging_repair", "repair_scheduled"].includes(c.status))
      || (filter === "Completed" && c.status === "completed");
    return matches && [c.caseKey, c.title, c.propertyAddress, c.renter?.name, c.handler?.name].join(" ").toLowerCase().includes(search.trim().toLowerCase());
  });
  return <main className="pm-dashboard"><div className="pm-greeting"><h1>Hello, {profile.name.split(" ")[0]}</h1><p>{new Intl.DateTimeFormat("en-AU", { weekday: "long", day: "numeric", month: "long" }).format(new Date())} · {profile.agency_name}</p></div>
    <section className="pm-card pm-table-card"><div className="pm-table-heading"><h2>Maintenance cases</h2><div className="pm-tools"><input aria-label="Search cases" placeholder="Search cases…" value={search} onChange={e => setSearch(e.target.value)} /><button className="pm-button" onClick={() => setAttempt(a => a + 1)}>Refresh</button></div></div>
      <div className="pm-tabs" role="group" aria-label="Filter cases">{filters.map(f => <button key={f} aria-pressed={filter === f} onClick={() => setFilter(f)}>{f}</button>)}</div>
      {!cases ? <PMReadState error={error} retry={() => setAttempt(a => a + 1)} /> : <><table className="pm-table"><thead><tr>{["Case", "Property", "Tenant", "Issue", "Status", "Last updated", "Assignee"].map(h => <th key={h}>{h}</th>)}</tr></thead><tbody>{visible?.map(c => <tr key={c.id}>
        <td><Link className="pm-case-key" to={`/pm/cases/${encodeURIComponent(c.caseKey)}`}>{c.caseKey}</Link></td><td>{c.propertyAddress ?? "Not provided"}</td><td>{c.renter?.name ?? "Not provided"}</td>
        <td><Link className="pm-case-title" to={`/pm/cases/${encodeURIComponent(c.caseKey)}`}>{c.title}</Link></td><td><PMStatus status={c.status} />{c.evidenceRequests.some(r => r.status === "requested") ? <small className="pm-attention">Action required</small> : c.evidenceRequests.some(r => r.status === "submitted") && <small className="pm-attention">Evidence awaiting review</small>}</td>
        <td className="pm-muted">{pmDate(c.updatedAt)}</td><td>{c.handler?.name ?? "Not assigned"}</td>
      </tr>)}</tbody></table>{visible?.length === 0 && <p className="pm-empty">No cases match this view.</p>}</>}
    </section></main>;
}
