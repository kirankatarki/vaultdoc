import { useState } from "react";
import type { DetectResponse } from "./types/api";
import { FileUpload } from "./components/FileUpload";
import { FormatBadge } from "./components/FormatBadge";
import { DecryptPanel } from "./components/DecryptPanel";
import { ConvertPanel } from "./components/ConvertPanel";
import { EncryptPanel } from "./components/EncryptPanel";

type AppState =
  | { stage: "idle" }
  | { stage: "detected"; file: File; detected: DetectResponse }
  | { stage: "ready"; file: File; detected: DetectResponse };

export default function App() {
  const [state, setState] = useState<AppState>({ stage: "idle" });

  function handleFileDetected(file: File, detected: DetectResponse) {
    setState({ stage: "detected", file, detected });
  }

  function handleDecrypted(decryptedFile: File) {
    if (state.stage !== "detected") return;
    setState({ stage: "ready", file: decryptedFile, detected: state.detected });
  }

  return (
    <main>
      <h1>VaultDoc</h1>

      <FileUpload onFileDetected={handleFileDetected} />

      {state.stage !== "idle" && <FormatBadge detected={state.detected} />}

      {state.stage === "detected" && state.detected.encrypted && (
        <DecryptPanel file={state.file} onDecrypted={handleDecrypted} />
      )}

      {(state.stage === "ready" ||
        (state.stage === "detected" && !state.detected.encrypted)) && (
        <ConvertPanel file={state.file} format={state.detected.format} />
      )}

      {state.stage !== "idle" && <EncryptPanel file={state.file} />}
    </main>
  );
}
