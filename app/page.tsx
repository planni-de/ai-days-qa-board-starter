import Link from 'next/link'
import { SubmitForm } from './components/SubmitForm'

export default function Page() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <header style={{ marginTop: '1rem' }}>
        <h1 style={{ margin: 0, fontSize: '1.6rem' }}>Stell deine Frage.</h1>
        <p style={{ color: 'var(--text-muted)', marginTop: '0.4rem' }}>
          Anonym oder mit Namen — ganz wie du magst.
        </p>
      </header>

      <SubmitForm />

      <p style={{ textAlign: 'center', marginTop: '0.5rem' }}>
        <Link href="/board">Zum Live-Board →</Link>
      </p>
    </div>
  )
}
