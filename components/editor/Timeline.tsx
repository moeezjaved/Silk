'use client'

import { useEffect, useRef } from 'react'
import { useEditor } from '@/lib/store'

export function Timeline() {
  const doc = useEditor((s) => s.doc)
  const frame = useEditor((s) => s.currentFrame)
  const playing = useEditor((s) => s.playing)
  const setFrame = useEditor((s) => s.setFrame)
  const setPlaying = useEditor((s) => s.setPlaying)
  const select = useEditor((s) => s.select)
  const selectedId = useEditor((s) => s.selectedId)

  const raf = useRef<number>(0)
  const last = useRef<number>(0)

  // playback loop — advance currentFrame at fps, loop at the end
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

  const secs = (f: number) => (f / doc.fps).toFixed(1)

  return (
    <div className="h-56 border-t border-white/10 bg-[#15151b] flex flex-col">
      {/* transport */}
      <div className="flex items-center gap-3 px-4 h-12 border-b border-white/10">
        <button
          onClick={() => setPlaying(!playing)}
          className="w-9 h-9 rounded-full bg-[#ff5b7f] text-black grid place-items-center font-bold"
        >
          {playing ? '❚❚' : '►'}
        </button>
        <button onClick={() => setFrame(0)} className="text-white/50 hover:text-white text-sm">
          ⏮
        </button>
        <div className="text-xs text-white/40 tabular-nums w-28">
          {secs(frame)}s / {secs(doc.durationInFrames)}s
        </div>
        <input
          type="range"
          min={0}
          max={doc.durationInFrames}
          step={1}
          value={frame}
          onChange={(e) => setFrame(Number(e.target.value))}
          className="flex-1 accent-[#ff5b7f]"
        />
      </div>

      {/* tracks */}
      <div className="flex-1 overflow-auto p-2 space-y-1.5 relative">
        {doc.layers.length === 0 && (
          <div className="text-white/30 text-sm px-2 py-6 text-center">
            No layers yet — add one from the left panel.
          </div>
        )}
        {[...doc.layers].reverse().map((l) => {
          const left = (l.startFrame / doc.durationInFrames) * 100
          const width = ((l.endFrame - l.startFrame) / doc.durationInFrames) * 100
          return (
            <div key={l.id} className="flex items-center gap-2">
              <div className="w-24 shrink-0 text-xs text-white/50 truncate">{l.name}</div>
              <div className="relative flex-1 h-7 rounded bg-black/30">
                <div
                  onClick={() => select(l.id)}
                  style={{ left: `${left}%`, width: `${width}%` }}
                  className={`absolute top-0 h-full rounded cursor-pointer text-[11px] flex items-center px-2 ${
                    selectedId === l.id ? 'bg-[#ff5b7f] text-black' : 'bg-white/15 text-white/70'
                  }`}
                >
                  {l.type}
                </div>
              </div>
            </div>
          )
        })}
        {/* playhead */}
        <div
          className="absolute top-0 bottom-0 w-px bg-[#ff5b7f] pointer-events-none"
          style={{ left: `calc(104px + ${(frame / doc.durationInFrames) * (100 - 0)}% * 0)` }}
        />
      </div>
    </div>
  )
}
