'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

function LoginForm() {
  const router = useRouter()
  const params = useSearchParams()
  const next = params.get('next') || '/editor'

  const [mode, setMode] = useState<'signin' | 'signup'>('signup')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setMsg(null)
    const supabase = createClient()

    const { data, error } =
      mode === 'signup'
        ? await supabase.auth.signUp({ email, password })
        : await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setMsg(error.message)
      setBusy(false)
      return
    }
    // session present → go straight in; middleware routes to onboarding if needed
    if (data.session) {
      router.push(next)
      router.refresh()
    } else {
      setMsg('Check your email to confirm your account, then log in.')
      setBusy(false)
    }
  }

  async function magicLink() {
    if (!email) return setMsg('Enter your email first.')
    setBusy(true)
    setMsg(null)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${location.origin}/auth/callback?next=${encodeURIComponent(next)}` },
    })
    setMsg(error ? error.message : 'Magic link sent — check your email.')
    setBusy(false)
  }

  return (
    <div className="min-h-screen bg-[#f3f0e9] text-[#15120e] flex flex-col">
      <header className="h-16 flex items-center px-8">
        <Link href="/" className="font-black text-xl tracking-tight">SILK</Link>
      </header>

      <main className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-sm">
          <h1 className="text-4xl font-black tracking-tight mb-2">
            {mode === 'signup' ? 'Create your account' : 'Welcome back'}
          </h1>
          <p className="text-[#6b6358] mb-8">
            {mode === 'signup' ? 'Start making video in minutes.' : 'Log in to keep creating.'}
          </p>

          <form onSubmit={submit} className="space-y-3">
            <input
              type="email" required placeholder="you@brand.com" value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white border border-black/10 rounded-xl px-4 py-3 outline-none focus:border-black/40"
            />
            <input
              type="password" required minLength={6} placeholder="Password (min 6 chars)" value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white border border-black/10 rounded-xl px-4 py-3 outline-none focus:border-black/40"
            />
            <button
              type="submit" disabled={busy}
              className="w-full bg-[#15120e] text-white font-semibold rounded-xl py-3 disabled:opacity-50"
            >
              {busy ? 'One sec…' : mode === 'signup' ? 'Sign up' : 'Log in'}
            </button>
          </form>

          <button onClick={magicLink} disabled={busy} className="w-full mt-2 text-sm text-[#6b6358] hover:text-black py-2">
            Email me a magic link instead
          </button>

          {msg && <p className="mt-4 text-sm text-[#b4541f]">{msg}</p>}

          <p className="mt-6 text-sm text-[#6b6358]">
            {mode === 'signup' ? 'Already have an account? ' : "Don't have an account? "}
            <button
              onClick={() => { setMode(mode === 'signup' ? 'signin' : 'signup'); setMsg(null) }}
              className="font-semibold text-black underline"
            >
              {mode === 'signup' ? 'Log in' : 'Sign up'}
            </button>
          </p>
        </div>
      </main>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  )
}
