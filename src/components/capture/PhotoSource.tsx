import { useEffect, useRef, useState } from "react";
import { AROverviewScreen, ARCloseupScreen } from "./PrototypeCapture";
import { preparePhoto } from "../../utils/localPhoto";
import type { LocalPhoto, PhotoType } from "../../types/evidence";
import ScreenHeader from "../common/ScreenHeader";
import Btn from "../common/Btn";

export default function PhotoSource({ role, onPhoto, onClose, requestInstruction }: { role: PhotoType; onPhoto: (photo: LocalPhoto) => void; onClose: () => void; requestInstruction?: string }) {
  const camera = useRef<HTMLInputElement>(null), gallery = useRef<HTMLInputElement>(null);
  const active = useRef(true);
  const [busy, setBusy] = useState(false), [error, setError] = useState("");
  useEffect(() => { active.current = true; return () => { active.current = false; }; }, []);
  const select = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; e.target.value = "";
    if (!file || busy) return;
    setBusy(true); setError("");
    try {
      const photo = await preparePhoto(file, role);
      if (active.current) onPhoto(photo); else URL.revokeObjectURL(photo.previewUrl);
    } catch (error) {
      if (active.current) setError(error instanceof Error ? error.message : "Couldn't open this photo. Please try again.");
    } finally { if (active.current) setBusy(false); }
  };
  const Screen = role === "overview" ? AROverviewScreen : ARCloseupScreen;
  return <>
    {requestInstruction !== undefined ? <div className="flex flex-col h-full">
      <ScreenHeader title="Requested evidence" onBack={onClose} />
      <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-5">
        <p style={{ fontSize: 14, lineHeight: 1.6 }}>{requestInstruction}</p>
        <p style={{ fontSize: 13, color: "var(--color-muted)" }}>Provide one photo. You can preview and annotate it before submitting.</p>
        <Btn disabled={busy} onClick={() => camera.current?.click()}>Take photo</Btn>
        <Btn disabled={busy} onClick={() => gallery.current?.click()}>Choose from photos</Btn>
      </div>
    </div> : <Screen onCapture={() => { if (!busy) camera.current?.click(); }} onGallery={() => { if (!busy) gallery.current?.click(); }} onClose={onClose} realPhoto />}
    <input ref={camera} aria-label="Take photo" type="file" accept="image/*" capture="environment" onChange={select} hidden />
    <input ref={gallery} aria-label="Choose photo" type="file" accept="image/*" onChange={select} hidden />
    {(busy || error) && <div role={error ? "alert" : "status"} style={{ position: "absolute", top: 110, left: 20, right: 20, zIndex: 30, borderRadius: 12, background: "rgba(0,0,0,0.8)", color: "#fff", padding: 14, fontSize: 13 }}>{busy ? "Preparing photo…" : error}</div>}
  </>;
}
