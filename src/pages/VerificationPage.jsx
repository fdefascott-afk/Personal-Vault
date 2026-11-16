import Card from '../components/Card'

export default function VerificationPage({ user }) {
  const isVerified = user?.verified ?? false

  return (
    <section className="page-section">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Verificación</span>
          <h1>Estado de acceso del usuario</h1>
        </div>
      </div>

      <div className="card-grid two-columns">
        <Card
          title={isVerified ? 'Usuario verificado' : 'Verificación pendiente'}
          description={
            isVerified
              ? 'La cuenta ha sido validada correctamente y ya puede subir archivos.'
              : 'El usuario necesita completar la verificación antes de acceder a la biblioteca.'
          }
          accent={isVerified ? 'green' : 'amber'}
        >
          <div className="status-row">
            <span className={`status-pill ${isVerified ? 'success' : 'warning'}`}>
              {isVerified ? 'Verificado' : 'Pendiente'}
            </span>
            <strong>{user?.name ?? 'Ariel'}</strong>
          </div>
        </Card>

        <Card
          title="Documentación requerida"
          description="Se valida el correo, la identidad y la confirmación de acceso para la cuenta."
          accent="purple"
        >
          <ul className="simple-list">
            <li>Correo verificado</li>
            <li>Documento de identidad</li>
            <li>Confirmación de términos</li>
          </ul>
        </Card>
      </div>
    </section>
  )
}
