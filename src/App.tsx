import { lazy, Suspense, useEffect, useState } from "react";
import { Navigate, Route, Routes, useNavigate, useParams } from "react-router-dom";
import PhoneShell from "./app/PhoneShell";
import FloatingChatBtn from "./components/navigation/FloatingChatBtn";
import RequestedEvidenceWorkflow from "./features/evidence/RequestedEvidenceWorkflow";
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
import { casePath } from "./data/demo/cases";
import type { NavItemId } from "./types/navigation";
import type { CaseDetail } from "./types/case";
import { getCaseByKey } from "./services/cases";
import ScreenHeader from "./components/common/ScreenHeader";
import NavBar from "./components/navigation/NavBar";

const NAV_PATHS: Record<NavItemId, string> = { home: "/", cases: "/cases", inbox: "/inbox", profile: "/profile" };
const PMPortal = lazy(() => import("./features/pm/PMPortal"));

function RenterPage({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  return <>{children}<FloatingChatBtn onClick={() => navigate("/support")} /></>;
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
  const [detail, setDetail] = useState<CaseDetail | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setState("loading");
    getCaseByKey(caseKey, controller.signal).then((item) => {
      if (controller.signal.aborted) return;
      setDetail(item);
      setState("ready");
    }).catch((error: unknown) => {
      if (controller.signal.aborted) return;
      console.error("Case detail could not be loaded", error instanceof Error ? error.message : "Unknown read failure");
      setState("error");
    });
    return () => controller.abort();
  }, [caseKey, attempt]);
  if (state === "ready" && !detail) return <Navigate to="/cases" replace />;
  if (state !== "ready" || !detail) return <RenterPage><div className="flex flex-col h-full">
    <ScreenHeader title="Case details" onBack={() => navigate("/cases")} />
    <div className="flex-1 overflow-y-auto px-5 py-5">
      {state === "loading" ? <p role="status" style={{ fontSize: 13, color: "var(--color-muted)" }}>Loading case details…</p> :
        <div role="alert" style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>
          <p>We couldn't load this case. Please try again.</p>
          <button onClick={() => setAttempt((value) => value + 1)} className="mt-2 font-semibold" style={{ color: "var(--color-blue)" }}>Retry</button>
        </div>}
    </div>
    <NavBar active="cases" onNav={onNav} />
  </div></RenterPage>;
  const common = { detail, onBack: () => navigate("/cases"), onViewReport: () => navigate(`/cases/${encodeURIComponent(caseKey)}/report`), onNav };
  if (detail.status === "completed") return <RenterPage><HotWaterCaseDetailScreen {...common} /></RenterPage>;
  if (detail.evidenceRequests.length > 0) return <RequestedEvidenceCaseRoute detail={detail} onRefresh={() => setAttempt(a => a + 1)} onNav={onNav} />;
  return <RenterPage><BedroomCaseDetailScreen {...common} /></RenterPage>;
}

function RequestedEvidenceCaseRoute({ detail, onRefresh, onNav }: {
  detail: CaseDetail; onRefresh: () => void; onNav: (id: NavItemId) => void;
}) {
  const [requestId, setRequestId] = useState<string | null>(null);
  const navigate = useNavigate();
  const request = detail.evidenceRequests.find(r => r.id === requestId && r.status === "requested");
  if (request) return <RequestedEvidenceWorkflow request={request} onExit={() => { setRequestId(null); onRefresh(); }} onSubmitted={() => { setRequestId(null); onRefresh(); }} />;
  return <RenterPage><KitchenCaseDetailScreen detail={detail} onAddEvidence={setRequestId} onBack={() => navigate("/cases")} onViewReport={() => navigate(`/cases/${encodeURIComponent(detail.caseKey)}/report`)} onNav={onNav} /></RenterPage>;
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
  const bedroom = () => navigate(casePath("bedroom-window-leak"));

  return (
    <PhoneShell>
      <Routes>
        <Route path="/" element={<RenterPage><HomeScreen onReport={() => navigate("/report")} onMyCases={() => navigate("/cases")} onCaseDetail={bedroom} onInbox={() => navigate("/inbox")} onSupportChat={() => navigate("/support")} onNav={onNav} /></RenterPage>} />
        <Route path="/cases" element={<RenterPage><CasesScreen onCase={(caseKey) => navigate(`/cases/${encodeURIComponent(caseKey)}`)} onNav={onNav} /></RenterPage>} />
        <Route path="/inbox" element={<RenterPage><InboxScreen onCase={(caseKey) => navigate(`/cases/${encodeURIComponent(caseKey)}`)} onNav={onNav} /></RenterPage>} />
        <Route path="/profile" element={<RenterPage><ProfileScreen onNav={onNav} /></RenterPage>} />
        <Route path="/support" element={<SupportChatScreen onBack={() => navigate("/")} />} />
        <Route path="/cases/:caseId" element={<CaseRoute onNav={onNav} />} />
        <Route path="/cases/:caseId/report" element={<SubmittedReportRoute />} />
        <Route path="/report" element={<ReportWorkflow />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </PhoneShell>
  );
}
