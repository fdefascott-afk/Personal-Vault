const typeStyles = {
  pdf: 'badge pdf',
  image: 'badge image',
  video: 'badge video',
  audio: 'badge audio',
  document: 'badge document',
}

export default function FileCard({ file, onDownload }) {
  const typeLabel = {
    pdf: 'PDF',
    image: 'Imagen',
    video: 'Video',
    audio: 'Audio',
    document: 'Documento',
  }[file.type]

  return (
    <article className="file-card">
      <div className="file-card-top">
        <span className={typeStyles[file.type] ?? 'badge document'}>{typeLabel}</span>
        <span className="file-size">{file.size}</span>
      </div>

      <div className="file-card-body">
        <h4>{file.name}</h4>
        <p>{file.description}</p>
      </div>

      <div className="file-card-actions">
        <a href={file.url ?? '#'} target="_blank" rel="noreferrer" className="button secondary">
          Ver
        </a>
        <button type="button" className="button ghost" onClick={() => onDownload(file)}>
          Descargar
        </button>
      </div>
    </article>
  )
}
