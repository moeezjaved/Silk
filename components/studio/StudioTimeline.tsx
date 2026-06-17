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

      {/* tracks — one named bar per block/layer, like a real timeline */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1.5">
        {[...doc.layers].reverse().map((l) => {
          const left = (l.startFrame / doc.durationInFrames) * 100
          const width = Math.max(4, ((l.endFrame - l.startFrame) / doc.durationInFrames) * 100)
          const on = selectedId === l.id
          const icon = l.type === 'group' ? '⊞' : l.type === 'text' ? 'T' : l.type === 'image' ? '🖼' : l.type === 'video' ? '🎬' : '◆'
          return (
            <div key={l.id} className="relative h-8">
              <button
                onClick={() => select(l.id)}
                style={{ left: `${left}%`, width: `${width}%` }}
                className={`absolute top-0 h-full rounded-md flex items-center gap-1.5 px-2 text-xs border truncate ${
                  on ? 'bg-[#cdeccd] border-[#3a9a3a] text-[#1c4d1c]' : 'bg-[#e7f3e7] border-[#bcd9bc] text-[#3a6b3a] hover:bg-[#ddeedd]'
                }`}
              >
                <span>{icon}</span>
                <span className="truncate">{l.name}</span>
              </button>
            </div>
          )
        })}

        {doc.layers.length === 0 && (
          <div className="text-black/30 text-xs py-4 text-center">Add a block or layer — it appears here as a track.</div>
        )}

        {/* add-time + audio */}
        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={() => setDuration(doc.durationInFrames + doc.fps)}
            className="w-8 h-8 rounded-md bg-[#e6e6ea] border border-black/10 grid place-items-center text-black/50 hover:bg-black/10"
            title="Add a second"
          >
            +
          </button>
          <span className="text-xs text-black/30">♪ Add audio</span>
        </div>
      </div>
    </div>
  )
}
