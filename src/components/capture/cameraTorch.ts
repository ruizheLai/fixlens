type TorchCapabilities = MediaTrackCapabilities & { torch?: boolean };
type TorchSettings = MediaTrackSettings & { torch?: boolean };
type TorchConstraint = MediaTrackConstraintSet & { torch: boolean };

// Optional enhancement on the existing track; never opens a second stream.
export class CameraTorch {
  readonly supported: boolean;
  private disposed = false;
  private pending = false;
  private track: MediaStreamTrack;
  constructor(track: MediaStreamTrack) {
    this.track = track;
    try {
      this.supported = track.readyState === "live"
        && (track.getCapabilities() as TorchCapabilities).torch === true;
    } catch { this.supported = false; }
  }
  private apply(enabled: boolean) {
    const constraints = this.track.getConstraints();
    return this.track.applyConstraints({ ...constraints,
      advanced: [...(constraints.advanced ?? []).map(item => {
        const { torch: _torch, ...rest } = item as TorchConstraint; return rest;
      }), { torch: enabled } as TorchConstraint],
    });
  }
  async set(enabled: boolean): Promise<boolean> {
    if (!this.supported || this.disposed || this.pending || this.track.readyState !== "live") return false;
    this.pending = true;
    try {
      await this.apply(enabled);
      if (this.disposed || this.track.readyState !== "live") return false;
      if ((this.track.getSettings() as TorchSettings).torch !== enabled) throw new Error("Torch unavailable");
      return enabled;
    } finally {
      this.pending = false;
      // A toggle may resolve after shutter/exit. Cleanup must win that race.
      if (this.disposed) this.off();
    }
  }
  private off() {
    if (!this.supported) return;
    try { void this.apply(false).catch(() => {}); } catch { /* Stopped/unsupported track. */ }
  }
  dispose() { this.disposed = true; this.off(); }
}
