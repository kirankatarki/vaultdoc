interface Props {
  file: File;
}

export function EncryptPanel({ file }: Props) {
  return (
    <div>
      <input type="password" placeholder="Password" />
      <button>Encrypt</button>
    </div>
  );
}
