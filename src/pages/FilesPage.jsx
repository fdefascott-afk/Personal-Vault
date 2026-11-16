import { useEffect, useState } from 'react'
import FileCard from '../components/FileCard'
import Card from '../components/Card'
import { getFileDownloadUrl, listUserFiles, uploadUserFile } from '../services/fileStorage'

export default function FilesPage() {
  const [files, setFiles] = useState([])
  const [selectedFile, setSelectedFile] = useState(null)
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)

  useEffect(() => {
    let active = true

    listUserFiles()
      .then((storedFiles) => {
        if (active) setFiles(storedFiles)
      })
      .catch((error) => {
        if (active) setMessage(`No se pudieron cargar los archivos: ${error.message}`)
      })
      .finally(() => {
        if (active) setIsLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!selectedFile) {
      return
    }

    const form = event.currentTarget
    setIsUploading(true)
    setMessage('')

    try {
      const storedFile = await uploadUserFile(selectedFile)
      setFiles((current) => [storedFile, ...current])
      setMessage('Archivo guardado en Supabase.')

      setSelectedFile(null)
      form.reset()
    } catch (error) {
      setMessage(error.message || 'No se pudo guardar el archivo.')
    } finally {
      setIsUploading(false)
    }
  }

  const handleDownload = async (file) => {
    try {
      const url = await getFileDownloadUrl(file)
      window.location.assign(url)
    } catch (error) {
      setMessage(`No se pudo descargar el archivo: ${error.message}`)
    }
  }

  return (
    <section className="page-section">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Biblioteca</span>
          <h1>Archivos del usuario</h1>
        </div>
        <span className="count-badge">{isLoading ? 'Cargando...' : `${files.length} archivos`}</span>
      </div>

      <div className="card-grid two-columns">
        <Card title="Subir archivo" description="Añade un documento o media al almacenamiento." accent="green">
          <form className="upload-form" onSubmit={handleSubmit}>
            <label className="file-input-label">
              Seleccionar archivo
              <input
                type="file"
                accept=".pdf,image/*,video/*,audio/*"
                onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
              />
            </label>

            <button
              type="submit"
              className="button primary"
              disabled={!selectedFile || isLoading || isUploading}
            >
              {isUploading ? 'Guardando...' : 'Guardar archivo'}
            </button>
            {message && <p className="form-message" role="status">{message}</p>}
          </form>
        </Card>

        <Card title="Tipos soportados" description="Se gestionan archivos PDF, imágenes, videos y audios." accent="blue">
          <ul className="simple-list">
            <li>PDF</li>
            <li>Imágenes</li>
            <li>Videos</li>
            <li>Audios</li>
          </ul>
        </Card>
      </div>

      <div className="file-grid">
        {isLoading ? (
          <p className="form-message">Cargando archivos...</p>
        ) : files.length ? (
          files.map((file) => <FileCard key={file.id} file={file} onDownload={handleDownload} />)
        ) : (
          <p className="form-message">{message || 'Todavía no hay archivos guardados.'}</p>
        )}
      </div>
    </section>
  )
}
