// One-off migration runner. Reads the connection string from DATABASE_URL
// (passed transiently, never committed) and applies every .sql file in
// supabase/migrations in order.
import { readFileSync, readdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import pg from 'pg'

const cs = process.env.DATABASE_URL
if (!cs) {
  console.error('Set DATABASE_URL'); process.exit(1)
}

const dir = join(dirname(fileURLToPath(import.meta.url)), '..', 'supabase', 'migrations')
const files = readdirSync(dir).filter((f) => f.endsWith('.sql')).sort()

const client = new pg.Client({ connectionString: cs, ssl: { rejectUnauthorized: false } })
await client.connect()
console.log('connected')
for (const f of files) {
  process.stdout.write(`applying ${f} ... `)
  await client.query(readFileSync(join(dir, f), 'utf8'))
  console.log('ok')
}
await client.end()
console.log('done')
