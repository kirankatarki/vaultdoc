import type { DetectResponse } from "../types/api";

interface Props {
  detected: DetectResponse;
}

export function FormatBadge({ detected }: Props) {
  return (
    <div className="badges">
      <span className="badge format">{detected.format.toUpperCase()}</span>
      <span className={`badge ${detected.encrypted ? "encrypted" : "unlocked"}`}>
        {detected.encrypted ? "Encrypted" : "Not Encrypted"}
      </span>
    </div>
  );
}
