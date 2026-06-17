import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0b0b0f] text-white flex flex-col items-center justify-center gap-8 px-6">
      <div className="text-center">
        <div className="text-5xl font-black tracking-tight mb-3">SILK</div>
        <p className="text-white/50 max-w-md">
          The all-in-one video editor for modern brands. Design, animate, and export
          on-brand video — all in the browser.
        </p>
      </div>
      <Link
        href="/editor"
        className="bg-[#ff5b7f] text-black font-semibold rounded-full px-7 py-3"
      >
        Open the editor →
      </Link>
      <p className="text-white/25 text-sm">Phase 1 · document model + freeform editor</p>
    </main>
  )
}
