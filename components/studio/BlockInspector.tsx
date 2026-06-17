'use client'

import { useState } from 'react'
import { useEditor } from '@/lib/store'
import { GroupLayer } from '@/lib/doc'
import { getBlockDef, Props } from '@/lib/blocks'

const EFFECTS = ['default', 'fade', 'pop', 'slideUp', 'scaleIn'] as const

export function BlockInspector({ group }: { group: GroupLayer }) {
  const def = getBlockDef(group.blockId)
  const setBlockProps = useEditor((s) => s.setBlockProps)
  const select = useEditor((s) => s.select)
  const [tab, setTab] = useState<'design' | 'effects'>('design')
  const [saved, setSaved] = useState(false)

  if (!def) return null
  const props: Props = { ...def.defaultProps, ...(group.props ?? {}) }
  const update = (patch: Props) => setBlockProps(group.id, { ...props, ...patch })

  const images = Array.isArray(props.images) ? (props.images as string[]) : []

  function onUpload(e: React.ChangeEvent<HTMLInputElement>, key: string, max: number) {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    const urls = files.map((f) => URL.createObjectURL(f))
    update({ [key]: [...images, ...urls].slice(0, max) })
  }

  return (
    <div className="w-80 shrink-0 border-l border-black/10 bg-white text-[#15120e] overflow-y-auto">
      {/* header */}
      <div className="flex items-center justify-between px-4 h-12 border-b border-black/5">
        <div className="flex items-center gap-2">
          <button onClick={() => select(null)} className="text-black/40 hover:text-black">✕</button>
          <span className="font-semibold text-sm">{def.name}</span>
        </div>
        <button
          onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 1500) }}
          className="text-xs font-semibold border border-black/20 rounded-full px-3 py-1.5 hover:bg-black/5"
        >
          {saved ? 'Saved ✓' : 'Save Block'}
        </button>
      </div>

      {/* tabs */}
      <div className="flex border-b border-black/10">
        {(['design', 'effects'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-3 text-sm font-medium capitalize relative ${tab === t ? 'text-black' : 'text-black/40'}`}
          >
            {t}
            {tab === t && <span className="absolute bottom-0 left-1/4 right-1/4 h-0.5 bg-black rounded" />}
          </button>
        ))}
      </div>

      {/* design */}
      {tab === 'design' && (
        <div className="p-4 space-y-5">
          {def.controls.map((c) => {
            if (c.type === 'images') {
              const list = Array.isArray(props[c.key]) ? (props[c.key] as string[]) : []
              return (
                <div key={c.key}>
                  <div className="text-sm font-medium mb-2">{c.label}</div>
                  <div className="grid grid-cols-3 gap-2">
                    {list.map((src, i) => (
                      <div
                        key={i}
                        className="relative aspect-square rounded-lg overflow-hidden border border-black/10"
                        style={{ background: 'repeating-conic-gradient(#eee 0 25%, #fff 0 50%) 0 0 / 16px 16px' }}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={src} alt="" className="w-full h-full object-contain" />
                        <button
                          onClick={() => update({ [c.key]: list.filter((_, j) => j !== i) })}
                          className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white text-xs grid place-items-center"
                        >✕</button>
                      </div>
                    ))}
                    {list.length < c.max && (
                      <label className="aspect-square rounded-lg border-2 border-dashed border-black/20 grid place-items-center cursor-pointer hover:border-black/40 text-2xl text-black/40">
                        +
                        <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => onUpload(e, c.key, c.max)} />
                      </label>
                    )}
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button className="text-xs border border-black/15 rounded-lg px-3 py-1.5 hover:bg-black/5">Manage</button>
                    <button className="text-xs border border-black/15 rounded-lg px-3 py-1.5 hover:bg-black/5" title="Background removal — coming soon">Remove BG</button>
                  </div>
                </div>
              )
            }
            if (c.type === 'text') {
              return (
                <div key={c.key}>
                  <div className="text-sm font-medium mb-1.5">{c.label}</div>
                  <input
                    value={String(props[c.key] ?? '')}
                    onChange={(e) => update({ [c.key]: e.target.value })}
                    className="w-full border border-black/15 rounded-lg px-3 py-2 text-sm outline-none focus:border-black/50"
                  />
                </div>
              )
            }
            // slider
            return (
              <div key={c.key}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-medium">{c.label}</span>
                  <span className="text-xs text-black/50 tabular-nums">{Number(props[c.key] ?? 0)}</span>
                </div>
                <input
                  type="range" min={c.min} max={c.max} step={c.step}
                  value={Number(props[c.key] ?? c.min)}
                  onChange={(e) => update({ [c.key]: Number(e.target.value) })}
                  className="w-full accent-[#15120e]"
                />
              </div>
            )
          })}
        </div>
      )}

      {/* effects */}
      {tab === 'effects' && (
        <div className="p-4">
          <div className="text-sm font-medium mb-3">Animation style</div>
          <div className="grid grid-cols-2 gap-2">
            {EFFECTS.map((eff) => {
              const active = String(props.effect ?? 'default') === eff
              return (
                <button
                  key={eff}
                  onClick={() => update({ effect: eff })}
                  className={`rounded-lg border py-4 text-sm capitalize ${active ? 'border-black bg-black/5 font-semibold' : 'border-black/15 hover:border-black/40'}`}
                >
                  {eff}
                </button>
              )
            })}
          </div>
          <p className="text-xs text-black/40 mt-4">Press play in the timeline to preview the motion.</p>
        </div>
      )}
    </div>
  )
}
