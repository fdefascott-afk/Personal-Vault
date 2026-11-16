import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { signInUser, signUpUser } from '../services/authService'

export default function LoginPage({ user, setUser }) {
  const navigate = useNavigate()
  const [isRegistering, setIsRegistering] = useState(false)
  const [name, setName] = useState(user?.name ?? '')
  const [email, setEmail] = useState(user?.email ?? '')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      if (isRegistering) {
        const result = await signUpUser(email, password, name)
        setMessage('Usuario creado correctamente. Puedes iniciar sesión inmediatamente.')
        console.log('Registro:', result)
      } else {
        const result = await signInUser(email, password)
        const resolvedName = result.user?.user_metadata?.full_name || name || 'Usuario'

        setUser({
          name: resolvedName,
          email: result.user?.email ?? email,
          verified: true,
        })
        setMessage('Inicio de sesión correcto.')
        navigate('/dashboard')
      }
    } catch (error) {
      setMessage(error.message || 'Ocurrió un error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="auth-layout">
      <div className="auth-panel hero-panel">
        <span className="eyebrow">Seguridad · Privacidad · Acceso</span>
        <h1>Tu biblioteca de archivos digital segura</h1>
        <p>
          Guarda, organiza y comparte documentos, imágenes, audios y videos con
          verificación de usuario en una sola plataforma.
        </p>
      </div>

      <div className="auth-panel form-panel">
        <h2>{isRegistering ? 'Crear cuenta' : 'Iniciar sesión'}</h2>
        <form className="auth-form" onSubmit={handleSubmit}>
          {isRegistering && (
            <label>
              Nombre completo
              <input
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Tu nombre"
                required
              />
            </label>
          )}

          <label>
            Correo electrónico
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="usuario@ejemplo.com"
              required
            />
          </label>

          <label>
            Contraseña
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
              required
            />
          </label>

          <button type="submit" className="button primary" disabled={loading}>
            {loading ? 'Procesando...' : isRegistering ? 'Crear usuario' : 'Entrar a la app'}
          </button>

          <button
            type="button"
            className="button ghost"
            onClick={() => setIsRegistering((current) => !current)}
          >
            {isRegistering ? 'Ya tengo cuenta' : 'Crear cuenta nueva'}
          </button>

          {message && <p className="form-message">{message}</p>}
        </form>
      </div>
    </section>
  )
}
