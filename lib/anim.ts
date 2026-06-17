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
  scale: number
  opacityMul: number
}

const IDENTITY: AnimMods = { dx: 0, dy: 0, scale: 1, opacityMul: 1 }

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

/** Combine enter + exit modifiers for a layer at the given global frame. */
export function resolveAnim(layer: Layer, frame: number): AnimMods {
  const a = layer.anim
  if (!a) return IDENTITY
  let mods = { ...IDENTITY }

  if (a.enter && a.enter.preset !== 'none') {
    const dur = Math.max(1, a.enter.duration)
    const p = clamp01((frame - layer.startFrame) / dur)
    if (p < 1) {
      const m = enterMods(a.enter.preset, p, a.enter.easing ?? 'easeOut')
      mods = { dx: mods.dx + m.dx, dy: mods.dy + m.dy, scale: mods.scale * m.scale, opacityMul: mods.opacityMul * m.opacityMul }
    }
  }

  if (a.exit && a.exit.preset !== 'none') {
    const dur = Math.max(1, a.exit.duration)
    const start = layer.endFrame - dur
    const p = clamp01((frame - start) / dur)
    if (p > 0) {
      const m = exitMods(a.exit.preset, p, a.exit.easing ?? 'easeIn')
      mods = { dx: mods.dx + m.dx, dy: mods.dy + m.dy, scale: mods.scale * m.scale, opacityMul: mods.opacityMul * m.opacityMul }
    }
  }

  return mods
}

export const ENTER_PRESETS: EnterPreset[] = ['none', 'fade', 'slideUp', 'slideDown', 'slideLeft', 'slideRight', 'pop', 'scaleIn']
export const EXIT_PRESETS: ExitPreset[] = ['none', 'fade', 'slideUp', 'slideDown', 'slideLeft', 'slideRight', 'scaleOut']
