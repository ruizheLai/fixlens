import { lazy, Suspense, useEffect, useState } from "react";
import { Navigate, Route, Routes, useNavigate, useParams } from "react-router-dom";
import PhoneShell from "./app/PhoneShell";
import FloatingChatBtn from "./components/navigation/FloatingChatBtn";
import { ARCloseupScreen, PhotoPreview } from "./components/capture/PrototypeCapture";
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

function CaseRoute({ evidenceAdded, onEvidenceAdded, onNav }: {
  evidenceAdded: string[]; onEvidenceAdded: (requestId: string) => void; onNav: (id: NavItemId) => void;
}) {
  const { caseId } = useParams();
  return <LoadedCaseRoute key={caseId} caseKey={caseId ?? ""} evidenceAdded={evidenceAdded} onEvidenceAdded={onEvidenceAdded} onNav={onNav} />;
}

function LoadedCaseRoute({ caseKey, evidenceAdded, onEvidenceAdded, onNav }: {
  caseKey: string; evidenceAdded: string[]; onEvidenceAdded: (requestId: string) => void; onNav: (id: NavItemId) => void;
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
  // Requests determine this presentation; capture remains a local simulation.
  if (detail.evidenceRequests.length > 0) return <RequestedEvidenceCaseRoute detail={detail} evidenceAdded={evidenceAdded} onEvidenceAdded={onEvidenceAdded} onNav={onNav} />;
  return <RenterPage><BedroomCaseDetailScreen {...common} /></RenterPage>;
}

function RequestedEvidenceCaseRoute({ detail, evidenceAdded, onEvidenceAdded, onNav }: {
  detail: CaseDetail; evidenceAdded: string[]; onEvidenceAdded: (requestId: string) => void; onNav: (id: NavItemId) => void;
}) {
  const [requestId, setRequestId] = useState<string | null>(null);
  const [step, setStep] = useState<"case" | "capture" | "preview">("case");
  const navigate = useNavigate();
  if (step === "capture") return <ARCloseupScreen onCapture={() => setStep("preview")} onClose={() => setStep("case")} />;
  if (step === "preview") return <PhotoPreview photoType="closeup" onRetake={() => setStep("capture")} onUse={() => { if (requestId) onEvidenceAdded(requestId); setStep("case"); }} />;
  return <RenterPage><KitchenCaseDetailScreen detail={detail} evidenceAdded={evidenceAdded} onAddEvidence={(id) => { setRequestId(id); setStep("capture"); }} onBack={() => navigate("/cases")} onViewReport={() => navigate(`/cases/${encodeURIComponent(detail.caseKey)}/report`)} onNav={onNav} /></RenterPage>;
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
  // Local photo acknowledgements survive navigation, reset on refresh, and never change live requests.
  const [localEvidenceAdded, setLocalEvidenceAdded] = useState<string[]>([]);
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
        <Route path="/cases/:caseId" element={<CaseRoute evidenceAdded={localEvidenceAdded} onEvidenceAdded={(id) => setLocalEvidenceAdded((ids) => ids.includes(id) ? ids : [...ids, id])} onNav={onNav} />} />
        <Route path="/cases/:caseId/report" element={<SubmittedReportRoute />} />
        <Route path="/report" element={<ReportWorkflow />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </PhoneShell>
  );
}
