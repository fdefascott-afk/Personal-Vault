import { useEffect, useState } from 'react'
import Card from '../components/Card'
import {
  createActivity,
  deleteActivity,
  listActivities,
  updateActivity,
} from '../services/activityService'

const emptyForm = { title: '', description: '', scheduledAt: '' }

function sortActivities(activities) {
  return [...activities].sort(
    (first, second) => Date.parse(first.scheduled_at) - Date.parse(second.scheduled_at),
  )
}

function toDateTimeInput(value) {
  const date = new Date(value)
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset())
  return date.toISOString().slice(0, 16)
}

function formatActivityDate(value) {
  return new Intl.DateTimeFormat('es', {
    dateStyle: 'full',
    timeStyle: 'short',
  }).format(new Date(value))
}

export default function ActivitiesPage() {
  const [activities, setActivities] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [currentTime, setCurrentTime] = useState(null)

  useEffect(() => {
    let active = true

    listActivities()
      .then((savedActivities) => {
        if (active) setActivities(savedActivities)
      })
      .catch((error) => {
        if (active) setMessage(`No se pudieron cargar las actividades: ${error.message}`)
      })
      .finally(() => {
        if (active) setIsLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    const updateCurrentTime = () => setCurrentTime(Date.now())
    updateCurrentTime()

    const timer = window.setInterval(updateCurrentTime, 60_000)
    return () => window.clearInterval(timer)
  }, [])

  const resetForm = () => {
    setForm(emptyForm)
    setEditingId(null)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setIsSaving(true)
    setMessage('')

    try {
      const activityData = {
        title: form.title.trim(),
        description: form.description.trim(),
        scheduled_at: new Date(form.scheduledAt).toISOString(),
      }
      const savedActivity = editingId
        ? await updateActivity(editingId, activityData)
        : await createActivity(activityData)

      setActivities((current) =>
        sortActivities(
          editingId
            ? current.map((activity) => (activity.id === editingId ? savedActivity : activity))
            : [...current, savedActivity],
        ),
      )
      setMessage(editingId ? 'Actividad actualizada.' : 'Actividad programada.')
      resetForm()
    } catch (error) {
      setMessage(error.message || 'No se pudo guardar la actividad.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleEdit = (activity) => {
    setEditingId(activity.id)
    setForm({
      title: activity.title,
      description: activity.description ?? '',
      scheduledAt: toDateTimeInput(activity.scheduled_at),
    })
    setMessage('')
  }

  const handleDelete = async (activity) => {
    if (!window.confirm(`¿Eliminar la actividad "${activity.title}"?`)) return

    setDeletingId(activity.id)
    setMessage('')

    try {
      await deleteActivity(activity.id)
      setActivities((current) => current.filter((item) => item.id !== activity.id))
      if (editingId === activity.id) resetForm()
      setMessage('Actividad eliminada.')
    } catch (error) {
      setMessage(error.message || 'No se pudo eliminar la actividad.')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <section className="page-section">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Agenda</span>
          <h1>Actividades programadas</h1>
        </div>
        <span className="count-badge">
          {isLoading ? 'Cargando...' : `${activities.length} actividades`}
        </span>
      </div>

      <Card
        title={editingId ? 'Editar actividad' : 'Programar actividad'}
        description="Organiza una actividad con fecha y hora."
        accent="green"
      >
        <form className="upload-form" onSubmit={handleSubmit}>
          <label className="file-input-label">
            Nombre
            <input
              type="text"
              value={form.title}
              onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
              maxLength={120}
              required
            />
          </label>

          <label className="file-input-label">
            Fecha y hora
            <input
              type="datetime-local"
              value={form.scheduledAt}
              onChange={(event) =>
                setForm((current) => ({ ...current, scheduledAt: event.target.value }))
              }
              required
            />
          </label>

          <label className="file-input-label">
            Descripción
            <textarea
              value={form.description}
              onChange={(event) =>
                setForm((current) => ({ ...current, description: event.target.value }))
              }
              maxLength={1000}
              rows={3}
            />
          </label>

          <div className="file-card-actions">
            <button type="submit" className="button primary" disabled={isLoading || isSaving}>
              {isSaving ? 'Guardando...' : editingId ? 'Guardar cambios' : 'Crear actividad'}
            </button>
            {editingId && (
              <button type="button" className="button ghost" onClick={resetForm}>
                Cancelar edición
              </button>
            )}
          </div>
          {message && <p className="form-message" role="status">{message}</p>}
        </form>
      </Card>

      <div className="file-grid">
        {isLoading ? (
          <p className="form-message">Cargando agenda...</p>
        ) : activities.length ? (
          activities.map((activity) => {
            const isPast = currentTime !== null && Date.parse(activity.scheduled_at) < currentTime

            return (
              <article className="file-card" key={activity.id}>
                <div className="file-card-top">
                  <span className={`status-pill ${isPast ? 'warning' : 'success'}`}>
                    {isPast ? 'Fecha pasada' : 'Próxima'}
                  </span>
                  <span className="file-size">{formatActivityDate(activity.scheduled_at)}</span>
                </div>
                <div className="file-card-body">
                  <h4>{activity.title}</h4>
                  <p>{activity.description || 'Sin descripción'}</p>
                </div>
                <div className="file-card-actions">
                  <button
                    type="button"
                    className="button secondary"
                    onClick={() => handleEdit(activity)}
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    className="button ghost"
                    disabled={deletingId === activity.id}
                    onClick={() => handleDelete(activity)}
                  >
                    {deletingId === activity.id ? 'Eliminando...' : 'Eliminar'}
                  </button>
                </div>
              </article>
            )
          })
        ) : (
          <p className="form-message">
            {message || 'Todavía no hay actividades. Usa el formulario para programar una.'}
          </p>
        )}
      </div>
    </section>
  )
}
