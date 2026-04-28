'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { SubmitForm } from '../components/SubmitForm'

type Question = {
  id: string
  text: string
  author: string | null
  cluster_id: string | null
  upvotes: number
  answered: boolean
  pinned: boolean
  created_at: string
}

const VOTED_KEY = 'qa-voted'

function getVoted(): Set<string> {
  if (typeof window === 'undefined') return new Set()
  try {
    const raw = localStorage.getItem(VOTED_KEY)
    return new Set<string>(raw ? JSON.parse(raw) : [])
  } catch {
    return new Set()
  }
}
function persistVoted(set: Set<string>) {
  try {
    localStorage.setItem(VOTED_KEY, JSON.stringify([...set]))
  } catch {}
}

export function Board() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [voted, setVoted] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/questions?answered=false', { cache: 'no-store' })
      if (!res.ok) return
      const j = (await res.json()) as { questions: Question[] }
      setQuestions(j.questions)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    setVoted(getVoted())
    load()
    timerRef.current = setInterval(load, 5000)
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [load])

  async function vote(id: string) {
    if (voted.has(id)) return
    const next = new Set(voted)
    next.add(id)
    setVoted(next)
    persistVoted(next)
    setQuestions((prev) =>
      prev
        .map((q) => (q.id === id ? { ...q, upvotes: q.upvotes + 1 } : q))
        .sort(sortFn),
    )
    try {
      const res = await fetch(`/api/questions/${id}/vote`, { method: 'POST' })
      if (!res.ok) {
        const back = new Set(next)
        back.delete(id)
        setVoted(back)
        persistVoted(back)
        setQuestions((prev) =>
          prev
            .map((q) => (q.id === id ? { ...q, upvotes: Math.max(0, q.upvotes - 1) } : q))
            .sort(sortFn),
        )
      }
    } catch {
      // network blip — leave optimistic state, polling will reconcile
    }
  }

  return (
    <>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '0.6rem' }}>
        {questions.map((q) => (
          <li key={q.id} className="card q-card">
            <button
              type="button"
              className="vote-btn"
              aria-pressed={voted.has(q.id)}
              aria-label={`Upvoten — aktuell ${q.upvotes} Stimmen`}
              onClick={() => vote(q.id)}
            >
              <span aria-hidden="true">▲</span>
              <span>{q.upvotes}</span>
            </button>
            <div className="q-body">
              <div>
                {q.pinned && <span className="badge badge-pinned">Angepinnt</span>}
                {q.answered && <span className="badge badge-answered">Beantwortet</span>}
                {q.text}
              </div>
              <div className="q-meta">{q.author ?? 'Anonym'}</div>
            </div>
          </li>
        ))}
        {!loading && questions.length === 0 && (
          <li className="card" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
            Noch keine Fragen. Sei die/der Erste!
          </li>
        )}
      </ul>

      <div className="sticky-form">
        <SubmitForm compact />
      </div>
    </>
  )
}

function sortFn(a: Question, b: Question) {
  if (a.pinned !== b.pinned) return a.pinned ? -1 : 1
  if (a.upvotes !== b.upvotes) return b.upvotes - a.upvotes
  return b.created_at.localeCompare(a.created_at)
}
