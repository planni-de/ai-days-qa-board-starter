import { NextResponse } from 'next/server'
import { ensureSchema, sql } from '@/lib/db'
import { AdminPatch } from '@/lib/schemas'
import { z } from 'zod'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const Params = z.object({ id: z.string().uuid() })

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params
  const p = Params.safeParse({ id })
  if (!p.success) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }
  const parsed = AdminPatch.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 })

  await ensureSchema()
  const { answered, pinned } = parsed.data
  if (answered === undefined && pinned === undefined) {
    return NextResponse.json({ ok: true })
  }
  // Two simple updates instead of dynamic SQL
  if (answered !== undefined) {
    await sql`UPDATE questions SET answered = ${answered} WHERE id = ${p.data.id}`
  }
  if (pinned !== undefined) {
    await sql`UPDATE questions SET pinned = ${pinned} WHERE id = ${p.data.id}`
  }
  return NextResponse.json({ ok: true })
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params
  const p = Params.safeParse({ id })
  if (!p.success) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
  await ensureSchema()
  await sql`UPDATE questions SET deleted_at = now() WHERE id = ${p.data.id}`
  return NextResponse.json({ ok: true })
}
