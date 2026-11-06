import type { AttachmentPayload } from "@/services/aiService";

/** Files the backend can read (see the backend's attachments.py). */
export const ACCEPTED_FILES =
  "image/*,.pdf,.docx,.xlsx,.pptx,.txt,.md,.csv,.json";

const CLAUDE_IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];
const MAX_IMAGE_BYTES = 4.5 * 1024 * 1024;
const MAX_IMAGE_SIDE = 2000;

const toBase64 = (blob: Blob): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(",", 2)[1] ?? "");
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });

/** Phone photos are often over 5 MB, or HEIC: re-encode them as a JPEG of at
 *  most 2000 px a side, which keeps them readable and small enough. */
const shrinkImage = async (file: File): Promise<Blob> => {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error(`“${file.name}” is a picture format this browser can't open.`));
      el.src = url;
    });
    const scale = Math.min(1, MAX_IMAGE_SIDE / Math.max(img.naturalWidth, img.naturalHeight));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(img.naturalWidth * scale);
    canvas.height = Math.round(img.naturalHeight * scale);
    canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
    return await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Could not prepare the picture."))), "image/jpeg", 0.85)
    );
  } finally {
    URL.revokeObjectURL(url);
  }
};

export const toAttachmentPayload = async (file: File): Promise<AttachmentPayload> => {
  if (file.type.startsWith("image/") && (!CLAUDE_IMAGE_TYPES.includes(file.type) || file.size > MAX_IMAGE_BYTES)) {
    const jpeg = await shrinkImage(file);
    return { name: file.name.replace(/\.[^.]+$/, "") + ".jpg", media_type: "image/jpeg", data: await toBase64(jpeg) };
  }
  return { name: file.name, media_type: file.type || "", data: await toBase64(file) };
};
