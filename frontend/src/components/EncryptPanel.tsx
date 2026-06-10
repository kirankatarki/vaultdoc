import { useState } from "react";
import { encryptFile, downloadBlob } from "../api";
import { ResultDownload } from "./ResultDownload";

interface Props {
  file: File;
}

export function EncryptPanel({ file }: Props) {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ blob: Blob; filename: string } | null>(null);

  async function handleEncrypt() {
    if (!password) return;
    setLoading(true);
    setError(null);
    try {
      const blob = await encryptFile(file, password);
      const outName = `${file.name}.encrypted.zip`;
      setResult({ blob, filename: outName });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Encryption failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="field-group">
        <div className="field-row">
          <input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button onClick={handleEncrypt} disabled={loading || !password}>
            {loading ? "Encrypting..." : "Encrypt"}
          </button>
        </div>
        {error && <p className="error-text">{error}</p>}
      </div>
      {result && (
        <ResultDownload
          filename={result.filename}
          onDownload={() => downloadBlob(result.blob, result.filename)}
        />
      )}
    </div>
  );
}
