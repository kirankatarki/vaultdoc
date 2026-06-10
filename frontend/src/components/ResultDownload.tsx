interface Props {
  filename: string;
  onDownload: () => void;
}

export function ResultDownload({ filename, onDownload }: Props) {
  return (
    <div className="result-row">
      <span className="result-filename" title={filename}>
        {filename}
      </span>
      <button onClick={onDownload}>Download</button>
    </div>
  );
}
