import { useEffect, useState } from "react";
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
import { casePath, isDemoCaseId } from "./data/demo/cases";
import type { NavItemId } from "./types/navigation";
import type { CaseDetail } from "./types/case";
import { getCaseByKey } from "./services/cases";
import ScreenHeader from "./components/common/ScreenHeader";
import NavBar from "./components/navigation/NavBar";

const NAV_PATHS: Record<NavItemId, string> = { home: "/", cases: "/cases", inbox: "/inbox", profile: "/profile" };

function RenterPage({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  return <>{children}<FloatingChatBtn onClick={() => navigate("/support")} /></>;
}

function CaseRoute({ evidenceAdded, onEvidenceAdded, onNav }: {
  evidenceAdded: boolean; onEvidenceAdded: () => void; onNav: (id: NavItemId) => void;
}) {
  const { caseId } = useParams();
  return <LoadedCaseRoute key={caseId} caseKey={caseId ?? ""} evidenceAdded={evidenceAdded} onEvidenceAdded={onEvidenceAdded} onNav={onNav} />;
}

function LoadedCaseRoute({ caseKey, evidenceAdded, onEvidenceAdded, onNav }: {
  caseKey: string; evidenceAdded: boolean; onEvidenceAdded: () => void; onNav: (id: NavItemId) => void;
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
  // Transitional evidence simulation only; the primary status always comes from Supabase.
  if (caseKey === "kitchen-tap") return <KitchenCaseRoute detail={detail} evidenceAdded={evidenceAdded} onEvidenceAdded={onEvidenceAdded} onNav={onNav} />;
  return <RenterPage><BedroomCaseDetailScreen {...common} /></RenterPage>;
}

function KitchenCaseRoute({ detail, evidenceAdded, onEvidenceAdded, onNav }: {
  detail: CaseDetail; evidenceAdded: boolean; onEvidenceAdded: () => void; onNav: (id: NavItemId) => void;
}) {
  const [step, setStep] = useState<"case" | "capture" | "preview">("case");
  const navigate = useNavigate();
  if (step === "capture") return <ARCloseupScreen onCapture={() => setStep("preview")} onClose={() => setStep("case")} />;
  if (step === "preview") return <PhotoPreview photoType="closeup" onRetake={() => setStep("capture")} onUse={() => { onEvidenceAdded(); setStep("case"); }} />;
  return <RenterPage><KitchenCaseDetailScreen detail={detail} evidenceAdded={evidenceAdded} onAddEvidence={() => setStep("capture")} onBack={() => navigate("/cases")} onNav={onNav} /></RenterPage>;
}

function SubmittedReportRoute() {
  const { caseId } = useParams();
  const navigate = useNavigate();
  if (!isDemoCaseId(caseId)) return <Navigate to="/cases" replace />;
  return <SubmittedReportScreen key={caseId} onBack={() => navigate(casePath(caseId))} />;
}

export default function App() {
  // This demo flag intentionally survives route changes but resets on refresh.
  const [kitchenEvidenceAdded, setKitchenEvidenceAdded] = useState(false);
  const navigate = useNavigate();
  const onNav = (id: NavItemId) => navigate(NAV_PATHS[id]);
  const bedroom = () => navigate(casePath("bedroom-window-leak"));
  const kitchen = () => navigate(casePath("kitchen-tap"));

  return (
    <PhoneShell>
      <Routes>
        <Route path="/" element={<RenterPage><HomeScreen onReport={() => navigate("/report")} onMyCases={() => navigate("/cases")} onCaseDetail={bedroom} onInbox={() => navigate("/inbox")} onSupportChat={() => navigate("/support")} onNav={onNav} /></RenterPage>} />
        <Route path="/cases" element={<RenterPage><CasesScreen onCase={(caseKey) => navigate(`/cases/${encodeURIComponent(caseKey)}`)} onNav={onNav} /></RenterPage>} />
        <Route path="/inbox" element={<RenterPage><InboxScreen onNotifBedroom={bedroom} onNotifKitchen={kitchen} onNav={onNav} /></RenterPage>} />
        <Route path="/profile" element={<RenterPage><ProfileScreen onNav={onNav} /></RenterPage>} />
        <Route path="/support" element={<SupportChatScreen onBack={() => navigate("/")} />} />
        <Route path="/cases/:caseId" element={<CaseRoute evidenceAdded={kitchenEvidenceAdded} onEvidenceAdded={() => setKitchenEvidenceAdded(true)} onNav={onNav} />} />
        <Route path="/cases/:caseId/report" element={<SubmittedReportRoute />} />
        <Route path="/report" element={<ReportWorkflow />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </PhoneShell>
  );
}
