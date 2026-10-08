export const CAMERA_CONSTRAINTS: MediaStreamConstraints = {
  video: { facingMode: { ideal: "environment" }, width: { ideal: 1920 }, height: { ideal: 1080 } },
  audio: false,
};

// Serialize even unresolved permission requests across capture screen mounts.
// getUserMedia cannot be aborted; a late result must be stopped before reuse.
let acquisition: Promise<void> = Promise.resolve();
let owner: CameraSession | null = null;

export class CameraSession {
  private generation = 0;
  private stream: MediaStream | null = null;
  private removeListeners: (() => void) | null = null;
  private opening: Promise<MediaStream | null> | null = null;

  open(request: (constraints: MediaStreamConstraints) => Promise<MediaStream>, onEnded: () => void): Promise<MediaStream | null> {
    if (this.opening) return this.opening;
    this.stop();
    const generation = this.generation;
    const current = acquisition.then(async () => {
      if (generation !== this.generation) return null;
      owner?.stop();
      let stream: MediaStream;
      try { stream = await request(CAMERA_CONSTRAINTS); }
      catch (error) { if (generation !== this.generation) return null; throw error; }
      if (generation !== this.generation) { stream.getTracks().forEach(track => track.stop()); return null; }
      this.stream = stream; owner = this;
      const ended = () => { this.stop(); onEnded(); };
      const tracks = stream.getVideoTracks();
      if (!tracks.length || tracks.some(track => track.readyState === "ended")) {
        this.stop(); throw new Error("Camera stream unavailable");
      }
      tracks.forEach(track => track.addEventListener("ended", ended));
      this.removeListeners = () => tracks.forEach(track => track.removeEventListener("ended", ended));
      return stream;
    });
    acquisition = current.then(() => {}, () => {});
    this.opening = current;
    void current.finally(() => { if (this.opening === current) this.opening = null; }).catch(() => {});
    return current;
  }

  stop() {
    this.generation++;
    this.opening = null;
    this.removeListeners?.(); this.removeListeners = null;
    this.stream?.getTracks().forEach(track => track.stop()); this.stream = null;
    if (owner === this) owner = null;
  }
}

export function cameraErrorMessage(error: unknown): string {
  const name = error instanceof Error ? error.name : "";
  if (name === "NotAllowedError" || name === "SecurityError") return "Camera access wasn't allowed. You can use the photo picker or Gallery instead.";
  if (name === "NotFoundError") return "No camera was found. Choose a photo from Gallery or use the photo picker.";
  return "The camera couldn't start. Try again, or use the photo picker or Gallery.";
}

export function captureFrame(video: HTMLVideoElement): Promise<File> {
  if (video.readyState < 2 || !video.videoWidth || !video.videoHeight) throw new Error("The camera isn't ready yet. Please try again.");
  const canvas = document.createElement("canvas");
  // Use intrinsic dimensions, bounded to the existing photo pipeline's limit.
  const scale = Math.min(1, 2048 / Math.max(video.videoWidth, video.videoHeight));
  canvas.width = Math.max(1, Math.round(video.videoWidth * scale));
  canvas.height = Math.max(1, Math.round(video.videoHeight * scale));
  const context = canvas.getContext("2d");
  if (!context) throw new Error("This photo couldn't be captured. Please use the photo picker.");
  context.drawImage(video, 0, 0, canvas.width, canvas.height);
  // Keep the full frame: CSS cover crops only the live display, never evidence.
  return new Promise((resolve, reject) => canvas.toBlob(blob => {
    canvas.width = 0; canvas.height = 0;
    if (blob) resolve(new File([blob], "capture.jpg", { type: "image/jpeg" }));
    else reject(new Error("This photo couldn't be captured. Please try again."));
  }, "image/jpeg", 0.92));
}
