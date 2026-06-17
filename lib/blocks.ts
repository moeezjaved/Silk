import { nanoid } from 'nanoid'
import { EnterPreset, GroupLayer, Layer, SceneDoc } from './doc'

/**
 * Blocks are PARAMETRIC: a BlockDef describes editable props (images, text,
 * sliders) via `controls`, and `build(doc, props)` regenerates the animated
 * GroupLayer from those props. Selecting a block in the editor shows its
 * controls (Design tab); changing them rebuilds the group's children. This is
 * what lets a user drop their own product into a block and have it animate.
 */
export type Props = Record<string, unknown>

export type BlockControl =
  | { type: 'images'; key: string; label: string; max: number }
  | { type: 'text'; key: string; label: string }
  | { type: 'slider'; key: string; label: string; min: number; max: number; step: number }

export interface BlockDef {
  id: string
  name: string
  category: string
  accent: string
  defaultProps: Props
  controls: BlockControl[]
  build: (doc: SceneDoc, props: Props) => GroupLayer
}

export const BLOCK_CATEGORIES = ['Product Showcase', 'Carousels', 'Before / After', 'Logo Animations']

// prop accessors (no `any`)
const str = (p: Props, k: string, d = '') => (typeof p[k] === 'string' ? (p[k] as string) : d)
const num = (p: Props, k: string, d = 0) => (typeof p[k] === 'number' ? (p[k] as number) : d)
const arr = (p: Props, k: string) => (Array.isArray(p[k]) ? (p[k] as string[]) : [])

let counter = 0
const id = () => nanoid(6) + ++counter
const ph = (s: string, w = 600, h = 600) => `https://picsum.photos/seed/${s}/${w}/${h}`

function mkGroup(
  doc: SceneDoc, blockId: string, name: string, baseW: number, baseH: number,
  children: Layer[], props: Props,
): GroupLayer {
  return {
    id: id(), name, type: 'group',
    x: Math.round((doc.width - baseW) / 2), y: Math.round((doc.height - baseH) / 2),
    width: baseW, height: baseH, baseWidth: baseW, baseHeight: baseH,
    rotation: 0, opacity: 1, startFrame: 0, endFrame: doc.durationInFrames,
    children, blockId, props,
  }
}

/** Optionally override all children's entrance from the Effects tab. */
function applyEffect(children: Layer[], effect: string): Layer[] {
  if (!effect || effect === 'default') return children
  return children.map((c, i) => ({
    ...c,
    anim: { ...c.anim, enter: { preset: effect as EnterPreset, duration: 14 } },
    startFrame: Math.min(c.endFrame - 1, i * 5),
  }))
}

export const BLOCKS: BlockDef[] = [
  // ── Product Fan (flagship parametric block) ───────────────────────────────
  {
    id: 'product-fan',
    name: 'Product Fan',
    category: 'Product Showcase',
    accent: '#ff5b7f',
    defaultProps: { images: [ph('fanA'), ph('fanB'), ph('fanC')], spread: 12, scaleDown: 79, effect: 'default' },
    controls: [
      { type: 'images', key: 'images', label: 'Select up to 20 cutout images', max: 20 },
      { type: 'slider', key: 'spread', label: 'Spread', min: 0, max: 30, step: 1 },
      { type: 'slider', key: 'scaleDown', label: 'Scale Down Items', min: 30, max: 100, step: 1 },
    ],
    build: (doc, props) => {
      const W = 800, H = 1000
      const imgs = arr(props, 'images').length ? arr(props, 'images') : [ph('fanA')]
      const spread = num(props, 'spread', 12)
      const scale = num(props, 'scaleDown', 79) / 100
      const n = imgs.length
      const mid = (n - 1) / 2
      const iw = 460 * scale, ih = 620 * scale
      const children: Layer[] = imgs.map((src, i) => ({
        id: id(), name: `Item ${i + 1}`, type: 'image',
        x: W / 2 - iw / 2 + (i - mid) * 60, y: H / 2 - ih / 2,
        width: iw, height: ih, rotation: (i - mid) * spread, opacity: 1,
        startFrame: i * 5, endFrame: doc.durationInFrames,
        src, fit: 'contain', radius: 12,
        // fan OUT: each item starts stacked at center (unrotated) and eases to its place with overshoot
        anim: {
          enter: { preset: 'none', duration: 20, easing: 'back' },
          from: { x: W / 2 - iw / 2, rotation: 0, opacity: 0, scale: 0.6 },
        },
      }))
      return mkGroup(doc, 'product-fan', 'Product Fan', W, H, applyEffect(children, str(props, 'effect', 'default')), props)
    },
  },

  // ── Product Showcase ──────────────────────────────────────────────────────
  {
    id: 'product-showcase',
    name: 'Product Showcase',
    category: 'Product Showcase',
    accent: '#ff8a3d',
    defaultProps: { images: [ph('showcase')], label: 'NEW ARRIVAL', effect: 'default' },
    controls: [
      { type: 'images', key: 'images', label: 'Product image', max: 1 },
      { type: 'text', key: 'label', label: 'Label' },
    ],
    build: (doc, props) => {
      const img = arr(props, 'images')[0] || ph('showcase')
      const children: Layer[] = [
        { id: id(), name: 'Backdrop', type: 'shape', x: 20, y: 120, width: 720, height: 760, rotation: 0, opacity: 1, startFrame: 0, endFrame: doc.durationInFrames, shape: 'rect', fill: '#ff5b7f', radius: 48, anim: { enter: { preset: 'scaleIn', duration: 14 } } },
        { id: id(), name: 'Product', type: 'image', x: 120, y: 220, width: 520, height: 520, rotation: 0, opacity: 1, startFrame: 6, endFrame: doc.durationInFrames, src: img, fit: 'cover', radius: 24, anim: { enter: { preset: 'pop', duration: 16 } } },
        { id: id(), name: 'Label', type: 'text', x: 20, y: 800, width: 720, height: 90, rotation: 0, opacity: 1, startFrame: 14, endFrame: doc.durationInFrames, text: str(props, 'label', 'NEW ARRIVAL'), fontSize: 54, fontWeight: 900, color: '#ffffff', align: 'center', lineHeight: 1, fontFamily: 'Inter, sans-serif', anim: { enter: { preset: 'slideUp', duration: 16 } } },
      ]
      return mkGroup(doc, 'product-showcase', 'Product Showcase', 760, 1000, applyEffect(children, str(props, 'effect', 'default')), props)
    },
  },

  // ── Carousel ──────────────────────────────────────────────────────────────
  {
    id: 'carousel',
    name: 'Carousel',
    category: 'Carousels',
    accent: '#4d7cfe',
    defaultProps: { images: [ph('carA', 720, 1000), ph('carB', 720, 1000), ph('carC', 720, 1000)], effect: 'default' },
    controls: [{ type: 'images', key: 'images', label: 'Slides (shown in order)', max: 8 }],
    build: (doc, props) => {
      const W = 720, H = 1000
      const imgs = arr(props, 'images').length ? arr(props, 'images') : [ph('carA', W, H)]
      const span = Math.max(30, Math.floor(doc.durationInFrames / imgs.length))
      const children: Layer[] = imgs.map((src, i) => ({
        id: id(), name: `Slide ${i + 1}`, type: 'image', x: 0, y: 0, width: W, height: H, rotation: 0, opacity: 1,
        startFrame: i === 0 ? 0 : i * span - 8,
        endFrame: i === imgs.length - 1 ? doc.durationInFrames : (i + 1) * span + 4,
        src, fit: 'cover', radius: 28,
        anim: { enter: { preset: 'slideLeft', duration: 12 }, exit: { preset: 'slideLeft', duration: 12 } },
      }))
      return mkGroup(doc, 'carousel', 'Carousel', W, H, children, props)
    },
  },

  // ── Before / After ────────────────────────────────────────────────────────
  {
    id: 'before-after',
    name: 'Before / After',
    category: 'Before / After',
    accent: '#1fb6a6',
    defaultProps: { images: [ph('beforeImg', 420, 1000), ph('afterImg', 420, 1000)], effect: 'default' },
    controls: [{ type: 'images', key: 'images', label: 'Before & After (2 images)', max: 2 }],
    build: (doc, props) => {
      const imgs = arr(props, 'images')
      const before = imgs[0] || ph('beforeImg', 420, 1000)
      const after = imgs[1] || ph('afterImg', 420, 1000)
      const children: Layer[] = [
        { id: id(), name: 'Before', type: 'image', x: 0, y: 0, width: 410, height: 1000, rotation: 0, opacity: 1, startFrame: 0, endFrame: doc.durationInFrames, src: before, fit: 'cover', radius: 0, anim: { enter: { preset: 'fade', duration: 10 } } },
        { id: id(), name: 'After', type: 'image', x: 410, y: 0, width: 410, height: 1000, rotation: 0, opacity: 1, startFrame: 10, endFrame: doc.durationInFrames, src: after, fit: 'cover', radius: 0, anim: { enter: { preset: 'slideLeft', duration: 18 } } },
        { id: id(), name: 'Divider', type: 'shape', x: 402, y: 0, width: 16, height: 1000, rotation: 0, opacity: 1, startFrame: 0, endFrame: doc.durationInFrames, shape: 'rect', fill: '#ffffff', radius: 0, anim: { enter: { preset: 'fade', duration: 8 } } },
        { id: id(), name: 'Before label', type: 'text', x: 0, y: 40, width: 410, height: 70, rotation: 0, opacity: 1, startFrame: 4, endFrame: doc.durationInFrames, text: 'BEFORE', fontSize: 44, fontWeight: 900, color: '#ffffff', align: 'center', lineHeight: 1, fontFamily: 'Inter, sans-serif', anim: { enter: { preset: 'fade', duration: 10 } } },
        { id: id(), name: 'After label', type: 'text', x: 410, y: 40, width: 410, height: 70, rotation: 0, opacity: 1, startFrame: 22, endFrame: doc.durationInFrames, text: 'AFTER', fontSize: 44, fontWeight: 900, color: '#ffffff', align: 'center', lineHeight: 1, fontFamily: 'Inter, sans-serif', anim: { enter: { preset: 'slideUp', duration: 12 } } },
      ]
      return mkGroup(doc, 'before-after', 'Before / After', 820, 1000, children, props)
    },
  },

  // ── Logo Reveal ───────────────────────────────────────────────────────────
  {
    id: 'logo-reveal',
    name: 'Logo Reveal',
    category: 'Logo Animations',
    accent: '#8b6cf6',
    defaultProps: { logoText: 'S', brand: 'YOUR BRAND', tagline: 'your tagline goes here', effect: 'default' },
    controls: [
      { type: 'text', key: 'logoText', label: 'Logo letter' },
      { type: 'text', key: 'brand', label: 'Brand name' },
      { type: 'text', key: 'tagline', label: 'Tagline' },
    ],
    build: (doc, props) => {
      const children: Layer[] = [
        { id: id(), name: 'Logo mark', type: 'shape', x: 260, y: 20, width: 200, height: 200, rotation: 0, opacity: 1, startFrame: 0, endFrame: doc.durationInFrames, shape: 'ellipse', fill: '#8b6cf6', radius: 0, anim: { enter: { preset: 'pop', duration: 16 } } },
        { id: id(), name: 'Logo letter', type: 'text', x: 260, y: 58, width: 200, height: 140, rotation: 0, opacity: 1, startFrame: 4, endFrame: doc.durationInFrames, text: str(props, 'logoText', 'S'), fontSize: 130, fontWeight: 900, color: '#ffffff', align: 'center', lineHeight: 1, fontFamily: 'Inter, sans-serif', anim: { enter: { preset: 'pop', duration: 16 } } },
        { id: id(), name: 'Brand', type: 'text', x: 20, y: 270, width: 680, height: 100, rotation: 0, opacity: 1, startFrame: 12, endFrame: doc.durationInFrames, text: str(props, 'brand', 'YOUR BRAND'), fontSize: 76, fontWeight: 900, color: '#ffffff', align: 'center', lineHeight: 1, fontFamily: 'Inter, sans-serif', anim: { enter: { preset: 'slideUp', duration: 16 } } },
        { id: id(), name: 'Tagline', type: 'text', x: 20, y: 390, width: 680, height: 60, rotation: 0, opacity: 1, startFrame: 22, endFrame: doc.durationInFrames, text: str(props, 'tagline', 'your tagline goes here'), fontSize: 34, fontWeight: 500, color: '#ffffff', align: 'center', lineHeight: 1.2, fontFamily: 'Inter, sans-serif', anim: { enter: { preset: 'fade', duration: 16 } } },
      ]
      return mkGroup(doc, 'logo-reveal', 'Logo Reveal', 720, 520, applyEffect(children, str(props, 'effect', 'default')), props)
    },
  },
]

export function getBlockDef(id?: string) {
  return BLOCKS.find((b) => b.id === id)
}

// ── primitives (top row of the Blocks panel) ──────────────────────────────────
export type PrimitiveKind = 'rect' | 'ellipse' | 'triangle' | 'star' | 'line'

export function makePrimitive(kind: PrimitiveKind, doc: SceneDoc): Layer {
  const cx = doc.width / 2
  const cy = doc.height / 2
  const size = 360
  return {
    id: id(), name: kind[0].toUpperCase() + kind.slice(1), type: 'shape',
    x: cx - size / 2, y: kind === 'line' ? cy - 8 : cy - size / 2,
    width: size, height: kind === 'line' ? 16 : size,
    rotation: 0, opacity: 1, startFrame: 0, endFrame: doc.durationInFrames,
    shape: kind, fill: '#ff5b7f', radius: kind === 'rect' ? 24 : 0,
    anim: { enter: { preset: 'fade', duration: 10 } },
  }
}
