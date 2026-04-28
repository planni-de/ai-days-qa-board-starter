import { Board } from './Board'

export const dynamic = 'force-dynamic'

export default function BoardPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <header style={{ marginTop: '1rem' }}>
        <h1 style={{ margin: 0, fontSize: '1.4rem' }}>Live Q&amp;A</h1>
        <p style={{ color: 'var(--text-muted)', marginTop: '0.3rem' }}>
          Tippe ein Daumen-hoch für die Fragen, die dich interessieren.
        </p>
      </header>
      <Board />
    </div>
  )
}
