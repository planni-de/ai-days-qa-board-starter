'use client'

import { useState } from 'react'

type Status = 'idle' | 'submitting' | 'ok' | 'error'

export function SubmitForm({ compact = false }: { compact?: boolean }) {
  const [text, setText] = useState('')
  const [author, setAuthor] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('submitting')
    setError(null)
    try {
      const res = await fetch('/api/questions', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ text, author: author || undefined }),
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        throw new Error(j.error || `HTTP ${res.status}`)
      }
      setText('')
      setAuthor('')
      setStatus('ok')
      setTimeout(() => setStatus('idle'), 1800)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler')
      setStatus('error')
    }
  }

  return (
    <form onSubmit={onSubmit} className={compact ? '' : 'card'} style={{ display: 'grid', gap: '0.6rem' }}>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Deine Frage… (5–500 Zeichen)"
        minLength={5}
        maxLength={500}
        required
        aria-label="Deine Frage"
      />
      {!compact && (
        <input
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          placeholder="Dein Name (optional)"
          maxLength={50}
          aria-label="Dein Name (optional)"
        />
      )}
      <button type="submit" className="btn btn-primary" disabled={status === 'submitting'}>
        {status === 'submitting' ? 'Wird gesendet…' : status === 'ok' ? 'Danke!' : 'Frage senden'}
      </button>
      {error && (
        <p role="alert" style={{ color: '#ff453a', margin: 0, fontSize: '0.9rem' }}>
          {error}
        </p>
      )}
    </form>
  )
}
