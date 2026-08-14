type Props = {
  url: string;
  originalName: string;
  mimeType?: string | null;
};

export function AdminFilePreview({ url, originalName, mimeType }: Props) {
  const isImage =
    Boolean(mimeType?.startsWith("image/")) ||
    /\.(png|jpe?g|gif|webp|svg)$/i.test(originalName) ||
    /\.(png|jpe?g|gif|webp|svg)(\?|$)/i.test(url);
  const isPdf =
    mimeType === "application/pdf" ||
    /\.pdf$/i.test(originalName) ||
    /\.pdf(\?|$)/i.test(url);

  return (
    <div className="admin-file-preview">
      <p className="admin-file-name">
        <a href={url} target="_blank" rel="noreferrer">
          {originalName}
        </a>
      </p>
      {isImage ? (
        // eslint-disable-next-line @next/next/no-img-element -- arbitrary upload URLs
        <img src={url} alt={originalName} />
      ) : isPdf ? (
        <iframe title={originalName} src={url} className="admin-file-frame" />
      ) : (
        <p className="muted">Прегледът не е наличен — отворете файла.</p>
      )}
      <a className="btn btn-ghost" href={url} download={originalName}>
        Изтегли
      </a>
    </div>
  );
}
