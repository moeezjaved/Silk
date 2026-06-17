import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

/** Lightweight connectivity check: confirms the app can reach Supabase. */
export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!url || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return NextResponse.json({ ok: false, reason: 'missing env vars' }, { status: 500 })
  }

  try {
    const supabase = await createClient()
    const { error } = await supabase.from('documents').select('id').limit(1)

    if (error) {
      // 42P01 = table doesn't exist yet, but the connection + auth worked.
      const tableMissing = error.code === '42P01'
      return NextResponse.json({
        ok: true,
        connected: true,
        documentsTable: tableMissing ? 'missing — run the migration' : 'error: ' + error.message,
        project: url,
      })
    }

    return NextResponse.json({ ok: true, connected: true, documentsTable: 'ready', project: url })
  } catch (e) {
    return NextResponse.json(
      { ok: false, connected: false, error: String(e) },
      { status: 502 },
    )
  }
}
