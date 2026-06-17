'use client'

import { useLayoutEffect, useRef, useState } from 'react'
import { useEditor } from '@/lib/store'
import { isLayerVisible } from '@/lib/doc'
import { LayerView } from './LayerView'

const HANDLES = [
  { k: 'nw', x: 0, y: 0 },
  { k: 'ne', x: 1, y: 0 },
  { k: 'sw', x: 0, y: 1 },
  { k: 'se', x: 1, y: 1 },
] as const

export function Canvas() {
  const doc = useEditor((s) => s.doc)
  const selectedId = useEditor((s) => s.selectedId)
  const currentFrame = useEditor((s) => s.currentFrame)
  const select = useEditor((s) => s.select)
  const updateLayer = useEditor((s) => s.updateLayer)

  const wrapRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(0.3)

  // Fit the document into the available area.
  useLayoutEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const fit = () => {
      const pad = 48
      const aw = el.clientWidth - pad
      const ah = el.clientHeight - pad
      setScale(Math.min(aw / doc.width, ah / doc.height))
    }
    fit()
    const ro = new ResizeObserver(fit)
    ro.observe(el)
    return () => ro.disconnect()
  }, [doc.width, doc.height])

  const visible = doc.layers.filter((l) => isLayerVisible(l, currentFrame))
  const selected = doc.layers.find((l) => l.id === selectedId) || null

  // ── drag to move ──
  function startMove(e: React.PointerEvent, id: string) {
    e.stopPropagation()
    select(id)
    const layer = doc.layers.find((l) => l.id === id)
    if (!layer) return
    const startX = e.clientX
    const startY = e.clientY
    const ox = layer.x
    const oy = layer.y
    const move = (ev: PointerEvent) => {
      updateLayer(id, {
        x: Math.round(ox + (ev.clientX - startX) / scale),
        y: Math.round(oy + (ev.clientY - startY) / scale),
      })
    }
    const up = () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
  }

  // ── corner resize ──
  function startResize(e: React.PointerEvent, corner: string) {
    e.stopPropagation()
    if (!selected) return
    const startX = e.clientX
    const startY = e.clientY
    const o = { x: selected.x, y: selected.y, w: selected.width, h: selected.height }
    const move = (ev: PointerEvent) => {
      const dx = (ev.clientX - startX) / scale
      const dy = (ev.clientY - startY) / scale
      let { x, y, w, h } = o
      if (corner.includes('e')) w = o.w + dx
      if (corner.includes('s')) h = o.h + dy
      if (corner.includes('w')) {
        w = o.w - dx
        x = o.x + dx
      }
      if (corner.includes('n')) {
        h = o.h - dy
        y = o.y + dy
      }
      updateLayer(selected.id, {
        x: Math.round(x),
        y: Math.round(y),
        width: Math.max(20, Math.round(w)),
        height: Math.max(20, Math.round(h)),
      })
    }
    const up = () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
  }

  return (
    <div ref={wrapRef} className="flex-1 flex items-center justify-center overflow-hidden bg-[#ececed]">
      <div
        onPointerDown={() => select(null)}
        style={{
          width: doc.width * scale,
          height: doc.height * scale,
          borderRadius: 8 * scale,
          boxShadow: '0 30px 90px rgba(0,0,0,.55)',
          overflow: 'hidden',
          position: 'relative',
          flexShrink: 0,
        }}
      >
        {/* document at native size, scaled down as a whole so everything stays crisp */}
        <div
          style={{
            width: doc.width,
            height: doc.height,
            background: doc.background,
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
            position: 'absolute',
            top: 0,
            left: 0,
          }}
        >
          {visible.map((l) => (
            <div key={l.id} onPointerDown={(e) => startMove(e, l.id)} style={{ cursor: 'move' }}>
              <LayerView layer={l} />
            </div>
          ))}
        </div>

        {/* selection overlay, drawn in screen space */}
        {selected && isLayerVisible(selected, currentFrame) && (
          <div
            style={{
              position: 'absolute',
              left: selected.x * scale,
              top: selected.y * scale,
              width: selected.width * scale,
              height: selected.height * scale,
              outline: '1.5px solid #ff5b7f',
              transform: `rotate(${selected.rotation}deg)`,
              pointerEvents: 'none',
            }}
          >
            {HANDLES.map((h) => (
              <div
                key={h.k}
                onPointerDown={(e) => startResize(e, h.k)}
                style={{
                  position: 'absolute',
                  left: `calc(${h.x * 100}% - 6px)`,
                  top: `calc(${h.y * 100}% - 6px)`,
                  width: 12,
                  height: 12,
                  background: '#fff',
                  border: '1.5px solid #ff5b7f',
                  borderRadius: 3,
                  cursor: `${h.k}-resize`,
                  pointerEvents: 'auto',
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
