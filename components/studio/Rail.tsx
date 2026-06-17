'use client'

export type Tool =
  | 'templates' | 'blocks' | 'text' | 'stock'
  | 'brandkit' | 'uploads' | 'captions' | 'audio' | 'shortcuts'

const ITEMS: { key: Tool; label: string; icon: string }[] = [
  { key: 'templates', label: 'Templates', icon: '▦' },
  { key: 'blocks', label: 'Blocks', icon: '⬚' },
  { key: 'text', label: 'Text', icon: 'T' },
  { key: 'stock', label: 'Stock', icon: '◉' },
  { key: 'brandkit', label: 'BrandKit', icon: '✦' },
  { key: 'uploads', label: 'Uploads', icon: '⤒' },
  { key: 'captions', label: 'Captions', icon: '▤' },
  { key: 'audio', label: 'Audio', icon: '♪' },
  { key: 'shortcuts', label: 'Shortcuts', icon: '⌘' },
]

export function Rail({ active, onSelect }: { active: Tool; onSelect: (t: Tool) => void }) {
  return (
    <div className="w-[74px] shrink-0 bg-[#0f0f12] flex flex-col items-center py-2 gap-1 overflow-y-auto">
      {ITEMS.map((it) => {
        const on = active === it.key
        return (
          <button
            key={it.key}
            onClick={() => onSelect(it.key)}
            className={`w-[62px] py-2 rounded-lg flex flex-col items-center gap-1 transition ${
              on ? 'bg-white/10 text-white' : 'text-white/45 hover:text-white/80'
            }`}
          >
            <span className="text-lg leading-none">{it.icon}</span>
            <span className="text-[10px]">{it.label}</span>
          </button>
        )
      })}
    </div>
  )
}
