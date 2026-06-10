import { useState } from "react";
import type { DetectResponse, TargetFormat } from "../types/api";
import { convertFile, downloadBlob } from "../api";
import { ResultDownload } from "./ResultDownload";

interface Props {
  file: File;
  format: DetectResponse["format"];
}

const TARGETS: Record<DetectResponse["format"], TargetFormat[]> = {
  epub: ["docx"],
  pdf: ["docx"],
  docx: ["epub", "pdf"],
};

export function ConvertPanel({ file, format }: Props) {
  const [loading, setLoading] = useState<TargetFormat | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ blob: Blob; filename: string } | null>(null);

  async function handleConvert(target: TargetFormat) {
    setLoading(target);
    setError(null);
    setResult(null);
    try {
      const blob = await convertFile(file, target);
      const outName = file.name.replace(/\.[^.]+$/, `.${target}`);
      setResult({ blob, filename: outName });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Conversion failed");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div>
      <div className="convert-actions">
        {TARGETS[format].map((target) => (
          <button
            key={target}
            onClick={() => handleConvert(target)}
            disabled={loading !== null}
          >
            {loading === target ? "Converting..." : `Convert to ${target.toUpperCase()}`}
          </button>
        ))}
      </div>
      {error && <p className="error-text">{error}</p>}
      {result && (
        <ResultDownload
          filename={result.filename}
          onDownload={() => downloadBlob(result.blob, result.filename)}
        />
      )}
    </div>
  );
}
