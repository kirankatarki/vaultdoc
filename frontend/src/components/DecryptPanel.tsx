import { useState } from "react";
import { decryptFile } from "../api";

interface Props {
  file: File;
  onDecrypted: (file: File, result: { blob: Blob; filename: string }) => void;
}

export function DecryptPanel({ file, onDecrypted }: Props) {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDecrypt() {
    if (!password) return;
    setLoading(true);
    setError(null);
    try {
      const blob = await decryptFile(file, password);
      const decryptedName = file.name.replace(/\.encrypted\.zip$/, "");
      const decryptedFile = new File([blob], decryptedName, { type: blob.type });
      onDecrypted(decryptedFile, { blob, filename: decryptedName });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Decryption failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="field-group">
      <div className="field-row">
        <input
          type="password"
          placeholder="Enter password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button onClick={handleDecrypt} disabled={loading || !password}>
          {loading ? "Decrypting..." : "Decrypt"}
        </button>
      </div>
      {error && <p className="error-text">{error}</p>}
    </div>
  );
}
