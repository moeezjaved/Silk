import { nanoid } from 'nanoid'
import { GroupLayer, Layer, SceneDoc } from './doc'

/**
 * A BlockDef is the recipe for a composite block. build() instantiates it as
 * an animated GroupLayer (children laid out in the group's local coordinate
 * space). Built-in blocks live here; user "Save Block" entries will later be
 * stored in Supabase with the same shape.
 */
export interface BlockDef {
  id: string
  name: string
  category: string
  accent: string // thumbnail accent colour
  build: (doc: SceneDoc) => GroupLayer
}

export const BLOCK_CATEGORIES = [
  'Product Showcase',
  'Carousels',
  'Before / After',
  'Logo Animations',
]

let n = 0
const id = () => nanoid(8) + ++n

function group(
  doc: SceneDoc,
  blockId: string,
  name: string,
  baseW: number,
  baseH: number,
  children: Layer[],
): GroupLayer {
  return {
    id: id(),
    name,
    type: 'group',
    x: Math.round((doc.width - baseW) / 2),
    y: Math.round((doc.height - baseH) / 2),
    width: baseW,
    height: baseH,
    baseWidth: baseW,
    baseHeight: baseH,
    rotation: 0,
    opacity: 1,
    startFrame: 0,
    endFrame: doc.durationInFrames,
    children,
    blockId,
  }
}

const seed = (s: string, w = 700, h = 900) => `https://picsum.photos/seed/${s}/${w}/${h}`

export const BLOCKS: BlockDef[] = [
  // ── Product Showcase ──────────────────────────────────────────────────────
  {
    id: 'product-showcase',
    name: 'Product Showcase',
    category: 'Product Showcase',
    accent: '#ff5b7f',
    build: (doc) =>
      group(doc, 'product-showcase', 'Product Showcase', 760, 1000, [
        {
          id: id(), name: 'Backdrop', type: 'shape', x: 20, y: 120, width: 720, height: 760,
          rotation: 0, opacity: 1, startFrame: 0, endFrame: doc.durationInFrames,
          shape: 'rect', fill: '#ff5b7f', radius: 48, anim: { enter: { preset: 'scaleIn', duration: 14 } },
        },
        {
          id: id(), name: 'Product', type: 'image', x: 120, y: 220, width: 520, height: 520,
          rotation: 0, opacity: 1, startFrame: 6, endFrame: doc.durationInFrames,
          src: seed('product', 600, 600), fit: 'cover', radius: 24,
          anim: { enter: { preset: 'pop', duration: 16 } },
        },
        {
          id: id(), name: 'Label', type: 'text', x: 20, y: 800, width: 720, height: 90,
          rotation: 0, opacity: 1, startFrame: 14, endFrame: doc.durationInFrames,
          text: 'NEW ARRIVAL', fontSize: 54, fontWeight: 900, color: '#ffffff',
          align: 'center', lineHeight: 1, fontFamily: 'Inter, sans-serif',
          anim: { enter: { preset: 'slideUp', duration: 16 } },
        },
      ]),
  },

  // ── Carousel / Slideshow ──────────────────────────────────────────────────
  {
    id: 'carousel',
    name: 'Carousel',
    category: 'Carousels',
    accent: '#4d7cfe',
    build: (doc) => {
      const W = 720, H = 1000
      const slides = ['carouselA', 'carouselB', 'carouselC']
      const span = Math.max(40, Math.floor(doc.durationInFrames / slides.length))
      const children: Layer[] = slides.map((s, i) => ({
        id: id(), name: `Slide ${i + 1}`, type: 'image', x: 0, y: 0, width: W, height: H,
        rotation: 0, opacity: 1,
        startFrame: i === 0 ? 0 : i * span - 8,
        endFrame: i === slides.length - 1 ? doc.durationInFrames : (i + 1) * span + 4,
        src: seed(s, W, H), fit: 'cover', radius: 28,
        anim: { enter: { preset: 'slideLeft', duration: 12 }, exit: { preset: 'slideLeft', duration: 12 } },
      }))
      return group(doc, 'carousel', 'Carousel', W, H, children)
    },
  },

  // ── Before / After ────────────────────────────────────────────────────────
  {
    id: 'before-after',
    name: 'Before / After',
    category: 'Before / After',
    accent: '#1fb6a6',
    build: (doc) =>
      group(doc, 'before-after', 'Before / After', 820, 1000, [
        {
          id: id(), name: 'Before', type: 'image', x: 0, y: 0, width: 410, height: 1000,
          rotation: 0, opacity: 1, startFrame: 0, endFrame: doc.durationInFrames,
          src: seed('before', 420, 1000), fit: 'cover', radius: 0,
          anim: { enter: { preset: 'fade', duration: 10 } },
        },
        {
          id: id(), name: 'After', type: 'image', x: 410, y: 0, width: 410, height: 1000,
          rotation: 0, opacity: 1, startFrame: 10, endFrame: doc.durationInFrames,
          src: seed('after', 420, 1000), fit: 'cover', radius: 0,
          anim: { enter: { preset: 'slideLeft', duration: 18 } },
        },
        {
          id: id(), name: 'Divider', type: 'shape', x: 402, y: 0, width: 16, height: 1000,
          rotation: 0, opacity: 1, startFrame: 0, endFrame: doc.durationInFrames,
          shape: 'rect', fill: '#ffffff', radius: 0, anim: { enter: { preset: 'fade', duration: 8 } },
        },
        {
          id: id(), name: 'Before label', type: 'text', x: 0, y: 40, width: 410, height: 70,
          rotation: 0, opacity: 1, startFrame: 4, endFrame: doc.durationInFrames,
          text: 'BEFORE', fontSize: 44, fontWeight: 900, color: '#ffffff', align: 'center',
          lineHeight: 1, fontFamily: 'Inter, sans-serif', anim: { enter: { preset: 'fade', duration: 10 } },
        },
        {
          id: id(), name: 'After label', type: 'text', x: 410, y: 40, width: 410, height: 70,
          rotation: 0, opacity: 1, startFrame: 22, endFrame: doc.durationInFrames,
          text: 'AFTER', fontSize: 44, fontWeight: 900, color: '#ffffff', align: 'center',
          lineHeight: 1, fontFamily: 'Inter, sans-serif', anim: { enter: { preset: 'slideUp', duration: 12 } },
        },
      ]),
  },

  // ── Logo Animation ────────────────────────────────────────────────────────
  {
    id: 'logo-reveal',
    name: 'Logo Reveal',
    category: 'Logo Animations',
    accent: '#8b6cf6',
    build: (doc) =>
      group(doc, 'logo-reveal', 'Logo Reveal', 720, 520, [
        {
          id: id(), name: 'Logo mark', type: 'shape', x: 260, y: 20, width: 200, height: 200,
          rotation: 0, opacity: 1, startFrame: 0, endFrame: doc.durationInFrames,
          shape: 'ellipse', fill: '#8b6cf6', radius: 0, anim: { enter: { preset: 'pop', duration: 16 } },
        },
        {
          id: id(), name: 'Logo letter', type: 'text', x: 260, y: 58, width: 200, height: 140,
          rotation: 0, opacity: 1, startFrame: 4, endFrame: doc.durationInFrames,
          text: 'S', fontSize: 130, fontWeight: 900, color: '#ffffff', align: 'center',
          lineHeight: 1, fontFamily: 'Inter, sans-serif', anim: { enter: { preset: 'pop', duration: 16 } },
        },
        {
          id: id(), name: 'Brand', type: 'text', x: 20, y: 270, width: 680, height: 100,
          rotation: 0, opacity: 1, startFrame: 12, endFrame: doc.durationInFrames,
          text: 'YOUR BRAND', fontSize: 76, fontWeight: 900, color: '#ffffff', align: 'center',
          lineHeight: 1, fontFamily: 'Inter, sans-serif', anim: { enter: { preset: 'slideUp', duration: 16 } },
        },
        {
          id: id(), name: 'Tagline', type: 'text', x: 20, y: 390, width: 680, height: 60,
          rotation: 0, opacity: 1, startFrame: 22, endFrame: doc.durationInFrames,
          text: 'your tagline goes here', fontSize: 34, fontWeight: 500, color: '#ffffff', align: 'center',
          lineHeight: 1.2, fontFamily: 'Inter, sans-serif', anim: { enter: { preset: 'fade', duration: 16 } },
        },
      ]),
  },
]

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
