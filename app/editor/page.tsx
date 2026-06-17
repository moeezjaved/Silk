'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useEditor } from '@/lib/store'
import { starterTemplate } from '@/lib/templates'
import { Canvas } from '@/components/editor/Canvas'
import { LeftPanel } from '@/components/editor/LeftPanel'
import { Inspector } from '@/components/editor/Inspector'
import { Timeline } from '@/components/editor/Timeline'

export default function EditorPage() {
  const loadDoc = useEditor((s) => s.loadDoc)
  const docName = useEditor((s) => s.doc.name)

  // load a starter document on first mount so the canvas isn't blank
  useEffect(() => {
    loadDoc(starterTemplate())
  }, [loadDoc])

  return (
    <div className="h-screen w-screen flex flex-col bg-[#0b0b0f] text-white overflow-hidden">
      {/* top bar */}
      <div className="h-12 shrink-0 border-b border-white/10 flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <Link href="/" className="font-black tracking-tight">SILK</Link>
          <span className="text-white/30">/</span>
          <span className="text-sm text-white/70">{docName}</span>
        </div>
        <div className="flex items-center gap-2">
          <button className="text-sm text-white/60 hover:text-white px-3 py-1.5">Save</button>
          <button className="text-sm bg-[#ff5b7f] text-black font-semibold rounded-full px-4 py-1.5">Export</button>
        </div>
      </div>

      {/* main */}
      <div className="flex-1 flex overflow-hidden">
        <LeftPanel />
        <Canvas />
        <Inspector />
      </div>

      <Timeline />
    </div>
  )
}
