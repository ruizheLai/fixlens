// Match object-fit: cover so guidance describes the visible preview. This is NOT
// the accepted evidence capture path, which retains its existing full image.
export function previewCrop(width: number, height: number, viewWidth: number, viewHeight: number) {
  if (Math.min(width, height, viewWidth, viewHeight) <= 0) throw new Error("Preview unavailable");
  const scale = Math.max(viewWidth / width, viewHeight / height);
  const sourceWidth = viewWidth / scale, sourceHeight = viewHeight / scale;
  return { x: (width - sourceWidth) / 2, y: (height - sourceHeight) / 2, width: sourceWidth, height: sourceHeight };
}
export function framingFrame(video: HTMLVideoElement): string {
  const crop = previewCrop(video.videoWidth, video.videoHeight, video.clientWidth, video.clientHeight);
  const scale = Math.min(1, 768 / Math.max(crop.width, crop.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(crop.width * scale)); canvas.height = Math.max(1, Math.round(crop.height * scale));
  try {
    const context = canvas.getContext("2d"); if (!context) throw new Error("Preview unavailable");
    context.drawImage(video, crop.x, crop.y, crop.width, crop.height, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", .65);
  } finally { canvas.width = 0; canvas.height = 0; }
}
