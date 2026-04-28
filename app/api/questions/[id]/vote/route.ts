import { NextResponse } from 'next/server'
import { ensureSchema, sql } from '@/lib/db'
import { getIp, voteLimiter } from '@/lib/ratelimit'
import { z } from 'zod'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const Params = z.object({ id: z.string().uuid() })

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params
  const parsed = Params.safeParse({ id })
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
  }

  if (voteLimiter) {
    const { success } = await voteLimiter.limit(getIp(req))
    if (!success) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
    }
  }

  await ensureSchema()
  const result = await sql<{ upvotes: number }>`
    UPDATE questions
    SET upvotes = upvotes + 1
    WHERE id = ${parsed.data.id} AND deleted_at IS NULL
    RETURNING upvotes
  `
  if (result.rowCount === 0) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  return NextResponse.json({ upvotes: result.rows[0].upvotes })
}
