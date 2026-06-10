interface Props {
  file: File;
  onDecrypted: (file: File) => void;
}

export function DecryptPanel({ file, onDecrypted }: Props) {
  return (
    <div>
      <input type="password" placeholder="Password" />
      <button>Decrypt</button>
    </div>
  );
}
