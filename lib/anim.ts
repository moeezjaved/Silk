import { Easing, EnterPreset, ExitPreset, Layer } from './doc'

// ── easing functions ─────────────────────────────────────────────────────────
const EASE: Record<Easing, (t: number) => number> = {
  linear: (t) => t,
  easeIn: (t) => t * t * t,
  easeOut: (t) => 1 - Math.pow(1 - t, 3),
  easeInOut: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  back: (t) => {
    const c1 = 1.70158, c3 = c1 + 1
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2)
  },
}

const clamp01 = (n: number) => Math.max(0, Math.min(1, n))

/** Distance (document px) used by slide presets. */
const SLIDE = 160

export interface AnimMods {
  dx: number
  dy: number
  drot: number
  scale: number
  opacityMul: number
}

const IDENTITY: AnimMods = { dx: 0, dy: 0, drot: 0, scale: 1, opacityMul: 1 }
const lerp = (a: number, b: number, t: number) => a + (b - a) * t

/**
 * Enter presets: p=0 → fully off (just appearing), p=1 → resting/identity.
 * Returns the visual offset at progress p (already eased per preset).
 */
function enterMods(preset: EnterPreset, p: number, easing: Easing): AnimMods {
  const e = EASE[easing](p)
  switch (preset) {
    case 'fade': return { ...IDENTITY, opacityMul: e }
    case 'slideUp': return { ...IDENTITY, dy: (1 - e) * SLIDE, opacityMul: e }
    case 'slideDown': return { ...IDENTITY, dy: (1 - e) * -SLIDE, opacityMul: e }
    case 'slideLeft': return { ...IDENTITY, dx: (1 - e) * SLIDE, opacityMul: e }
    case 'slideRight': return { ...IDENTITY, dx: (1 - e) * -SLIDE, opacityMul: e }
    case 'scaleIn': return { ...IDENTITY, scale: 0.85 + 0.15 * e, opacityMul: e }
    case 'pop': {
      const b = EASE.back(p)
      return { ...IDENTITY, scale: 0.4 + 0.6 * b, opacityMul: clamp01(p * 2) }
    }
    default: return IDENTITY
  }
}

/** Exit presets: p=0 → identity, p=1 → fully gone. */
function exitMods(preset: ExitPreset, p: number, easing: Easing): AnimMods {
  const e = EASE[easing](p)
  switch (preset) {
    case 'fade': return { ...IDENTITY, opacityMul: 1 - e }
    case 'slideUp': return { ...IDENTITY, dy: -e * SLIDE, opacityMul: 1 - e }
    case 'slideDown': return { ...IDENTITY, dy: e * SLIDE, opacityMul: 1 - e }
    case 'slideLeft': return { ...IDENTITY, dx: -e * SLIDE, opacityMul: 1 - e }
    case 'slideRight': return { ...IDENTITY, dx: e * SLIDE, opacityMul: 1 - e }
    case 'scaleOut': return { ...IDENTITY, scale: 1 - 0.15 * e, opacityMul: 1 - e }
    default: return IDENTITY
  }
}

const merge = (a: AnimMods, b: AnimMods): AnimMods => ({
  dx: a.dx + b.dx, dy: a.dy + b.dy, drot: a.drot + b.drot,
  scale: a.scale * b.scale, opacityMul: a.opacityMul * b.opacityMul,
})

/** Combine enter/from + exit modifiers for a layer at the given global frame. */
export function resolveAnim(layer: Layer, frame: number): AnimMods {
  const a = layer.anim
  if (!a) return IDENTITY
  let mods = { ...IDENTITY }
  const enterDur = Math.max(1, a.enter?.duration ?? 15)

  // custom entrance: interpolate explicit start values → the layer's rest values
  if (a.from) {
    const p = clamp01((frame - layer.startFrame) / enterDur)
    if (p < 1) {
      const e = EASE[a.enter?.easing ?? 'easeOut'](p)
      const f = a.from
      const m: AnimMods = { ...IDENTITY }
      if (f.x != null) m.dx = (f.x - layer.x) * (1 - e)
      if (f.y != null) m.dy = (f.y - layer.y) * (1 - e)
      if (f.rotation != null) m.drot = (f.rotation - layer.rotation) * (1 - e)
      if (f.scale != null) m.scale = lerp(f.scale, 1, e)
      if (f.opacity != null) m.opacityMul = lerp(f.opacity, 1, e)
      mods = merge(mods, m)
    }
  }

  if (a.enter && a.enter.preset !== 'none') {
    const p = clamp01((frame - layer.startFrame) / enterDur)
    if (p < 1) mods = merge(mods, enterMods(a.enter.preset, p, a.enter.easing ?? 'easeOut'))
  }

  if (a.exit && a.exit.preset !== 'none') {
    const dur = Math.max(1, a.exit.duration)
    const p = clamp01((frame - (layer.endFrame - dur)) / dur)
    if (p > 0) mods = merge(mods, exitMods(a.exit.preset, p, a.exit.easing ?? 'easeIn'))
  }

  return mods
}

export const ENTER_PRESETS: EnterPreset[] = ['none', 'fade', 'slideUp', 'slideDown', 'slideLeft', 'slideRight', 'pop', 'scaleIn']
export const EXIT_PRESETS: ExitPreset[] = ['none', 'fade', 'slideUp', 'slideDown', 'slideLeft', 'slideRight', 'scaleOut']
