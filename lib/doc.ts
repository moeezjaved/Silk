// ─────────────────────────────────────────────────────────────────────────────
// Silk scene-document model.
// One JSON document describes an entire video: canvas, timeline, and layers.
// The same document is consumed by the editor surface, the preview player,
// and (later) the server-side MP4 renderer. A template is just a document
// flagged is_template; "use template" duplicates the document.
// ─────────────────────────────────────────────────────────────────────────────

export type LayerType = 'text' | 'image' | 'video' | 'shape' | 'group'

// ── animation ────────────────────────────────────────────────────────────────
export type Easing = 'linear' | 'easeIn' | 'easeOut' | 'easeInOut' | 'back'

export type EnterPreset =
  | 'none' | 'fade' | 'slideUp' | 'slideDown' | 'slideLeft' | 'slideRight' | 'pop' | 'scaleIn'
export type ExitPreset =
  | 'none' | 'fade' | 'slideUp' | 'slideDown' | 'slideLeft' | 'slideRight' | 'scaleOut'

/** Absolute start values an entrance animates FROM (→ the layer's rest values). */
export interface AnimFrom {
  x?: number
  y?: number
  rotation?: number
  scale?: number
  opacity?: number
}

export interface LayerAnim {
  enter?: { preset: EnterPreset; duration: number; easing?: Easing }
  exit?: { preset: ExitPreset; duration: number; easing?: Easing }
  from?: AnimFrom // custom entrance: interpolate these start values to rest over enter.duration
}

/** Properties every layer shares. Position/size are in document pixels. */
export interface BaseLayer {
  id: string
  name: string
  type: LayerType
  x: number
  y: number
  width: number
  height: number
  rotation: number // degrees
  opacity: number // 0..1
  startFrame: number // first frame the layer is visible
  endFrame: number // last frame the layer is visible (inclusive)
  anim?: LayerAnim // enter/exit motion
}

export interface TextLayer extends BaseLayer {
  type: 'text'
  text: string
  fontSize: number
  fontWeight: number
  color: string
  align: 'left' | 'center' | 'right'
  lineHeight: number
  fontFamily: string
}

export interface ImageLayer extends BaseLayer {
  type: 'image'
  src: string
  fit: 'cover' | 'contain'
  radius: number
}

export interface VideoLayer extends BaseLayer {
  type: 'video'
  src: string
  fit: 'cover' | 'contain'
  radius: number
}

export interface ShapeLayer extends BaseLayer {
  type: 'shape'
  shape: 'rect' | 'ellipse' | 'triangle' | 'star' | 'line'
  fill: string
  radius: number
}

/**
 * A group is a reusable, positionable container of child layers — the unit a
 * "block" is made of. Children are laid out in the group's intrinsic
 * coordinate space (baseWidth × baseHeight) and scaled to the group's current
 * width/height, so resizing a block scales its contents.
 */
export interface GroupLayer extends BaseLayer {
  type: 'group'
  baseWidth: number
  baseHeight: number
  children: Layer[]
  blockId?: string // which BlockDef produced it (for re-instancing / Save Block)
  props?: Record<string, unknown> // editable slot values (images, text, params)
}

export type Layer = TextLayer | ImageLayer | VideoLayer | ShapeLayer | GroupLayer

export interface SceneDoc {
  id: string
  name: string
  width: number
  height: number
  fps: number
  durationInFrames: number
  background: string
  layers: Layer[] // index = z-order, last on top
}

// ── helpers ──────────────────────────────────────────────────────────────────

export const FORMATS = {
  story: { width: 1080, height: 1920, label: 'Story / Reel 9:16' },
  square: { width: 1080, height: 1080, label: 'Square 1:1' },
  landscape: { width: 1920, height: 1080, label: 'Landscape 16:9' },
} as const

/** A layer is visible at a given frame when inside its [start,end] range. */
export function isLayerVisible(layer: Layer, frame: number): boolean {
  return frame >= layer.startFrame && frame <= layer.endFrame
}

export function emptyDoc(format: keyof typeof FORMATS = 'story'): SceneDoc {
  const { width, height } = FORMATS[format]
  return {
    id: 'untitled',
    name: 'Untitled',
    width,
    height,
    fps: 30,
    durationInFrames: 150, // 5s @ 30fps
    background: '#101015',
    layers: [],
  }
}
