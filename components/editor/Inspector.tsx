'use client'

import { Layer } from '@/lib/doc'
import { useEditor } from '@/lib/store'

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-16 shrink-0 text-[11px] text-white/40">{label}</span>
      {children}
    </div>
  )
}

const inputCls =
  'w-full bg-white/5 border border-white/10 rounded px-2 py-1.5 text-sm text-white/90 outline-none focus:border-[#ff5b7f]'

export function Inspector() {
  const selectedId = useEditor((s) => s.selectedId)
  const layer = useEditor((s) => s.doc.layers.find((l) => l.id === selectedId)) as Layer | undefined
  const update = useEditor((s) => s.updateLayer)
  const doc = useEditor((s) => s.doc)

  if (!layer) {
    return (
      <div className="w-72 shrink-0 border-l border-white/10 bg-[#15151b] p-4 text-white/30 text-sm">
        Select a layer to edit its properties.
      </div>
    )
  }

  const set = (patch: Partial<Layer>) => update(layer.id, patch)
  const num = (v: string) => Number(v) || 0

  return (
    <div className="w-72 shrink-0 border-l border-white/10 bg-[#15151b] overflow-auto">
      <div className="p-4 space-y-4">
        <div className="text-sm font-semibold text-white/90 capitalize">{layer.type} layer</div>

        {/* transform */}
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <Row label="X"><input className={inputCls} type="number" value={Math.round(layer.x)} onChange={(e) => set({ x: num(e.target.value) })} /></Row>
            <Row label="Y"><input className={inputCls} type="number" value={Math.round(layer.y)} onChange={(e) => set({ y: num(e.target.value) })} /></Row>
            <Row label="W"><input className={inputCls} type="number" value={Math.round(layer.width)} onChange={(e) => set({ width: num(e.target.value) })} /></Row>
            <Row label="H"><input className={inputCls} type="number" value={Math.round(layer.height)} onChange={(e) => set({ height: num(e.target.value) })} /></Row>
          </div>
          <Row label="Rotate"><input className={inputCls} type="number" value={layer.rotation} onChange={(e) => set({ rotation: num(e.target.value) })} /></Row>
          <Row label="Opacity">
            <input type="range" min={0} max={1} step={0.01} value={layer.opacity} onChange={(e) => set({ opacity: Number(e.target.value) })} className="w-full accent-[#ff5b7f]" />
          </Row>
        </div>

        {/* type-specific */}
        {layer.type === 'text' && (
          <div className="space-y-2 border-t border-white/10 pt-3">
            <textarea className={inputCls} rows={2} value={layer.text} onChange={(e) => set({ text: e.target.value })} />
            <div className="grid grid-cols-2 gap-2">
              <Row label="Size"><input className={inputCls} type="number" value={layer.fontSize} onChange={(e) => set({ fontSize: num(e.target.value) })} /></Row>
              <Row label="Weight"><input className={inputCls} type="number" step={100} value={layer.fontWeight} onChange={(e) => set({ fontWeight: num(e.target.value) })} /></Row>
            </div>
            <Row label="Color"><input type="color" value={layer.color} onChange={(e) => set({ color: e.target.value })} className="h-8 w-full bg-transparent" /></Row>
            <Row label="Align">
              <div className="flex gap-1">
                {(['left', 'center', 'right'] as const).map((a) => (
                  <button key={a} onClick={() => set({ align: a })} className={`flex-1 py-1 rounded text-xs ${layer.align === a ? 'bg-[#ff5b7f] text-black' : 'bg-white/5 text-white/60'}`}>{a[0].toUpperCase()}</button>
                ))}
              </div>
            </Row>
          </div>
        )}

        {layer.type === 'shape' && (
          <div className="space-y-2 border-t border-white/10 pt-3">
            <Row label="Fill"><input type="color" value={layer.fill} onChange={(e) => set({ fill: e.target.value })} className="h-8 w-full bg-transparent" /></Row>
            <Row label="Shape">
              <div className="flex gap-1">
                {(['rect', 'ellipse'] as const).map((sh) => (
                  <button key={sh} onClick={() => set({ shape: sh })} className={`flex-1 py-1 rounded text-xs ${layer.shape === sh ? 'bg-[#ff5b7f] text-black' : 'bg-white/5 text-white/60'}`}>{sh}</button>
                ))}
              </div>
            </Row>
            <Row label="Radius"><input className={inputCls} type="number" value={layer.radius} onChange={(e) => set({ radius: num(e.target.value) })} /></Row>
          </div>
        )}

        {(layer.type === 'image' || layer.type === 'video') && (
          <div className="space-y-2 border-t border-white/10 pt-3">
            <Row label="Source"><input className={inputCls} value={layer.src} placeholder="https://…" onChange={(e) => set({ src: e.target.value })} /></Row>
            <Row label="Radius"><input className={inputCls} type="number" value={layer.radius} onChange={(e) => set({ radius: num(e.target.value) })} /></Row>
            <Row label="Fit">
              <div className="flex gap-1">
                {(['cover', 'contain'] as const).map((f) => (
                  <button key={f} onClick={() => set({ fit: f })} className={`flex-1 py-1 rounded text-xs ${layer.fit === f ? 'bg-[#ff5b7f] text-black' : 'bg-white/5 text-white/60'}`}>{f}</button>
                ))}
              </div>
            </Row>
          </div>
        )}

        {/* timing */}
        <div className="space-y-2 border-t border-white/10 pt-3">
          <div className="text-[11px] uppercase tracking-wider text-white/40">Timing (frames)</div>
          <div className="grid grid-cols-2 gap-2">
            <Row label="Start"><input className={inputCls} type="number" min={0} max={doc.durationInFrames} value={layer.startFrame} onChange={(e) => set({ startFrame: num(e.target.value) })} /></Row>
            <Row label="End"><input className={inputCls} type="number" min={0} max={doc.durationInFrames} value={layer.endFrame} onChange={(e) => set({ endFrame: num(e.target.value) })} /></Row>
          </div>
        </div>
      </div>
    </div>
  )
}
