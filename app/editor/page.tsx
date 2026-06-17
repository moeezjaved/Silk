'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useEditor } from '@/lib/store'
import { buildDoc } from '@/lib/templates'
import { createClient } from '@/lib/supabase/client'
import { Canvas } from '@/components/editor/Canvas'
import { Inspector } from '@/components/editor/Inspector'
import { TopBar } from '@/components/studio/TopBar'
import { Rail, type Tool } from '@/components/studio/Rail'
import { SidePanel } from '@/components/studio/SidePanel'
import { StudioTimeline } from '@/components/studio/StudioTimeline'

function Studio() {
  const params = useSearchParams()
  const loadDoc = useEditor((s) => s.loadDoc)
  const setFrame = useEditor((s) => s.setFrame)
  const selectedId = useEditor((s) => s.selectedId)

  const cat = params.get('cat')
  const categoryFilter = cat ? cat.split(',') : undefined
  // open Templates panel first if the user came from the template flow
  const [tool, setTool] = useState<Tool>(cat ? 'templates' : 'templates')
  const [email, setEmail] = useState<string>()

  useEffect(() => {
    loadDoc(buildDoc(params.get('template') || undefined))
    // open on a settled frame so the composed scene is visible (not mid-entrance)
    setFrame(60)
  }, [loadDoc, setFrame, params])

  useEffect(() => {
    createClient().auth.getUser().then(({ data }) => setEmail(data.user?.email ?? undefined))
  }, [])

  return (
    <div className="h-screen w-screen flex flex-col bg-[#0b0b0f] overflow-hidden">
      <TopBar email={email} />
      <div className="flex-1 flex overflow-hidden">
        <Rail active={tool} onSelect={setTool} />
        <div className="w-80 shrink-0 bg-[#1a1a1e] border-r border-black/40 overflow-hidden">
          <SidePanel tool={tool} categoryFilter={categoryFilter} />
        </div>
        <Canvas />
        {selectedId && <Inspector />}
      </div>
      <StudioTimeline />
    </div>
  )
}

export default function EditorPage() {
  return (
    <Suspense fallback={<div className="h-screen bg-[#0b0b0f]" />}>
      <Studio />
    </Suspense>
  )
}
