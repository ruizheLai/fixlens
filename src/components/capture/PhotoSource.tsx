import { useCallback, useEffect, useRef, useState } from "react";
import { preparePhoto } from "../../utils/localPhoto";
import type { LocalPhoto, PhotoType } from "../../types/evidence";
import ScreenHeader from "../common/ScreenHeader";
import Btn from "../common/Btn";
import { CameraSession, cameraErrorMessage, captureFrame } from "./cameraSession";
import { QualityGuidance, sampleLuminance, type QualityHint } from "./cameraQuality";

type CameraState = "idle" | "starting" | "live" | "paused" | "error";
export default function PhotoSource({ role, onPhoto, onClose, requestInstruction, autoStart = false, onCameraOpened, onPickerChosen }: {
  role: PhotoType; onPhoto: (photo: LocalPhoto) => void; onClose: () => void;
  requestInstruction?: string; autoStart?: boolean; onCameraOpened?: () => void; onPickerChosen?: () => void;
}) {
  const camera = useRef<HTMLInputElement>(null), gallery = useRef<HTMLInputElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const [session] = useState(() => new CameraSession());
  const active = useRef(true), cameraVersion = useRef(0), processing = useRef(false);
  const startTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onOpened = useRef(onCameraOpened); onOpened.current = onCameraOpened;
  const [state, setState] = useState<CameraState>("idle");
  const [busy, setBusy] = useState(false), [error, setError] = useState("");
  const [hint, setHint] = useState<QualityHint>("framing");
  const framing = role === "overview" ? "Show the issue and the surrounding area." : "Move closer and show the affected area clearly.";

  const stop = useCallback(() => {
    cameraVersion.current++;
    if (startTimer.current) clearTimeout(startTimer.current);
    startTimer.current = null;
    session.stop();
    if (video.current) { video.current.pause(); video.current.srcObject = null; }
  }, [session]);

  const start = useCallback(async () => {
    if (processing.current || document.hidden) return;
    stop();
    const version = cameraVersion.current;
    setError(""); setHint("framing");
    if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
      setState("error"); setError("Live camera isn't available here. Use the photo picker or Gallery."); return;
    }
    setState("starting");
    try {
      const stream = await session.open(constraints => navigator.mediaDevices.getUserMedia(constraints), () => {
        stop();
        if (active.current) { setState("error"); setError("The camera stopped. Open it again, or use the photo picker or Gallery."); }
      });
      if (!stream || !active.current || version !== cameraVersion.current) return;
      const element = video.current;
      if (!element) { stop(); return; }
      onOpened.current?.();
      element.srcObject = stream;
      startTimer.current = setTimeout(() => {
        if (version !== cameraVersion.current) return;
        stop(); setState("error"); setError("The camera preview couldn't load. Try again or choose a photo.");
      }, 15000);
      await element.play();
    } catch (failure) {
      if (!active.current || version !== cameraVersion.current) return;
      stop(); setState("error"); setError(cameraErrorMessage(failure));
    }
  }, [session, stop]);

  useEffect(() => {
    active.current = true;
    const pause = () => {
      stop();
      if (active.current) { setState("paused"); setHint("framing"); }
    };
    const visibility = () => { if (document.hidden) pause(); };
    document.addEventListener("visibilitychange", visibility);
    window.addEventListener("pagehide", pause);
    if (autoStart) void start();
    return () => {
      active.current = false; stop();
      document.removeEventListener("visibilitychange", visibility);
      window.removeEventListener("pagehide", pause);
    };
  }, [autoStart, start, stop]);

  useEffect(() => {
    if (state !== "live") return;
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d", { willReadFrequently: true });
    const guidance = new QualityGuidance();
    if (!context) return;
    const interval = setInterval(() => {
      const element = video.current;
      if (document.hidden || !element?.srcObject || element.readyState < 2 || !element.videoWidth || !element.videoHeight) return;
      canvas.width = 96; canvas.height = Math.max(1, Math.round(96 * element.videoHeight / element.videoWidth));
      try {
        context.drawImage(element, 0, 0, canvas.width, canvas.height);
        setHint(guidance.update(sampleLuminance(context.getImageData(0, 0, canvas.width, canvas.height).data), performance.now()));
      } catch { setHint("framing"); } // Capture still works if advisory sampling is unavailable.
    }, 500);
    return () => { clearInterval(interval); canvas.width = 0; canvas.height = 0; };
  }, [state]);

  const prepare = async (file: File) => {
    try {
      const photo = await preparePhoto(file, role);
      if (active.current) onPhoto(photo); else URL.revokeObjectURL(photo.previewUrl);
    } catch (failure) {
      if (active.current) { setState("error"); setError(failure instanceof Error ? failure.message : "Couldn't open this photo. Please try again."); }
    } finally { processing.current = false; if (active.current) setBusy(false); }
  };
  const select = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; e.target.value = "";
    if (!file || processing.current) return;
    processing.current = true; stop(); setState("idle"); setBusy(true); setError("");
    void prepare(file);
  };
  const shutter = async () => {
    if (processing.current || state !== "live" || !video.current) return;
    processing.current = true; setBusy(true); setError("");
    try {
      const frame = captureFrame(video.current); // Draw synchronously before stopping tracks.
      stop(); setState("idle");
      await prepare(await frame);
    } catch (failure) {
      stop(); processing.current = false;
      if (active.current) { setBusy(false); setState("error"); setError(cameraErrorMessage(failure)); }
    }
  };
  const pick = (input: React.RefObject<HTMLInputElement | null>) => {
    if (processing.current) return;
    onPickerChosen?.();
    stop(); setState("idle"); setError(""); input.current?.click();
  };
  const message = hint === "dark" ? "It's a little dark. Try moving to a brighter position."
    : hint === "moving" ? "Hold steady" : hint === "ready" ? "Ready to capture" : framing;

  return <div className="absolute inset-0 flex flex-col" style={{ background: "#101418", color: "#fff" }}>
    <div style={{ background: "var(--color-surface)", color: "var(--color-text)", flexShrink: 0 }}>
      <ScreenHeader title={requestInstruction !== undefined ? "Requested evidence" : role === "overview" ? "Overview — 1 of 2" : "Close-up — 2 of 2"} onBack={() => { stop(); onClose(); }} />
    </div>
    <div className="flex-1 min-h-0 overflow-y-auto flex flex-col">
      <div className="px-5 py-3 shrink-0" style={{ fontSize: 14, lineHeight: 1.5 }}>
        {requestInstruction !== undefined && <p className="mb-2">{requestInstruction}</p>}
        <p>{framing}</p>
      </div>
      <div className="relative flex-1" style={{ minHeight: 150, background: "#000" }}>
        <video ref={video} aria-label="Live camera preview" autoPlay muted playsInline
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "contain" }}
          onPlaying={() => {
            if (!video.current?.srcObject || document.hidden) return;
            if (startTimer.current) clearTimeout(startTimer.current);
            startTimer.current = null; setState("live");
          }} onError={() => { stop(); setState("error"); setError("The camera preview stopped. Try again or choose a photo."); }} />
        {state !== "live" && <div className="relative flex flex-col items-center justify-center gap-3 p-5 text-center" style={{ minHeight: 150 }}>
          <p role={error ? "alert" : "status"} style={{ fontSize: 14, lineHeight: 1.5 }}>{busy ? "Preparing photo…" : error || (state === "starting" ? "Opening camera… You can also choose a saved photo." : state === "paused" ? "Camera paused. Open it again when you're ready." : "Open your camera to take a photo inside FixLens, or choose a saved photo.")}</p>
          {!busy && state !== "starting" && <Btn onClick={() => void start()}>{state === "error" ? "Try camera again" : "Open camera"}</Btn>}
        </div>}
      </div>
      {state === "live" && <p role="status" aria-live="polite" className="px-5 py-3 text-center shrink-0" style={{ fontSize: 14, minHeight: 48 }}>{message}</p>}
      <div className="shrink-0 px-5 pt-3 pb-4" style={{ paddingBottom: "max(16px, env(safe-area-inset-bottom))" }}>
        <div className="flex items-center justify-between gap-3">
          <button disabled={busy} onClick={() => pick(gallery)} style={{ minHeight: 48, minWidth: 72, fontSize: 14 }}>Gallery</button>
          <button aria-label="Capture photo" disabled={busy || state !== "live"} onClick={() => void shutter()}
            style={{ width: 72, height: 72, borderRadius: "50%", border: "4px solid #fff", padding: 5, opacity: busy || state !== "live" ? .4 : 1 }}>
            <span style={{ display: "block", width: "100%", height: "100%", background: "#fff", borderRadius: "50%" }} />
          </button>
          <span aria-hidden="true" style={{ width: 72 }} />
        </div>
        <button disabled={busy} onClick={() => pick(camera)} className="w-full mt-2" style={{ minHeight: 44, fontSize: 13, color: "#cbd5e1" }}>Use camera / photo picker</button>
      </div>
    </div>
    <input ref={camera} aria-label="Take photo" type="file" accept="image/*" capture="environment" onChange={select} hidden />
    <input ref={gallery} aria-label="Choose photo" type="file" accept="image/*" onChange={select} hidden />
  </div>;
}
