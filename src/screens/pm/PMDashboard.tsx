import { useState } from "react";
import { useAuthoritativeRead } from "../../hooks/useAuthoritativeRead";
import { useAutomaticInvalidation } from "../../hooks/useAutomaticInvalidation";
import { Link, useNavigate } from "react-router-dom";
import { getPMCases, type PMProfile } from "../../services/pm";
import { PMReadState, PMStatus, pmDate } from "../../components/pm/PMShared";

const filters = ["All", "Needs attention", "Awaiting approval", "In progress", "Completed"] as const;
export default function PMDashboard({ profile }: { profile: PMProfile }) {
  const navigate = useNavigate();
  const { data: cases, error, refresh } = useAuthoritativeRead(getPMCases);
  useAutomaticInvalidation("pm", "cases", refresh);
  const [filter, setFilter] = useState<typeof filters[number]>("All");
  const [search, setSearch] = useState("");
  const visible = cases?.filter(c => {
    const matches = filter === "All" || (filter === "Needs attention" && c.evidenceRequests.some(r => r.status !== "resolved"))
      || (filter === "Awaiting approval" && c.status === "awaiting_approval")
      || (filter === "In progress" && ["arranging_repair", "repair_scheduled"].includes(c.status))
      || (filter === "Completed" && c.status === "completed");
    return matches && [c.caseKey, c.title, c.propertyAddress, c.renter?.name, c.handler?.name].join(" ").toLowerCase().includes(search.trim().toLowerCase());
  });
  return <main className="pm-dashboard"><div className="pm-greeting"><h1>Hello, {profile.name.split(" ")[0]}</h1><p>{new Intl.DateTimeFormat("en-AU", { weekday: "long", day: "numeric", month: "long" }).format(new Date())} · {profile.agency_name}</p></div>
    <section className="pm-card pm-table-card"><div className="pm-table-heading"><h2>Maintenance cases</h2><div className="pm-tools"><input aria-label="Search cases" placeholder="Search cases…" value={search} onChange={e => setSearch(e.target.value)} /><button className="pm-button" onClick={refresh}>Refresh</button></div></div>
      <div className="pm-tabs" role="group" aria-label="Filter cases">{filters.map(f => <button key={f} aria-pressed={filter === f} onClick={() => setFilter(f)}>{f}</button>)}</div>
      {!cases ? <PMReadState error={error} retry={refresh} /> : <><div className="pm-table-scroll"><table className="pm-table"><thead><tr>{["Case", "Property", "Tenant", "Status", "Last updated", "Assignee"].map(h => <th key={h}>{h}</th>)}</tr></thead><tbody>{visible?.map(c => <tr key={c.id} tabIndex={0} aria-label={`Open ${c.title?.trim() || "Maintenance issue"}`} onClick={e => {
        if ((e.target as Element).closest("a,button,input,select,textarea,[role=button]") || window.getSelection()?.toString()) return;
        navigate(`/pm/cases/${encodeURIComponent(c.caseKey)}`);
      }} onKeyDown={e => { if (e.key === "Enter" && e.target === e.currentTarget) { e.preventDefault(); navigate(`/pm/cases/${encodeURIComponent(c.caseKey)}`); } }}>
        <td><Link className="pm-case-title" to={`/pm/cases/${encodeURIComponent(c.caseKey)}`}>{c.title?.trim() || "Maintenance issue"}</Link></td><td>{c.propertyAddress ?? "Not provided"}</td><td>{c.renter?.name ?? "Not provided"}</td>
        <td><PMStatus status={c.status} />{c.evidenceRequests.some(r => r.status === "requested") ? <small className="pm-attention pm-renter-action">Action required</small> : c.evidenceRequests.some(r => r.status === "submitted") && <small className="pm-attention">Evidence awaiting review</small>}</td>
        <td className="pm-muted">{pmDate(c.updatedAt)}</td><td>{c.handler?.name ?? "Not assigned"}</td>
      </tr>)}</tbody></table></div>{visible?.length === 0 && <p className="pm-empty">No cases match this view.</p>}</>}
    </section></main>;
}
