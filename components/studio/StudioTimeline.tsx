'use client'

import { useEffect, useRef } from 'react'
import { useEditor } from '@/lib/store'

export function StudioTimeline() {
  const doc = useEditor((s) => s.doc)
  const frame = useEditor((s) => s.currentFrame)
  const playing = useEditor((s) => s.playing)
  const setFrame = useEditor((s) => s.setFrame)
  const setPlaying = useEditor((s) => s.setPlaying)
  const setDuration = useEditor((s) => s.setDuration)
  const select = useEditor((s) => s.select)
  const selectedId = useEditor((s) => s.selectedId)

  const raf = useRef<number>(0)
  const last = useRef<number>(0)

  useEffect(() => {
    if (!playing) return
    last.current = performance.now()
    const tick = (now: number) => {
      const dt = (now - last.current) / 1000
      last.current = now
      const next = useEditor.getState().currentFrame + dt * doc.fps
      if (next >= doc.durationInFrames) setFrame(0)
      else setFrame(next)
      raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf.current)
  }, [playing, doc.fps, doc.durationInFrames, setFrame])

  const totalSecs = doc.durationInFrames / doc.fps
  const fmt = (f: number) => {
    const s = Math.floor(f / doc.fps)
    return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
  }
  const ticks = Array.from({ length: Math.ceil(totalSecs) + 1 }, (_, i) => i)

  function scrub(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect()
    const pct = (e.clientX - rect.left) / rect.width
    setFrame(pct * doc.durationInFrames)
  }

  return (
    <div className="h-52 shrink-0 border-t border-black/10 bg-[#fafafa] flex flex-col text-[#15120e]">
      {/* transport */}
      <div className="h-11 flex items-center gap-3 px-4 border-b border-black/5">
        <button
          onClick={() => setPlaying(!playing)}
          className="w-8 h-8 rounded-full bg-[#15120e] text-white grid place-items-center text-xs"
        >
          {playing ? '❚❚' : '►'}
        </button>
        <span className="text-sm tabular-nums text-black/60">{fmt(frame)} / {fmt(doc.durationInFrames)}</span>
        <div className="flex-1" />
        <div className="flex items-center gap-2 text-black/40 text-sm">
          <span>🔍</span>
          <input type="range" min={0.5} max={2} step={0.1} defaultValue={1} className="w-24 accent-[#15120e]" />
          <button className="border border-black/15 rounded px-2 py-0.5 text-xs hover:bg-black/5">Fit</button>
        </div>
      </div>

      {/* ruler */}
      <div className="relative h-6 border-b border-black/5 cursor-pointer select-none" onClick={scrub}>
        <div className="absolute inset-0 flex">
          {ticks.map((t) => (
            <div key={t} className="border-l border-black/10 text-[10px] text-black/40 pl-1" style={{ width: `${100 / Math.max(1, totalSecs)}%` }}>
              {t}.00
            </div>
          ))}
        </div>
        {/* playhead */}
        <div className="absolute top-0 bottom-0 w-px bg-[#ff5b7f] z-10" style={{ left: `${(frame / doc.durationInFrames) * 100}%` }}>
          <div className="w-2.5 h-2.5 -ml-1 -mt-1 rounded-sm bg-[#ff5b7f]" />
        </div>
      </div>

      {/* tracks */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-xs text-black/40 w-20 shrink-0">⬚ Add blocks</span>
          <div className="flex items-center gap-1.5 flex-1">
            <button
              onClick={() => select(selectedId)}
              className="h-9 rounded-md bg-[#e6e6ea] border border-black/10 flex items-center px-3 text-xs text-black/60"
              style={{ width: `${Math.min(100, (totalSecs / Math.max(totalSecs, totalSecs)) * 100)}%`, maxWidth: 220 }}
            >
              {totalSecs.toFixed(0)}s scene · {doc.layers.length} layers
            </button>
            <button
              onClick={() => setDuration(doc.durationInFrames + doc.fps)}
              className="w-9 h-9 rounded-md bg-[#e6e6ea] border border-black/10 grid place-items-center text-black/50 hover:bg-black/10"
              title="Add a second"
            >
              +
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-black/40 w-20 shrink-0">♪ Add audio</span>
          <div className="h-9 flex-1 rounded-md border border-dashed border-black/15" />
        </div>
      </div>
    </div>
  )
}
