'use client'

import { useState } from 'react'
import { nanoid } from 'nanoid'
import { Tool } from './Rail'
import { useEditor } from '@/lib/store'
import { TEMPLATES, buildDoc } from '@/lib/templates'
import { Layer } from '@/lib/doc'

function Header({ title }: { title: string }) {
  return <div className="text-sm font-semibold text-white/90 px-4 pt-4 pb-3">{title}</div>
}

function Soon({ title }: { title: string }) {
  return (
    <div className="p-4">
      <Header title={title} />
      <div className="text-white/35 text-sm px-4">Coming soon.</div>
    </div>
  )
}

export function SidePanel({ tool, categoryFilter }: { tool: Tool; categoryFilter?: string[] }) {
  const loadDoc = useEditor((s) => s.loadDoc)
  const addLayer = useEditor((s) => s.addLayer)
  const addLayerFrom = useEditor((s) => s.addLayerFrom)
  const doc = useEditor((s) => s.doc)
  const [chips, setChips] = useState<string[]>(categoryFilter ?? [])

  const cx = doc.width / 2

  function addText(kind: 'heading' | 'subheading' | 'body') {
    const sizes = { heading: 130, subheading: 70, body: 42 }
    const weights = { heading: 900, subheading: 700, body: 400 }
    const layer: Layer = {
      id: nanoid(8), name: kind[0].toUpperCase() + kind.slice(1), type: 'text',
      x: cx - 420, y: doc.height / 2 - 80, width: 840, height: 200, rotation: 0, opacity: 1,
      startFrame: 0, endFrame: doc.durationInFrames,
      text: kind === 'heading' ? 'Add a heading' : kind === 'subheading' ? 'Add a subheading' : 'Add a little bit of body text',
      fontSize: sizes[kind], fontWeight: weights[kind], color: '#ffffff', align: 'center', lineHeight: 1.1, fontFamily: 'Inter, sans-serif',
      anim: { enter: { preset: 'slideUp', duration: 12 } },
    }
    addLayerFrom(layer)
  }

  function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    const isVideo = file.type.startsWith('video')
    addLayerFrom({
      id: nanoid(8), name: file.name.slice(0, 18), type: isVideo ? 'video' : 'image',
      x: cx - 300, y: doc.height / 2 - 300, width: 600, height: 600, rotation: 0, opacity: 1,
      startFrame: 0, endFrame: doc.durationInFrames, src: url, fit: 'cover', radius: 0,
      anim: { enter: { preset: 'fade', duration: 10 } },
    } as Layer)
  }

  // ── Templates ──
  if (tool === 'templates') {
    const visible = chips.length
      ? TEMPLATES.filter((t) => chips.some((c) => t.category.toLowerCase().includes(c.toLowerCase()) || c.toLowerCase().includes(t.category.toLowerCase())))
      : TEMPLATES
    const list = visible.length ? visible : TEMPLATES
    return (
      <div className="flex flex-col h-full">
        <Header title="Templates" />
        {chips.length > 0 && (
          <div className="flex flex-wrap gap-2 px-4 pb-3">
            {chips.map((c) => (
              <span key={c} className="flex items-center gap-1 bg-white/10 text-white/80 text-xs rounded-full px-2.5 py-1">
                {c}
                <button onClick={() => setChips(chips.filter((x) => x !== c))} className="text-white/50 hover:text-white">✕</button>
              </span>
            ))}
          </div>
        )}
        <div className="flex-1 overflow-y-auto px-4 pb-4 grid grid-cols-2 gap-3">
          {list.map((t) => (
            <button
              key={t.id}
              onClick={() => loadDoc(buildDoc(t.id))}
              className="relative rounded-xl overflow-hidden border border-white/10 aspect-[9/16] flex flex-col items-center justify-center group"
              style={{ background: t.bg }}
            >
              {t.badge && <span className="absolute top-2 right-2 text-[9px] font-bold bg-[#e8472b] text-white rounded px-1.5 py-0.5">{t.badge}</span>}
              <span className="font-black text-center px-2 leading-none whitespace-pre-line" style={{ color: t.accent, fontSize: 20 }}>{t.headline}</span>
              <span className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition flex items-center justify-center opacity-0 group-hover:opacity-100">
                <span className="bg-white text-black text-xs font-semibold rounded-full px-3 py-1.5">Use</span>
              </span>
            </button>
          ))}
        </div>
      </div>
    )
  }

  // ── Text ──
  if (tool === 'text') {
    return (
      <div>
        <Header title="Text" />
        <div className="px-4 space-y-2">
          <button onClick={() => addText('heading')} className="w-full text-left bg-white/5 hover:bg-white/10 rounded-lg px-4 py-4 text-white font-black text-2xl">Add a heading</button>
          <button onClick={() => addText('subheading')} className="w-full text-left bg-white/5 hover:bg-white/10 rounded-lg px-4 py-3 text-white font-bold text-lg">Add a subheading</button>
          <button onClick={() => addText('body')} className="w-full text-left bg-white/5 hover:bg-white/10 rounded-lg px-4 py-3 text-white/90 text-sm">Add a little bit of body text</button>
        </div>
      </div>
    )
  }

  // ── Blocks ──
  if (tool === 'blocks') {
    return (
      <div>
        <Header title="Blocks" />
        <div className="px-4 grid grid-cols-2 gap-3">
          <button onClick={() => addLayer('shape')} className="aspect-square bg-white/5 hover:bg-white/10 rounded-lg flex items-center justify-center">
            <span className="w-12 h-12 rounded-md bg-[#ff5b7f]" />
          </button>
          <button onClick={() => { addLayer('shape'); }} className="aspect-square bg-white/5 hover:bg-white/10 rounded-lg flex items-center justify-center">
            <span className="w-12 h-12 rounded-full bg-[#7db4ff]" />
          </button>
        </div>
      </div>
    )
  }

  // ── Uploads ──
  if (tool === 'uploads') {
    return (
      <div>
        <Header title="Uploads" />
        <div className="px-4">
          <label className="block border-2 border-dashed border-white/15 rounded-xl py-10 text-center text-white/50 text-sm cursor-pointer hover:border-white/30">
            Click to upload image or video
            <input type="file" accept="image/*,video/*" onChange={onUpload} className="hidden" />
          </label>
        </div>
      </div>
    )
  }

  const titles: Record<string, string> = {
    stock: 'Stock', brandkit: 'BrandKit', captions: 'Captions', audio: 'Audio', shortcuts: 'Shortcuts',
  }
  return <Soon title={titles[tool] || ''} />
}
