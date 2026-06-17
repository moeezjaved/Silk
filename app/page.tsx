import Link from 'next/link'
import { TEMPLATES } from '@/lib/templates'

export default function Home() {
  return (
    <div className="min-h-screen bg-[#f3f0e9] text-[#15120e]">
      {/* nav */}
      <nav className="sticky top-0 z-50 bg-[#f3f0e9]/85 backdrop-blur border-b border-black/5">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="font-black text-xl tracking-tight">SILK</span>
          <div className="hidden md:flex gap-7 text-sm font-medium text-[#6b6358]">
            <a href="#templates" className="hover:text-black">Templates</a>
            <a href="#" className="hover:text-black">Pricing</a>
            <a href="#" className="hover:text-black">Affiliates</a>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/login" className="text-sm font-medium text-[#6b6358] hover:text-black px-3 py-2">Log in</Link>
            <Link href="/login?next=%2Feditor" className="text-sm bg-[#15120e] text-white font-semibold rounded-full px-4 py-2">Sign up</Link>
          </div>
        </div>
      </nav>

      {/* hero */}
      <header className="max-w-6xl mx-auto px-6 pt-20 pb-10 text-center">
        <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-[0.95]">
          Create better video, <span className="italic">faster.</span>
        </h1>
        <p className="mt-5 text-lg text-[#6b6358] max-w-xl mx-auto">
          Browse and remix video templates from the world's best brands. Click create,
          make it yours, publish everywhere.
        </p>
        <Link
          href="/login?next=%2Feditor"
          className="inline-block mt-8 bg-[#15120e] text-white font-semibold rounded-full px-7 py-3.5"
        >
          Sign up for free
        </Link>
      </header>

      {/* templates gallery */}
      <section id="templates" className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex items-baseline gap-3 mb-2">
          <h2 className="text-3xl md:text-4xl font-black tracking-tight">Templates</h2>
          <span className="text-sm font-bold bg-[#15120e] text-white rounded-full px-3 py-1">🔥 Drops weekly!</span>
        </div>
        <p className="text-[#6b6358] mb-8">Need inspiration? Browse and remix templates from the world's top brands.</p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {TEMPLATES.map((t) => (
            <Link
              key={t.id}
              href={`/editor?template=${t.id}`}
              className="group relative rounded-2xl overflow-hidden border-4 border-[#15120e] aspect-[9/16] flex flex-col items-center justify-center"
              style={{ background: t.bg }}
            >
              {t.badge && (
                <span className="absolute top-3 right-3 text-[10px] font-bold bg-[#e8472b] text-white rounded px-2 py-0.5">{t.badge}</span>
              )}
              <div
                className="text-center px-4 font-black leading-none whitespace-pre-line"
                style={{ color: t.accent, fontSize: 34 }}
              >
                {t.headline}
              </div>
              <div className="mt-3 text-xs font-semibold px-4 text-center" style={{ color: t.accent === '#15120e' ? '#15120e' : '#ffffff', opacity: 0.85 }}>
                {t.sub}
              </div>

              {/* hover create overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/35 transition flex items-center justify-center opacity-0 group-hover:opacity-100">
                <span className="bg-white text-[#15120e] font-semibold rounded-full px-5 py-2.5 text-sm">+ Create</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <footer className="border-t border-black/5 mt-12">
        <div className="max-w-6xl mx-auto px-6 py-8 flex justify-between text-sm text-[#a39a8c]">
          <span className="font-black text-[#15120e]">SILK</span>
          <span>© 2026 Silk. All rights reserved.</span>
        </div>
      </footer>
    </div>
  )
}
