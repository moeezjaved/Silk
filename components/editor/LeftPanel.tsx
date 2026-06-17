'use client'

import { LayerType } from '@/lib/doc'
import { useEditor } from '@/lib/store'

const TOOLS: { type: LayerType; label: string; icon: string }[] = [
  { type: 'text', label: 'Text', icon: 'T' },
  { type: 'image', label: 'Image', icon: '🖼' },
  { type: 'video', label: 'Video', icon: '🎬' },
  { type: 'shape', label: 'Shape', icon: '◆' },
]

export function LeftPanel() {
  const addLayer = useEditor((s) => s.addLayer)
  const layers = useEditor((s) => s.doc.layers)
  const selectedId = useEditor((s) => s.selectedId)
  const select = useEditor((s) => s.select)
  const remove = useEditor((s) => s.removeLayer)
  const reorder = useEditor((s) => s.reorder)

  return (
    <div className="w-60 shrink-0 border-r border-white/10 bg-[#15151b] flex flex-col">
      <div className="p-3">
        <div className="text-[11px] uppercase tracking-wider text-white/40 mb-2 px-1">Add</div>
        <div className="grid grid-cols-2 gap-2">
          {TOOLS.map((t) => (
            <button
              key={t.type}
              onClick={() => addLayer(t.type)}
              className="flex flex-col items-center gap-1 py-3 rounded-lg bg-white/5 hover:bg-white/10 text-white/80 text-xs"
            >
              <span className="text-lg leading-none">{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-3 pt-2 text-[11px] uppercase tracking-wider text-white/40">Layers</div>
      <div className="flex-1 overflow-auto p-2 space-y-1">
        {[...layers].reverse().map((l) => (
          <div
            key={l.id}
            onClick={() => select(l.id)}
            className={`group flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer text-sm ${
              selectedId === l.id ? 'bg-[#ff5b7f] text-black' : 'text-white/70 hover:bg-white/5'
            }`}
          >
            <span className="truncate flex-1">{l.name}</span>
            <button
              onClick={(e) => { e.stopPropagation(); reorder(l.id, 'up') }}
              className="opacity-0 group-hover:opacity-100 px-1"
              title="Bring forward"
            >↑</button>
            <button
              onClick={(e) => { e.stopPropagation(); reorder(l.id, 'down') }}
              className="opacity-0 group-hover:opacity-100 px-1"
              title="Send back"
            >↓</button>
            <button
              onClick={(e) => { e.stopPropagation(); remove(l.id) }}
              className="opacity-0 group-hover:opacity-100 px-1"
              title="Delete"
            >✕</button>
          </div>
        ))}
        {layers.length === 0 && <div className="text-white/30 text-xs px-2 py-3">Empty canvas.</div>}
      </div>
    </div>
  )
}
