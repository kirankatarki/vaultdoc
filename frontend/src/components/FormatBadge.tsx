import type { DetectResponse } from "../types/api";

interface Props {
  detected: DetectResponse;
}

export function FormatBadge({ detected }: Props) {
  return (
    <div>
      <span>{detected.format.toUpperCase()}</span>
      <span> {detected.encrypted ? "Encrypted" : "Not Encrypted"}</span>
    </div>
  );
}
