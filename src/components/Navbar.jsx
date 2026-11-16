import { NavLink, useNavigate } from 'react-router-dom'
import { signOutUser } from '../services/authService'

const navItems = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/verificacion', label: 'Verificación' },
  { to: '/archivos', label: 'Archivos' },
  { to: '/actividades', label: 'Actividades' },
]

export default function Navbar({ user, setUser }) {
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await signOutUser()
    } catch (error) {
      console.error('Error logout', error)
    } finally {
      setUser(null)
      navigate('/')
    }
  }

  return (
    <header className="navbar">
      <div className="nav-brand-wrap">
        <div className="brand-mark">P</div>
        <div>
          <p className="brand-title">Personal Vault</p>
          <small>Gestión segura de archivos</small>
        </div>
      </div>

      <nav className="nav-links" aria-label="Navegación principal">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="nav-user">
        <span className="status-dot" aria-hidden="true" />
        <span>{user?.name ?? 'Usuario'}</span>
        {user && (
          <button type="button" className="button ghost small" onClick={handleLogout}>
            Cerrar sesión
          </button>
        )}
      </div>
    </header>
  )
}
