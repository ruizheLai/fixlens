import "./styles/reportVisual.css";
import "./styles/renterVisual.css";
import { lazy, Suspense, useCallback } from "react";
import { useAuthoritativeRead } from "./hooks/useAuthoritativeRead";
import { useAutomaticInvalidation } from "./hooks/useAutomaticInvalidation";
import { Navigate, Route, Routes, useNavigate, useParams, useSearchParams } from "react-router-dom";
import PhoneShell from "./app/PhoneShell";
import FloatingChatBtn from "./components/navigation/FloatingChatBtn";
import RequestedEvidenceWorkflow from "./features/evidence/RequestedEvidenceWorkflow";
import WrittenDetailsWorkflow from "./features/evidence/WrittenDetailsWorkflow";
import HomeScreen from "./screens/renter/HomeScreen";
import CasesScreen from "./screens/renter/CasesScreen";
import InboxScreen from "./screens/renter/InboxScreen";
import ProfileScreen from "./screens/renter/ProfileScreen";
import SupportChatScreen from "./screens/renter/SupportChatScreen";
import BedroomCaseDetailScreen from "./screens/renter/cases/BedroomCaseDetailScreen";
import HotWaterCaseDetailScreen from "./screens/renter/cases/HotWaterCaseDetailScreen";
import KitchenCaseDetailScreen from "./screens/renter/cases/KitchenCaseDetailScreen";
import SubmittedReportScreen from "./screens/renter/SubmittedReportScreen";
import ReportWorkflow from "./features/report/ReportWorkflow";
import type { NavItemId } from "./types/navigation";
import type { CaseDetail } from "./types/case";
import { getCaseByKey } from "./services/cases";
import ScreenHeader from "./components/common/ScreenHeader";
import NavBar from "./components/navigation/NavBar";
import { canRespondToRequest, requestResponsePath } from "./data/evidenceRequestPresentation";
import { getDemoSessionId } from "./utils/demoSession";

const NAV_PATHS: Record<NavItemId, string> = { home: "/", cases: "/cases", inbox: "/inbox", profile: "/profile" };
const PMPortal = lazy(() => import("./features/pm/PMPortal"));

function RenterPage({ children, polished = false, support = true }: { children: React.ReactNode; polished?: boolean; support?: boolean }) {
  const navigate = useNavigate();
  const content = <>{children}{support && <FloatingChatBtn onClick={() => navigate("/support")} />}</>;
  return polished ? <div className="renter-visual renter-page">{content}</div> : content;
}

function CaseRoute({ onNav }: {
  onNav: (id: NavItemId) => void;
}) {
  const { caseId } = useParams();
  return <LoadedCaseRoute key={caseId} caseKey={caseId ?? ""} onNav={onNav} />;
}

function LoadedCaseRoute({ caseKey, onNav }: {
  caseKey: string; onNav: (id: NavItemId) => void;
}) {
  const navigate = useNavigate();
  const load = useCallback((signal: AbortSignal) => getCaseByKey(caseKey, signal), [caseKey]);
  const { data: detail, error, refresh } = useAuthoritativeRead(load);
  useAutomaticInvalidation("renter", caseKey, refresh);
  const state = detail !== undefined ? "ready" : error ? "error" : "loading";
  if (state === "ready" && !detail) return <Navigate to="/cases" replace />;
  if (state !== "ready" || !detail) return <RenterPage polished><div className="flex flex-col h-full">
    <ScreenHeader title="Case details" onBack={() => navigate("/cases")} />
    <div className="flex-1 overflow-y-auto px-5 py-5">
      {state === "loading" ? <p role="status" style={{ fontSize: 13, color: "var(--color-muted)" }}>Loading case details…</p> :
        <div role="alert" style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>
          <p>We couldn't load this case. Please try again.</p>
          <button onClick={refresh} className="mt-2 font-semibold" style={{ color: "var(--color-blue)" }}>Retry</button>
        </div>}
    </div>
    <NavBar active="cases" onNav={onNav} />
  </div></RenterPage>;
  const common = { detail, onBack: () => navigate("/cases"), onViewReport: () => navigate(`/cases/${encodeURIComponent(caseKey)}/report`), onNav };
  if (detail.status === "completed") return <RenterPage polished><HotWaterCaseDetailScreen {...common} /></RenterPage>;
  if (detail.evidenceRequests.length > 0) return <RequestedEvidenceCaseRoute detail={detail} onRefresh={refresh} onNav={onNav} />;
  return <RenterPage polished><BedroomCaseDetailScreen {...common} /></RenterPage>;
}

function RequestedEvidenceCaseRoute({ detail, onRefresh, onNav }: {
  detail: CaseDetail; onRefresh: () => void; onNav: (id: NavItemId) => void;
}) {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const request = detail.evidenceRequests.find(r => r.id === params.get("request") && canRespondToRequest(detail, r, getDemoSessionId()));
  if (request) {
    const done = () => { setParams({}, { replace: true }); onRefresh(); };
    return request.requestType === "written_details" ? <WrittenDetailsWorkflow key={request.id} request={request} caseTitle={detail.title} onExit={done} onSubmitted={done} />
      : <RequestedEvidenceWorkflow key={request.id} request={request} safetyResponse={detail.safetyResponse} onExit={done} onSubmitted={done} />;
  }
  return <RenterPage polished><KitchenCaseDetailScreen detail={detail} onAddEvidence={id => navigate(requestResponsePath(detail.caseKey, id))} onBack={() => navigate("/cases")} onViewReport={() => navigate(`/cases/${encodeURIComponent(detail.caseKey)}/report`)} onNav={onNav} /></RenterPage>;
}

function SubmittedReportRoute() {
  const { caseId } = useParams();
  const navigate = useNavigate();
  return <SubmittedReportScreen key={caseId} caseKey={caseId ?? ""} onBack={() => navigate(`/cases/${encodeURIComponent(caseId ?? "")}`)} />;
}

export default function App() {
  return <Routes><Route path="/pm/*" element={<Suspense fallback={<p role="status">Loading PM Portal…</p>}><PMPortal /></Suspense>} /><Route path="*" element={<RenterApp />} /></Routes>;
}

function RenterApp() {
  const navigate = useNavigate();
  const onNav = (id: NavItemId) => navigate(NAV_PATHS[id]);

  return (
    <PhoneShell>
      <Routes>
        <Route path="/" element={<RenterPage polished support={false}><HomeScreen onReport={() => navigate("/report")} onMyCases={() => navigate("/cases")} onCaseDetail={key => navigate(`/cases/${encodeURIComponent(key)}`)} onRequest={(key,id) => navigate(requestResponsePath(key,id))} onInbox={() => navigate("/inbox")} onSupportChat={() => navigate("/support")} onNav={onNav} /></RenterPage>} />
        <Route path="/cases" element={<RenterPage polished><CasesScreen onCase={(caseKey) => navigate(`/cases/${encodeURIComponent(caseKey)}`)} onNav={onNav} /></RenterPage>} />
        <Route path="/inbox" element={<RenterPage><InboxScreen onCase={(caseKey) => navigate(`/cases/${encodeURIComponent(caseKey)}`)} onNav={onNav} /></RenterPage>} />
        <Route path="/profile" element={<RenterPage polished><ProfileScreen onNav={onNav} /></RenterPage>} />
        <Route path="/support" element={<SupportChatScreen onBack={() => navigate("/")} />} />
        <Route path="/cases/:caseId" element={<CaseRoute onNav={onNav} />} />
        <Route path="/cases/:caseId/report" element={<SubmittedReportRoute />} />
        <Route path="/report" element={<ReportWorkflow />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </PhoneShell>
  );
}
