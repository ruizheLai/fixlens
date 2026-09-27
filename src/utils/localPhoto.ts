import type { LocalPhoto, PhotoType } from "../types/evidence";

// Bound native phone photos for reliable uploads and browser memory use. Decode
// using the browser (including EXIF orientation), then strip EXIF/GPS on export.
export async function preparePhoto(file: File, role: PhotoType): Promise<LocalPhoto> {
  if (!file.type.startsWith("image/") || file.size > 20 * 1024 * 1024) throw new Error("Choose an image smaller than 20 MB.");
  const source = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.src = source;
    try { await image.decode(); } catch { throw new Error("This image couldn't be opened. Try a JPEG or PNG photo."); }
    const scale = Math.min(1, 2048 / Math.max(image.naturalWidth, image.naturalHeight));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
    const context = canvas.getContext("2d");
    if (!context) throw new Error("This image couldn't be prepared. Please try again.");
    context.fillStyle = "#fff"; context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob(value => value ? resolve(value) : reject(new Error("This image couldn't be prepared.")), "image/jpeg", 0.9));
    if (blob.size > 6 * 1024 * 1024) throw new Error("Please choose a smaller photo.");
    return { id: crypto.randomUUID(), role, file: blob, previewUrl: URL.createObjectURL(blob), version: 1,
      width: canvas.width, height: canvas.height, annotations: [] };
  } finally { URL.revokeObjectURL(source); }
}
