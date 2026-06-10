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
  const [dragging, setDragging] = useState(false);
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
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }

  function handleDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragging(true);
  }

  function handleDragLeave() {
    setDragging(false);
  }

  return (
    <div>
      <div
        className={`dropzone${dragging ? " dragging" : ""}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".epub, .pdf, .docx"
          onChange={handleChange}
          style={{ display: "none" }}
        />
        <div className="upload-ic">
          <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 16V4" />
            <path d="M6 10l6-6 6 6" />
            <path d="M4 18v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
          </svg>
        </div>
        <p>{loading ? "Detecting..." : "Drop file here or click to browse"}</p>
        <p className="hint">Supports .epub, .pdf, .docx</p>
      </div>
      {error && <p className="error-text">{error}</p>}
    </div>
  );
}
