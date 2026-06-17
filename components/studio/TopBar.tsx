'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useEditor } from '@/lib/store'
import { FORMATS } from '@/lib/doc'
import { createClient } from '@/lib/supabase/client'

const FORMAT_LABEL: Record<string, string> = {
  story: 'Vertical (9:16)',
  square: 'Square (1:1)',
  landscape: 'Landscape (16:9)',
}

export function TopBar({ email }: { email?: string }) {
  const router = useRouter()
  const name = useEditor((s) => s.doc.name)
  const rename = useEditor((s) => s.rename)
  const setFormat = useEditor((s) => s.setFormat)
  const w = useEditor((s) => s.doc.width)
  const h = useEditor((s) => s.doc.height)
  const [menu, setMenu] = useState(false)

  const current = (Object.keys(FORMATS) as (keyof typeof FORMATS)[]).find(
    (k) => FORMATS[k].width === w && FORMATS[k].height === h,
  ) ?? 'story'

  async function signOut() {
    await createClient().auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <div className="h-14 shrink-0 bg-white border-b border-black/10 flex items-center justify-between px-3 text-[#15120e]">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#ffd23e] to-[#ff8a3d] grid place-items-center font-black text-sm">S</div>
        <input
          value={name}
          onChange={(e) => rename(e.target.value)}
          className="font-semibold text-sm bg-transparent outline-none rounded px-2 py-1 hover:bg-black/5 focus:bg-black/5 w-44"
        />
        <select
          value={current}
          onChange={(e) => setFormat(e.target.value as keyof typeof FORMATS)}
          className="text-sm border border-black/15 rounded-lg px-3 py-1.5 bg-white outline-none"
        >
          {Object.keys(FORMATS).map((k) => (
            <option key={k} value={k}>{FORMAT_LABEL[k]}</option>
          ))}
        </select>
        <div className="flex items-center gap-1 text-black/30">
          <button className="px-1.5 hover:text-black/60" title="Undo">↺</button>
          <button className="px-1.5 hover:text-black/60" title="Redo">↻</button>
        </div>
        <span className="flex items-center gap-1.5 text-sm text-black/50 ml-1">
          <span className="text-emerald-500">✓</span> Saved
        </span>
      </div>

      <div className="flex items-center gap-2.5">
        <button className="text-sm font-semibold flex items-center gap-1 bg-[#f0ebff] text-[#6b4dff] rounded-full px-3 py-1.5">Upgrade ⚡</button>
        <select className="text-sm border border-black/15 rounded-lg px-2 py-1.5 bg-white outline-none">
          <option>High</option><option>Medium</option><option>Low</option>
        </select>
        <button className="text-sm border border-black/15 rounded-lg px-2 py-1.5 hover:bg-black/5">Fit</button>
        <button className="text-sm border border-black/15 rounded-full px-4 py-1.5 font-medium hover:bg-black/5">Share</button>
        <button className="text-sm bg-[#15120e] text-white rounded-lg px-4 py-1.5 font-semibold">Export</button>
        <div className="relative">
          <button
            onClick={() => setMenu(!menu)}
            className="w-8 h-8 rounded-full bg-[#8b6cf6] text-white grid place-items-center text-sm font-bold uppercase"
          >
            {email?.[0] ?? 'U'}
          </button>
          {menu && (
            <div className="absolute right-0 mt-2 w-44 bg-white border border-black/10 rounded-xl shadow-lg py-1 z-50">
              <div className="px-3 py-2 text-xs text-black/50 truncate">{email}</div>
              <button onClick={signOut} className="w-full text-left px-3 py-2 text-sm hover:bg-black/5">Sign out</button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
