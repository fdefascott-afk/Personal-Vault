export default function Card({ title, description, children, accent = 'blue' }) {
  return (
    <article className={`card card-${accent}`}>
      <div className="card-header">
        <h3>{title}</h3>
      </div>
      {description && <p className="card-description">{description}</p>}
      {children}
    </article>
  )
}
