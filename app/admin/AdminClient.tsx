'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

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

export function AdminClient() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState<string | null>(null)
  const [openCluster, setOpenCluster] = useState<string | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/questions', { cache: 'no-store' })
      if (!res.ok) return
      const j = (await res.json()) as { questions: Question[] }
      setQuestions(j.questions)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
    timerRef.current = setInterval(load, 5000)
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [load])

  async function patch(id: string, body: { answered?: boolean; pinned?: boolean }) {
    await fetch(`/api/admin/questions/${id}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    })
    await load()
  }

  async function remove(id: string) {
    if (!confirm('Frage wirklich löschen?')) return
    await fetch(`/api/admin/questions/${id}`, { method: 'DELETE' })
    await load()
  }

  async function seed() {
    setBusy('seed')
    try {
      await fetch('/api/admin/seed', { method: 'POST' })
      await load()
    } finally {
      setBusy(null)
    }
  }

  async function clearAll() {
    if (!confirm('Wirklich ALLES löschen (Fragen + Cluster)?')) return
    setBusy('clear')
    try {
      await fetch('/api/admin/clear', { method: 'POST' })
      await load()
    } finally {
      setBusy(null)
    }
  }

  const clusters = useMemo(() => {
    const map = new Map<string, Question[]>()
    for (const q of questions) {
      if (!q.cluster_id) continue
      const arr = map.get(q.cluster_id) ?? []
      arr.push(q)
      map.set(q.cluster_id, arr)
    }
    return [...map.entries()].sort((a, b) => b[1].length - a[1].length)
  }, [questions])

  return (
    <>
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        <button className="btn" onClick={seed} disabled={busy !== null}>
          {busy === 'seed' ? 'Seede…' : 'Seed (10 Demo-Fragen)'}
        </button>
        <button className="btn" onClick={clearAll} disabled={busy !== null}>
          {busy === 'clear' ? 'Lösche…' : 'Alles löschen'}
        </button>
      </div>

      {clusters.length > 0 && (
        <section>
          <h2 style={{ fontSize: '1.05rem', margin: '0.5rem 0' }}>Cluster</h2>
          <div>
            {clusters.map(([cid, items]) => {
              const open = openCluster === cid
              const panelId = `cluster-panel-${cid}`
              return (
                <div className="cluster" key={cid} data-open={open}>
                  <button
                    type="button"
                    className="cluster-head"
                    aria-expanded={open}
                    aria-controls={panelId}
                    onClick={() => setOpenCluster(open ? null : cid)}
                  >
                    <span>
                      <strong>{items.length}</strong> Fragen — {items[0].text.slice(0, 80)}
                      {items[0].text.length > 80 ? '…' : ''}
                    </span>
                    <span className="chev" aria-hidden="true">›</span>
                  </button>
                  {open && (
                    <div className="cluster-panel" id={panelId}>
                      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '0.4rem' }}>
                        {items.map((q) => (
                          <QRow key={q.id} q={q} onPatch={patch} onRemove={remove} />
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </section>
      )}

      <section>
        <h2 style={{ fontSize: '1.05rem', margin: '0.5rem 0' }}>Letzte Fragen</h2>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '0.5rem' }}>
          {questions.map((q) => (
            <QRow key={q.id} q={q} onPatch={patch} onRemove={remove} />
          ))}
          {!loading && questions.length === 0 && (
            <li className="card" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
              Keine Fragen.
            </li>
          )}
        </ul>
      </section>
    </>
  )
}

function QRow({
  q,
  onPatch,
  onRemove,
}: {
  q: Question
  onPatch: (id: string, body: { answered?: boolean; pinned?: boolean }) => void
  onRemove: (id: string) => void
}) {
  return (
    <li className="card" style={{ display: 'grid', gap: '0.5rem' }}>
      <div>
        {q.pinned && <span className="badge badge-pinned">Angepinnt</span>}
        {q.answered && <span className="badge badge-answered">Beantwortet</span>}
        <span className="badge">▲ {q.upvotes}</span>
        {q.text}
      </div>
      <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{q.author ?? 'Anonym'}</div>
      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
        <button className="btn" onClick={() => onPatch(q.id, { pinned: !q.pinned })}>
          {q.pinned ? 'Unpinnen' : 'Pinnen'}
        </button>
        <button className="btn" onClick={() => onPatch(q.id, { answered: !q.answered })}>
          {q.answered ? 'Als offen markieren' : 'Als beantwortet markieren'}
        </button>
        <button className="btn" onClick={() => onRemove(q.id)}>
          Löschen
        </button>
      </div>
    </li>
  )
}
