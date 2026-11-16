import { useEffect, useState } from 'react'
import Card from '../components/Card'
import { listUserFiles } from '../services/fileStorage'

const fileTypeLabels = {
  pdf: 'PDF',
  image: 'Imágenes',
  video: 'Videos',
  audio: 'Audios',
}

function formatFileSize(bytes) {
  if (!bytes) return '0 B'

  const units = ['B', 'KB', 'MB', 'GB']
  const unitIndex = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1)
  return `${(bytes / 1024 ** unitIndex).toFixed(1)} ${units[unitIndex]}`
}

export default function DashboardPage({ user }) {
  const [files, setFiles] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    let active = true

    listUserFiles({ withSignedUrls: false })
      .then((storedFiles) => {
        if (active) setFiles(storedFiles)
      })
      .catch((error) => {
        if (active) setErrorMessage(`No se pudo actualizar el resumen: ${error.message}`)
      })
      .finally(() => {
        if (active) setIsLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  const totalBytes = files.reduce((total, file) => total + file.sizeBytes, 0)
  const typesWithFiles = new Set(files.map((file) => file.type)).size
  const typeCounts = Object.keys(fileTypeLabels).map((type) => ({
    type,
    label: fileTypeLabels[type],
    count: files.filter((file) => file.type === type).length,
  }))

  return (
    <section className="page-section">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Resumen</span>
          <h1>Bienvenido, {user?.name ?? 'Usuario'}</h1>
        </div>
      </div>

      <div className="metrics-grid">
        <Card
          title={isLoading ? '...' : String(files.length)}
          description="Archivos almacenados"
          accent="blue"
        />
        <Card
          title={isLoading ? '...' : formatFileSize(totalBytes)}
          description="Espacio utilizado"
          accent="green"
        />
        <Card
          title={isLoading ? '...' : `${typesWithFiles} / ${Object.keys(fileTypeLabels).length}`}
          description="Tipos con archivos"
          accent="amber"
        />
      </div>

      <div className="card-grid two-columns">
        <Card
          title="Actividad reciente"
          description="Archivos guardados recientemente en tu almacenamiento."
          accent="blue"
        >
          <ul className="simple-list">
            {isLoading ? (
              <li>Cargando archivos...</li>
            ) : files.length ? (
              files.slice(0, 5).map((file) => <li key={file.id}>{file.name} · {file.size}</li>)
            ) : (
              <li>{errorMessage || 'Todavía no hay archivos guardados.'}</li>
            )}
          </ul>
        </Card>

        <Card
          title="Tipos de archivo permitidos"
          description="Cantidad de archivos guardados por tipo."
          accent="purple"
        >
          <ul className="simple-list">
            {typeCounts.map(({ type, label, count }) => (
              <li key={type}>{label}: {isLoading ? '...' : count}</li>
            ))}
          </ul>
        </Card>
      </div>
      {errorMessage && <p className="form-message" role="alert">{errorMessage}</p>}
    </section>
  )
}
