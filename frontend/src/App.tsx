import { useState } from "react";
import "./App.css";
import type { DetectResponse } from "./types/api";
import { downloadBlob } from "./api";
import { FileUpload } from "./components/FileUpload";
import { FormatBadge } from "./components/FormatBadge";
import { DecryptPanel } from "./components/DecryptPanel";
import { ConvertPanel } from "./components/ConvertPanel";
import { EncryptPanel } from "./components/EncryptPanel";
import { ResultDownload } from "./components/ResultDownload";

type AppState =
  | { stage: "idle" }
  | { stage: "detected"; file: File; detected: DetectResponse }
  | {
      stage: "ready";
      file: File;
      detected: DetectResponse;
      decryptedResult?: { blob: Blob; filename: string };
    };

export default function App() {
  const [state, setState] = useState<AppState>({ stage: "idle" });

  function handleFileDetected(file: File, detected: DetectResponse) {
    setState({ stage: "detected", file, detected });
  }

  function handleDecrypted(
    decryptedFile: File,
    result: { blob: Blob; filename: string },
  ) {
    if (state.stage !== "detected") return;
    setState({
      stage: "ready",
      file: decryptedFile,
      detected: state.detected,
      decryptedResult: result,
    });
  }

  function handleReset() {
    setState({ stage: "idle" });
  }

  const needsDecrypt = state.stage === "detected" && state.detected.encrypted;
  const isReady =
    state.stage === "ready" ||
    (state.stage === "detected" && !state.detected.encrypted);

  return (
    <div className="page">
      <div className="wrap">
        <nav>
          <div className="brand">
            <span className="mark"></span>FileChange
          </div>
          <div className="navlinks">
            <a href="#tech" aria-label="Security" title="Security">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3l8 4v5c0 5-3.5 8-8 9-4.5-1-8-4-8-9V7l8-4Z" />
                <path d="M9 12l2 2 4-4" />
              </svg>
            </a>
            <a href="https://github.com/kirankatarki/vaultdoc" target="_blank" rel="noreferrer" aria-label="GitHub repo" title="GitHub repo">
              <svg viewBox="0 0 24 24" fill="currentColor" stroke="none">
                <path d="M12 2C6.48 2 2 6.58 2 12.25c0 4.53 2.87 8.37 6.84 9.73.5.1.68-.22.68-.49 0-.24-.01-.87-.01-1.71-2.78.62-3.37-1.36-3.37-1.36-.46-1.18-1.11-1.5-1.11-1.5-.91-.64.07-.62.07-.62 1 .07 1.53 1.05 1.53 1.05.89 1.55 2.34 1.1 2.91.84.09-.66.35-1.1.63-1.36-2.22-.26-4.56-1.14-4.56-5.07 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.31.1-2.74 0 0 .84-.27 2.75 1.05a9.3 9.3 0 0 1 5 0c1.91-1.32 2.75-1.05 2.75-1.05.55 1.43.2 2.48.1 2.74.64.72 1.03 1.63 1.03 2.75 0 3.94-2.34 4.81-4.57 5.06.36.32.68.94.68 1.9 0 1.37-.01 2.47-.01 2.81 0 .27.18.6.69.49A10.26 10.26 0 0 0 22 12.25C22 6.58 17.52 2 12 2Z" />
              </svg>
            </a>
          </div>
        </nav>

        <header>
          <div className="eyebrow">Document utility</div>
          <h1>
            Convert &amp; <span className="grad">encrypt</span> documents.
          </h1>
          <p className="lede">
            Convert between EPUB, PDF and DOCX, and protect any file with
            AES-256 encryption. Entirely in-memory, nothing is written to
            disk or stored on a server.
          </p>
          <p className="problem">
            EPUB, PDF, and DOCX rarely move cleanly between each other, and
            locked files stall when no tool can read them. FileChange handles
            conversion and password protection in a single pass, then streams
            the result straight back to you.
          </p>
        </header>

        <div className="tool">
          <div className="tool-head">
            <span className="step-tag">
              <b>Workspace</b> &mdash; Upload, convert &amp; encrypt
            </span>
          </div>
          <div className="chamber">
            <div className={`chamber-inner${state.stage === "idle" ? "" : " plain"}`}>
              {state.stage === "idle" && (
                <FileUpload onFileDetected={handleFileDetected} />
              )}

              {state.stage !== "idle" && (
                <>
                  <div className="result-row">
                    <span className="result-filename" title={state.file.name}>
                      {state.file.name}
                    </span>
                    <button onClick={handleReset}>Reset</button>
                  </div>
                  <FormatBadge detected={state.detected} />

                  {needsDecrypt && (
                    <div className="action-block">
                      <p className="card-desc">
                        File <b>{state.file.name}</b> is encrypted. Enter the
                        password to decrypt it.
                      </p>
                      <DecryptPanel file={state.file} onDecrypted={handleDecrypted} />
                    </div>
                  )}

                  {isReady && state.stage === "ready" && state.decryptedResult && (
                    <div className="action-block">
                      <p className="card-desc">
                        File <b>{state.decryptedResult.filename}</b> has been
                        decrypted. Download it, or convert it to{" "}
                        {state.detected.format === "docx" ? "EPUB / PDF" : "DOCX"}.
                      </p>
                      <ResultDownload
                        filename={state.decryptedResult.filename}
                        onDownload={() => {
                          const { blob, filename } = state.decryptedResult!;
                          downloadBlob(blob, filename);
                        }}
                      />
                      <ConvertPanel file={state.file} format={state.detected.format} />
                    </div>
                  )}

                  {isReady &&
                    !(state.stage === "ready" && state.decryptedResult) && (
                      <div className="action-block">
                        <p className="card-desc">
                          File <b>{state.file.name}</b> is unencrypted.{" "}
                          {state.detected.format === "docx"
                            ? "Convert it to EPUB or PDF below."
                            : "Convert it to DOCX below."}
                        </p>
                        <ConvertPanel file={state.file} format={state.detected.format} />
                      </div>
                    )}

                  <div className="action-block">
                    <p className="card-desc">
                      Or wrap this file in a password-protected AES-256 ZIP.
                    </p>
                    <EncryptPanel file={state.file} />
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flow">
          <div className="node">
            <div className="nlabel">Input</div>
            <div className="nval">Your file</div>
            <div className="nsmall">EPUB / PDF / DOCX</div>
          </div>
          <div className="flarrow">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </div>
          <div className="node">
            <div className="nlabel">In memory</div>
            <div className="nval">Detect &amp; transform</div>
            <div className="nsmall">format + AES check</div>
          </div>
          <div className="flarrow">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </div>
          <div className="node">
            <div className="nlabel">Output</div>
            <div className="nval">Download</div>
            <div className="nsmall">streamed back</div>
          </div>
        </div>

        <div className="sec-label" id="how">How it works</div>
        <div className="steps">
          <div className="step">
            <div className="sn">1</div>
            <h3>Direct upload</h3>
            <p>Your file is sent to the backend over HTTPS as a multipart upload. It is <b>never written to disk</b>.</p>
          </div>
          <div className="step">
            <div className="sn">2</div>
            <h3>Detect format</h3>
            <p>The backend reads the file's magic bytes and ZIP structure to identify EPUB, PDF, or DOCX, and whether it's AES-encrypted.</p>
          </div>
          <div className="step">
            <div className="sn">3</div>
            <h3>Unlock if needed</h3>
            <p>If encrypted, your password unlocks the AES-256 container in memory. The <b>password is never stored</b>.</p>
          </div>
          <div className="step">
            <div className="sn">4</div>
            <h3>Convert</h3>
            <p>Conversions run through Pandoc, PyMuPDF and Tectonic, streaming bytes in and out of memory with no temporary files.</p>
          </div>
          <div className="step">
            <div className="sn">5</div>
            <h3>Stream back</h3>
            <p>The result returns as a binary response. Click <b>Download</b> to save it to your device.</p>
          </div>
          <div className="step">
            <div className="sn">6</div>
            <h3>Encrypt</h3>
            <p>Encryption wraps your file in a new AES-256 protected ZIP before streaming it back the same way.</p>
          </div>
        </div>

        <div className="sec-label" id="caps">Key capabilities</div>
        <div className="caps">
          <div className="cap">
            <div className="cap-ic">
              <svg viewBox="0 0 24 24" fill="none" stroke="var(--accent-strong)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 7V5a1 1 0 0 1 1-1h6l2 2h6a1 1 0 0 1 1 1v3" />
                <path d="M3 13l3-3 3 3M6 10v6" />
                <path d="M21 11l-3 3-3-3M18 14v-6" />
              </svg>
            </div>
            <h3>Two-way conversion</h3>
            <p>EPUB and PDF to DOCX, and DOCX back to EPUB or PDF, with structure preserved.</p>
          </div>
          <div className="cap">
            <div className="cap-ic">
              <svg viewBox="0 0 24 24" fill="none" stroke="var(--accent-strong)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="4" y="11" width="16" height="9" rx="2" />
                <path d="M8 11V8a4 4 0 0 1 8 0v3" />
                <circle cx="12" cy="15.5" r="1.3" />
              </svg>
            </div>
            <h3>AES-256 encryption</h3>
            <p>Wrap any file into a password-protected ZIP, sealed with strong encryption.</p>
          </div>
          <div className="cap">
            <div className="cap-ic">
              <svg viewBox="0 0 24 24" fill="none" stroke="var(--accent-strong)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="4" y="11" width="16" height="9" rx="2" />
                <path d="M8 11V8a4 4 0 0 1 7.5-1.9" />
                <circle cx="12" cy="15.5" r="1.3" />
              </svg>
            </div>
            <h3>Decrypt &amp; unlock</h3>
            <p>Detect and unlock AES-encrypted ZIP, EPUB and DOCX files back to their original format.</p>
          </div>
          <div className="cap">
            <div className="cap-ic">
              <svg viewBox="0 0 24 24" fill="none" stroke="var(--accent-strong)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3v18M3 12h18" opacity=".4" />
                <circle cx="12" cy="12" r="9" />
              </svg>
            </div>
            <h3>Format detection</h3>
            <p>Magic-byte and ZIP-structure analysis identifies the true type, not just the extension.</p>
          </div>
          <div className="cap">
            <div className="cap-ic">
              <svg viewBox="0 0 24 24" fill="none" stroke="var(--accent-strong)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12a9 9 0 1 1-9-9" />
                <path d="M12 7v5l3 2" />
              </svg>
            </div>
            <h3>In-memory only</h3>
            <p>Bytes stream in and out of memory. No temp files, no server-side storage, ever.</p>
          </div>
          <div className="cap">
            <div className="cap-ic">
              <svg viewBox="0 0 24 24" fill="none" stroke="var(--accent-strong)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3l8 4v5c0 5-3.5 8-8 9-4.5-1-8-4-8-9V7l8-4Z" />
                <path d="M9 12l2 2 4-4" />
              </svg>
            </div>
            <h3>Pandoc + Tectonic</h3>
            <p>Battle-tested conversion engines: Pandoc, PyMuPDF and Tectonic under the hood.</p>
          </div>
        </div>

        <div className="sec-label">What FileChange gives you</div>
        <div className="metric">
          <div className="big">Zero storage</div>
          <div className="mlabel">Files exist only for the length of one request.</div>
          <div className="mdesc">
            No disk writes, no database, no retained passwords. Upload,
            transform, download, gone. The privacy guarantee is the
            architecture, not a policy.
          </div>
        </div>

        <div className="sec-label" id="tech">Technical highlights</div>
        <div className="tech">
          <div className="tline"><span className="ck"><svg viewBox="0 0 24 24" fill="none" stroke="var(--accent-strong)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5L20 6" /></svg></span> FastAPI backend with multipart streaming uploads</div>
          <div className="tline"><span className="ck"><svg viewBox="0 0 24 24" fill="none" stroke="var(--accent-strong)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5L20 6" /></svg></span> AES-256 detection and unlock for ZIP, EPUB, DOCX</div>
          <div className="tline"><span className="ck"><svg viewBox="0 0 24 24" fill="none" stroke="var(--accent-strong)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5L20 6" /></svg></span> Pandoc, PyMuPDF and Tectonic conversion pipeline</div>
          <div className="tline"><span className="ck"><svg viewBox="0 0 24 24" fill="none" stroke="var(--accent-strong)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5L20 6" /></svg></span> No temporary files, no persistence, no logging of content</div>
          <div className="tline"><span className="ck"><svg viewBox="0 0 24 24" fill="none" stroke="var(--accent-strong)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5L20 6" /></svg></span> Passwords held only in-process, discarded after response</div>
          <div className="tline"><span className="ck"><svg viewBox="0 0 24 24" fill="none" stroke="var(--accent-strong)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5L20 6" /></svg></span> Binary streaming response, direct download to device</div>
        </div>

        <div className="sec-label">Where it's headed</div>
        <div className="road">
          <span className="rchip"><span className="rd"></span> Batch processing</span>
          <span className="rchip"><span className="rd"></span> S3 source &amp; sink</span>
        </div>

        <footer>
          <div className="fl">
            <span>Convert &amp; encrypt EPUB, PDF, DOCX &mdash; in-memory, no storage.</span>
          </div>
          <div className="fr">
            <span>Developed by Kiran Katarki</span>
            <a href="https://github.com/kirankatarki" target="_blank" rel="noreferrer" aria-label="GitHub" title="GitHub">
              <svg viewBox="0 0 24 24" fill="currentColor" stroke="none">
                <path d="M12 2C6.48 2 2 6.58 2 12.25c0 4.53 2.87 8.37 6.84 9.73.5.1.68-.22.68-.49 0-.24-.01-.87-.01-1.71-2.78.62-3.37-1.36-3.37-1.36-.46-1.18-1.11-1.5-1.11-1.5-.91-.64.07-.62.07-.62 1 .07 1.53 1.05 1.53 1.05.89 1.55 2.34 1.1 2.91.84.09-.66.35-1.1.63-1.36-2.22-.26-4.56-1.14-4.56-5.07 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.31.1-2.74 0 0 .84-.27 2.75 1.05a9.3 9.3 0 0 1 5 0c1.91-1.32 2.75-1.05 2.75-1.05.55 1.43.2 2.48.1 2.74.64.72 1.03 1.63 1.03 2.75 0 3.94-2.34 4.81-4.57 5.06.36.32.68.94.68 1.9 0 1.37-.01 2.47-.01 2.81 0 .27.18.6.69.49A10.26 10.26 0 0 0 22 12.25C22 6.58 17.52 2 12 2Z" />
              </svg>
            </a>
            <a href="https://linkedin.com/in/kirankatarki" target="_blank" rel="noreferrer" aria-label="LinkedIn" title="LinkedIn">
              <svg viewBox="0 0 24 24" fill="currentColor" stroke="none">
                <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.34V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.38-1.85 3.61 0 4.28 2.38 4.28 5.47v6.27ZM5.34 7.43a2.07 2.07 0 1 1 0-4.13 2.07 2.07 0 0 1 0 4.13ZM7.12 20.45H3.56V9h3.56v11.45Z" />
              </svg>
            </a>
          </div>
        </footer>
      </div>
    </div>
  );
}
