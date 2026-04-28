import { sql } from '@vercel/postgres'

let migrated = false

export async function ensureSchema() {
  if (migrated) return
  await sql`CREATE EXTENSION IF NOT EXISTS pgcrypto`
  await sql`
    CREATE TABLE IF NOT EXISTS clusters (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      summary TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT now()
    )
  `
  await sql`
    CREATE TABLE IF NOT EXISTS questions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      text TEXT NOT NULL CHECK (length(text) BETWEEN 5 AND 500),
      author TEXT,
      cluster_id UUID REFERENCES clusters(id),
      upvotes INT DEFAULT 0,
      answered BOOLEAN DEFAULT false,
      pinned BOOLEAN DEFAULT false,
      created_at TIMESTAMPTZ DEFAULT now(),
      deleted_at TIMESTAMPTZ
    )
  `
  await sql`CREATE INDEX IF NOT EXISTS questions_pinned_upvotes ON questions (pinned DESC, upvotes DESC, created_at DESC)`
  migrated = true
}

export { sql }
