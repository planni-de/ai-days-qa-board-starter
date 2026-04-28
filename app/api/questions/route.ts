import { NextResponse } from 'next/server'
import { ensureSchema, sql } from '@/lib/db'
import { QuestionInput } from '@/lib/schemas'
import { getIp, submitLimiter } from '@/lib/ratelimit'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = QuestionInput.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid input' }, { status: 400 })
  }

  if (submitLimiter) {
    const { success } = await submitLimiter.limit(getIp(req))
    if (!success) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
    }
  }

  await ensureSchema()
  const { text, author } = parsed.data
  const result = await sql<{ id: string }>`
    INSERT INTO questions (text, author)
    VALUES (${text}, ${author ?? null})
    RETURNING id
  `
  return NextResponse.json({ id: result.rows[0].id }, { status: 201 })
}

export async function GET(req: Request) {
  await ensureSchema()
  const url = new URL(req.url)
  const answeredParam = url.searchParams.get('answered')
  let rows
  if (answeredParam === 'false') {
    rows = (
      await sql`
        SELECT id, text, author, cluster_id, upvotes, answered, pinned, created_at
        FROM questions
        WHERE deleted_at IS NULL AND answered = false
        ORDER BY pinned DESC, upvotes DESC, created_at DESC
        LIMIT 200
      `
    ).rows
  } else {
    rows = (
      await sql`
        SELECT id, text, author, cluster_id, upvotes, answered, pinned, created_at
        FROM questions
        WHERE deleted_at IS NULL
        ORDER BY pinned DESC, upvotes DESC, created_at DESC
        LIMIT 200
      `
    ).rows
  }
  return NextResponse.json(
    { questions: rows },
    { headers: { 'cache-control': 'no-store' } },
  )
}
