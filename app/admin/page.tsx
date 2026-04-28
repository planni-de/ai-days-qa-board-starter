import { AdminClient } from './AdminClient'

export const dynamic = 'force-dynamic'

export default function AdminPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <header style={{ marginTop: '1rem' }}>
        <h1 style={{ margin: 0, fontSize: '1.4rem' }}>Admin</h1>
        <p style={{ color: 'var(--text-muted)', marginTop: '0.3rem' }}>
          Pinnen, beantworten, löschen. Alles live.
        </p>
      </header>
      <AdminClient />
    </div>
  )
}
