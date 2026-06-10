import type { DetectResponse, TargetFormat } from "../types/api";
interface Props {
  file: File;
  format: DetectResponse["format"];
}

export function ConvertPanel({ file, format }: Props) {
  return (
    <div>
      <p>Convert from {format}</p>
      <button>Convert</button>
    </div>
  );
}
