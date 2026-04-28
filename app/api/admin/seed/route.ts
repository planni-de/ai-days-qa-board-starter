import { NextResponse } from 'next/server'
import { ensureSchema, sql } from '@/lib/db'
import { SEED } from '@/lib/seed'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST() {
  await ensureSchema()
  let inserted = 0
  for (const q of SEED) {
    await sql`INSERT INTO questions (text, author) VALUES (${q.body}, ${q.authorName})`
    inserted++
  }
  return NextResponse.json({ inserted })
}
