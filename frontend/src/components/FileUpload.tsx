import React, { useRef, useState } from "react";
import { detectFile } from "../api";

interface Props {
  onFileDetected: (
    file: File,
    detected: import("../types/api").DetectResponse,
  ) => void;
}

export function FileUpload({ onFileDetected }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setLoading(true);
    setError(null);
    try {
      const detected = await detectFile(file);
      onFileDetected(file, detected);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Detection failed");
    } finally {
      setLoading(false);
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }

  function handleDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
  }

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onClick={() => inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".epub, .pdf, .docx"
        onChange={handleChange}
        style={{ display: "none" }}
      />
      {loading ? <p>Detecting...</p> : <p>Drop file here or click to browse</p>}
      {error && <p>{error}</p>}
    </div>
  );
}
