'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const USE_CASES = ['Business', 'Personal', 'Education', 'Agency', 'Creator', 'Other']
const ROLES = ['Marketer', 'Founder / CEO', 'Designer', 'Video editor', 'Social media manager', 'Developer', 'Other']
const TEAM_SIZES = ['Just me', '2–10', '11–50', '51–200', '200+']
const SOURCES = ["Don't remember", 'Google search', 'Twitter / X', 'Instagram', 'TikTok', 'YouTube', 'Friend / colleague', 'Other']

const ACTIONS = [
  { key: 'template', icon: '▦', title: 'Start from a video template', desc: 'Browse our library of customizable templates' },
  { key: 'motion', icon: '✺', title: 'Browse motion presets', desc: 'Explore editable animated graphics and visual effects' },
  { key: 'edit', icon: '✂', title: 'Edit videos', desc: 'Upload and edit your own video content' },
  { key: 'caption', icon: 'T', title: 'Auto caption videos', desc: 'Add captions to your videos automatically' },
  { key: 'tts', icon: '🎙', title: 'Turn text to speech', desc: 'Convert text into natural-sounding voiceovers' },
  { key: 'explore', icon: '◎', title: 'Just exploring', desc: "Take a look around and see what's possible" },
]

const CATEGORIES = [
  'Apparel', 'Beauty', 'Before and After', 'Comparisons', 'Customer Reviews',
  'Feature Callouts', 'Food and Beverage', 'Health & Wellness', 'Home', 'Pets',
  'Press', 'Product Showcase', 'Sale', 'Slideshows', 'Software / Apps', 'Travel',
  'UGC', 'Us vs Them', 'Other',
]

function Select({ label, value, onChange, options, placeholder }: {
  label: string; value: string; onChange: (v: string) => void; options: string[]; placeholder: string
}) {
  return (
    <div>
      <label className="block text-lg font-bold mb-2">{label}</label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full appearance-none bg-white border border-black/15 rounded-xl px-4 py-3.5 pr-10 outline-none focus:border-black/50 ${value ? 'text-black' : 'text-[#8c8479]'}`}
        >
          <option value="" disabled>{placeholder}</option>
          {options.map((o) => <option key={o} value={o} className="text-black">{o}</option>)}
        </select>
        <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#8c8479]">⌄</span>
      </div>
    </div>
  )
}

function Onboarding() {
  const router = useRouter()
  const params = useSearchParams()
  const next = params.get('next') || '/editor'

  const [step, setStep] = useState(1)
  const [useCase, setUseCase] = useState('')
  const [role, setRole] = useState('')
  const [team, setTeam] = useState('')
  const [source, setSource] = useState('')
  const [action, setAction] = useState('')
  const [cats, setCats] = useState<string[]>([])
  const [busy, setBusy] = useState(false)

  const toggleCat = (c: string) =>
    setCats((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]))

  // step 2 "Let's go": template-pickers get the category screen first
  function advanceFromActions() {
    if (action === 'template') setStep(3)
    else finish()
  }

  async function finish() {
    setBusy(true)
    const supabase = createClient()
    await supabase.auth.updateUser({
      data: {
        onboarded: true,
        use_case: useCase,
        role,
        team_size: team,
        heard_about: source,
        first_action: action,
        template_categories: cats,
      },
    })
    const dest =
      action === 'template'
        ? `/editor${cats.length ? `?cat=${encodeURIComponent(cats.join(','))}` : ''}`
        : next
    router.push(dest)
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-[#f3f0e9] text-[#15120e]">
      <div className="max-w-2xl mx-auto px-6 py-16 md:py-24">
        {step === 1 && (
          <>
            <h1 className="text-5xl md:text-6xl font-black tracking-tight mb-3">Tell us more</h1>
            <p className="text-lg text-[#6b6358] mb-12">Help us personalize your experience.</p>

            <div className="space-y-8 max-w-md">
              <Select label="What will you use Silk for?" value={useCase} onChange={setUseCase} options={USE_CASES} placeholder="Select an option" />
              <Select label="What's your role?" value={role} onChange={setRole} options={ROLES} placeholder="Select an option" />
              <Select label="How big is your team?" value={team} onChange={setTeam} options={TEAM_SIZES} placeholder="Select an option" />
              <Select label="How did you hear about Silk?" value={source} onChange={setSource} options={SOURCES} placeholder="Select an option" />
            </div>

            <button
              onClick={() => setStep(2)}
              disabled={!useCase}
              className="mt-12 bg-[#15120e] text-white font-semibold rounded-xl px-8 py-3.5 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Continue
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <button onClick={() => setStep(1)} className="text-[#6b6358] hover:text-black mb-8 text-sm">← Back</button>
            <h1 className="text-5xl md:text-6xl font-black tracking-tight mb-3">Let's get started</h1>
            <p className="text-lg text-[#6b6358] mb-10">What would you like to do first?</p>

            <div className="grid sm:grid-cols-2 gap-4">
              {ACTIONS.map((a) => (
                <button
                  key={a.key}
                  onClick={() => setAction(a.key)}
                  className={`text-left rounded-2xl border p-6 transition ${
                    action === a.key ? 'border-black bg-white shadow-sm' : 'border-black/12 hover:border-black/30'
                  }`}
                >
                  <div className="text-2xl mb-4">{a.icon}</div>
                  <div className="font-bold text-lg mb-1">{a.title}</div>
                  <div className="text-[#6b6358] text-sm leading-snug">{a.desc}</div>
                </button>
              ))}
            </div>

            <button
              onClick={advanceFromActions}
              disabled={!action || busy}
              className="mt-10 bg-[#15120e] text-white font-semibold rounded-xl px-8 py-3.5 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {busy ? 'Setting up…' : "Let's go"}
            </button>
          </>
        )}

        {step === 3 && (
          <>
            <button onClick={() => setStep(2)} className="text-[#6b6358] hover:text-black mb-8 text-sm">← Back</button>
            <h1 className="text-5xl md:text-6xl font-black tracking-tight mb-3">Start from a video template</h1>
            <p className="text-lg text-[#6b6358] mb-10">What kind of templates are you looking for? Select all that apply.</p>

            <div className="flex flex-wrap gap-3 max-w-4xl">
              {CATEGORIES.map((c) => {
                const on = cats.includes(c)
                return (
                  <button
                    key={c}
                    onClick={() => toggleCat(c)}
                    className={`rounded-full border px-5 py-2.5 text-sm font-medium transition ${
                      on ? 'bg-[#15120e] text-white border-[#15120e]' : 'border-black/20 hover:border-black/50'
                    }`}
                  >
                    {c}
                  </button>
                )
              })}
            </div>

            <button
              onClick={finish}
              disabled={!cats.length || busy}
              className="mt-12 bg-[#15120e] text-white font-semibold rounded-xl px-8 py-3.5 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {busy ? 'Setting up…' : "Let's go"}
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={null}>
      <Onboarding />
    </Suspense>
  )
}
