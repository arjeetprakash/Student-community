export default function Card({ title, description, footer }) {
  return (
    <div className="section-card">
      <div className="stack">
        <h3 style={{ margin: 0 }}>{title}</h3>
        <p style={{ margin: 0, color: "#475569" }}>{description}</p>
        {footer && <div style={{ color: "#0f172a", fontWeight: 600 }}>{footer}</div>}
      </div>
    </div>
  );
}
