import { useCallback, useEffect, useRef, useState } from "react";
import { preparePhoto } from "../../utils/localPhoto";
import type { LocalPhoto, PhotoType } from "../../types/evidence";
import Btn from "../common/Btn";
import { IcoX, IcoHelp, IcoGallery, IcoFlash } from "../common/icons";
import { CameraSession, cameraErrorMessage, captureFrame } from "./cameraSession";
import { QualityGuidance, sampleLuminance, type QualityHint } from "./cameraQuality";
import { CameraTorch } from "./cameraTorch";
import "./camera.css";

type CameraState = "idle" | "starting" | "live" | "paused" | "error";
export default function PhotoSource({ role, onPhoto, onClose, requestInstruction }: {
  role: PhotoType; onPhoto: (photo: LocalPhoto) => void; onClose: () => void;
  requestInstruction?: string;
}) {
  const camera = useRef<HTMLInputElement>(null), gallery = useRef<HTMLInputElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const [session] = useState(() => new CameraSession());
  const active = useRef(true), cameraVersion = useRef(0), processing = useRef(false);
  const startTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const torch = useRef<CameraTorch | null>(null);
  const [torchAvailable, setTorchAvailable] = useState(false), [torchOn, setTorchOn] = useState(false), [torchBusy, setTorchBusy] = useState(false);
  const [instructionVisible, setInstructionVisible] = useState(true);
  const [instructionVisit, setInstructionVisit] = useState(0);
  const [state, setState] = useState<CameraState>("starting");
  const [busy, setBusy] = useState(false), [error, setError] = useState("");
  const [hint, setHint] = useState<QualityHint>("framing");
  const framing = role === "overview" ? "Capture an overview of the issue. Try to include the surrounding area." : "Move closer and show the affected area clearly.";

  const stop = useCallback(() => {
    cameraVersion.current++;
    if (startTimer.current) clearTimeout(startTimer.current);
    startTimer.current = null;
    torch.current?.dispose(); torch.current = null;
    session.stop();
    if (video.current) { video.current.pause(); video.current.srcObject = null; }
  }, [session]);

  const start = useCallback(async () => {
    if (processing.current) return;
    if (document.hidden) { setState("paused"); return; }
    stop();
    const version = cameraVersion.current;
    setError(""); setHint("framing"); setInstructionVisible(true);
    setTorchAvailable(false); setTorchOn(false); setTorchBusy(false);
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
      torch.current = new CameraTorch(stream.getVideoTracks()[0]);
      setTorchAvailable(torch.current.supported);
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
    void start();
    return () => {
      active.current = false; stop();
      document.removeEventListener("visibilitychange", visibility);
      window.removeEventListener("pagehide", pause);
    };
  }, [start, stop]);

  useEffect(() => {
    if (state !== "live" || !instructionVisible) return;
    const timer = setTimeout(() => setInstructionVisible(false), 5000);
    return () => clearTimeout(timer);
  }, [state, instructionVisible, instructionVisit]);

  const toggleTorch = async () => {
    const current = torch.current;
    if (!current || torchBusy || state !== "live") return;
    setTorchBusy(true);
    try {
      const enabled = await current.set(!torchOn);
      if (active.current && torch.current === current) setTorchOn(enabled);
    } catch {
      current.dispose();
      if (active.current && torch.current === current) { setTorchAvailable(false); setTorchOn(false); }
    } finally { if (active.current && torch.current === current) setTorchBusy(false); }
  };

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
    stop(); setState("idle"); setError(""); input.current?.click();
  };
  const message = hint === "dark" ? "It's a little dark. Try moving to a brighter position."
    : hint === "moving" ? "Hold steady" : hint === "ready" ? "Ready to capture" : "Find your frame";

  return <div className="camera-surface">
    <video ref={video} className="camera-video" aria-label="Live camera preview" autoPlay muted playsInline
      onPlaying={() => {
        if (!video.current?.srcObject || document.hidden) return;
        if (startTimer.current) clearTimeout(startTimer.current);
        startTimer.current = null; setState("live");
      }} onError={() => { stop(); setState("error"); setError("The camera preview stopped. Try again or choose a photo."); }} />
    <header className="camera-top">
      <button className="camera-icon" aria-label="Leave camera" onClick={() => { stop(); onClose(); }}><IcoX /></button>
      <div className="camera-heading">
        <h2>{requestInstruction !== undefined ? "Requested evidence" : role === "overview" ? "Overview" : "Close-up"}</h2>
        {requestInstruction === undefined && <p>{role === "overview" ? "1" : "2"} of 2</p>}
      </div>
      <button className="camera-icon" aria-label="Show capture instruction" disabled={state !== "live"}
        onClick={() => { setInstructionVisible(true); setInstructionVisit(n => n + 1); }}><IcoHelp /></button>
    </header>
    {state !== "live" && <div className="camera-fallback">
      <p role={error ? "alert" : "status"}>{busy ? "Preparing photo…" : error || (state === "starting" ? "Opening camera…" : state === "paused" ? "Camera paused. Resume when you're ready." : "Choose a photo or resume the camera.")}</p>
      {!busy && state !== "starting" && <>
        <Btn onClick={() => void start()}>{state === "error" ? "Try camera again" : "Resume camera"}</Btn>
        <button className="camera-picker" onClick={() => pick(camera)}>Use camera / photo picker</button>
      </>}
    </div>}
    {state === "live" && <div className="camera-guidance" data-instruction-visible={instructionVisible}>
      <p className="camera-quality" role="status" aria-live="polite">{message}</p>
      <div className="camera-instruction-wrap" aria-hidden={!instructionVisible} inert={!instructionVisible}>
        <div className="camera-instruction-clip">
          <div className="camera-instruction">
            <div>{requestInstruction !== undefined && <p className="camera-request">{requestInstruction}</p>}<p>{framing}</p></div>
            <button className="camera-icon" aria-label="Dismiss capture instruction" onClick={() => setInstructionVisible(false)}><IcoX /></button>
          </div>
        </div>
      </div>
    </div>}
    <div className="camera-controls">
      <button className="camera-icon" aria-label="Choose from gallery" disabled={busy} onClick={() => pick(gallery)}><IcoGallery /></button>
      <button className="camera-shutter" aria-label="Capture photo" disabled={busy || state !== "live"} onClick={() => void shutter()}><span /></button>
      {state === "live" && torchAvailable
        ? <button className="camera-icon camera-torch" aria-label={torchOn ? "Turn torch off" : "Turn torch on"} aria-pressed={torchOn} disabled={torchBusy} onClick={() => void toggleTorch()}><IcoFlash /></button>
        : <span aria-hidden="true" />}
    </div>
    <input ref={camera} aria-label="Take photo" type="file" accept="image/*" capture="environment" onChange={select} hidden />
    <input ref={gallery} aria-label="Choose photo" type="file" accept="image/*" onChange={select} hidden />
  </div>;
}
