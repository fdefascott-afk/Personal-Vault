import Navbar from './Navbar'
import Footer from './Footer'

export default function Layout({ children, user, setUser }) {
  return (
    <div className="app-shell">
      <Navbar user={user} setUser={setUser} />
      <main className="page-container">{children}</main>
      <Footer />
    </div>
  )
}
