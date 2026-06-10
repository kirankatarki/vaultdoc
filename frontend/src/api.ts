import type { DetectResponse } from "./types/api";
import type { TargetFormat } from "./types/api";

const BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

export async function detectFile(file: File): Promise<DetectResponse> {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch(`${BASE}/detect`, { method: "POST", body: fd });
  if (!res.ok) throw new Error((await res.json()).detail);
  return res.json();
}

export async function decryptFile(file: File, password: string): Promise<Blob> {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("password", password);
  const res = await fetch(`${BASE}/decrypt`, { method: "POST", body: fd });
  if (!res.ok) throw new Error((await res.json()).detail);
  return res.blob();
}

export async function convertFile(
  file: File,
  targetFormat: TargetFormat,
): Promise<Blob> {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("target_format", targetFormat);
  const res = await fetch(`${BASE}/convert`, { method: "POST", body: fd });
  if (!res.ok) throw new Error((await res.json()).detail);
  return res.blob();
}

export async function encryptFile(file: File, password: string): Promise<Blob> {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("password", password);
  const res = await fetch(`${BASE}/encrypt`, { method: "POST", body: fd });
  if (!res.ok) throw new Error((await res.json()).detail);
  return res.blob();
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
