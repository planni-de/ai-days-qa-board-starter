import { NextResponse } from 'next/server'
import { ensureSchema, sql } from '@/lib/db'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST() {
  await ensureSchema()
  await sql`TRUNCATE TABLE questions, clusters RESTART IDENTITY CASCADE`
  return NextResponse.json({ ok: true })
}
