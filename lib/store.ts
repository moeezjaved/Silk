'use client'

import { create } from 'zustand'
import { nanoid } from 'nanoid'
import { FORMATS, Layer, LayerType, SceneDoc, emptyDoc } from './doc'

interface EditorState {
  doc: SceneDoc
  selectedId: string | null
  currentFrame: number
  playing: boolean

  // selection / playback
  select: (id: string | null) => void
  setFrame: (frame: number) => void
  setPlaying: (playing: boolean) => void

  // document ops
  loadDoc: (doc: SceneDoc) => void
  rename: (name: string) => void
  setFormat: (format: keyof typeof FORMATS) => void
  setDuration: (frames: number) => void
  addLayer: (type: LayerType) => void
  addLayerFrom: (layer: Layer) => void
  updateLayer: (id: string, patch: Partial<Layer>) => void
  removeLayer: (id: string) => void
  reorder: (id: string, dir: 'up' | 'down') => void
}

function makeLayer(type: LayerType, doc: SceneDoc): Layer {
  const base = {
    id: nanoid(8),
    name: type[0].toUpperCase() + type.slice(1),
    type,
    rotation: 0,
    opacity: 1,
    startFrame: 0,
    endFrame: doc.durationInFrames,
    anim: { enter: { preset: 'fade' as const, duration: 10 } },
  }
  const cx = doc.width / 2
  const cy = doc.height / 2
  switch (type) {
    case 'text':
      return {
        ...base,
        type: 'text',
        x: cx - 400,
        y: cy - 90,
        width: 800,
        height: 180,
        text: 'Your headline',
        fontSize: 110,
        fontWeight: 800,
        color: '#ffffff',
        align: 'center',
        lineHeight: 1.05,
        fontFamily: 'Inter, sans-serif',
      }
    case 'shape':
      return {
        ...base,
        type: 'shape',
        x: cx - 250,
        y: cy - 250,
        width: 500,
        height: 500,
        shape: 'rect',
        fill: '#ff5b7f',
        radius: 32,
      }
    case 'image':
      return {
        ...base,
        type: 'image',
        x: cx - 300,
        y: cy - 300,
        width: 600,
        height: 600,
        src: 'https://picsum.photos/seed/silk/800/800',
        fit: 'cover',
        radius: 24,
      }
    case 'video':
      return {
        ...base,
        type: 'video',
        x: cx - 360,
        y: cy - 640,
        width: 720,
        height: 1280,
        src: '',
        fit: 'cover',
        radius: 24,
      }
    default:
      // groups are inserted via addLayerFrom (block instancing), not makeLayer
      throw new Error(`makeLayer: unsupported type ${type}`)
  }
}

export const useEditor = create<EditorState>((set, get) => ({
  doc: emptyDoc('story'),
  selectedId: null,
  currentFrame: 0,
  playing: false,

  select: (id) => set({ selectedId: id }),
  setFrame: (frame) => {
    const max = get().doc.durationInFrames
    set({ currentFrame: Math.max(0, Math.min(max, frame)) })
  },
  setPlaying: (playing) => set({ playing }),

  loadDoc: (doc) => set({ doc, selectedId: null, currentFrame: 0, playing: false }),

  rename: (name) => set((s) => ({ doc: { ...s.doc, name } })),

  setFormat: (format) =>
    set((s) => ({ doc: { ...s.doc, width: FORMATS[format].width, height: FORMATS[format].height } })),

  setDuration: (frames) =>
    set((s) => ({ doc: { ...s.doc, durationInFrames: Math.max(30, Math.round(frames)) } })),

  addLayer: (type) =>
    set((s) => {
      const layer = makeLayer(type, s.doc)
      return { doc: { ...s.doc, layers: [...s.doc.layers, layer] }, selectedId: layer.id }
    }),

  addLayerFrom: (layer) =>
    set((s) => ({ doc: { ...s.doc, layers: [...s.doc.layers, layer] }, selectedId: layer.id })),

  updateLayer: (id, patch) =>
    set((s) => ({
      doc: {
        ...s.doc,
        layers: s.doc.layers.map((l) => (l.id === id ? ({ ...l, ...patch } as Layer) : l)),
      },
    })),

  removeLayer: (id) =>
    set((s) => ({
      doc: { ...s.doc, layers: s.doc.layers.filter((l) => l.id !== id) },
      selectedId: s.selectedId === id ? null : s.selectedId,
    })),

  reorder: (id, dir) =>
    set((s) => {
      const layers = [...s.doc.layers]
      const i = layers.findIndex((l) => l.id === id)
      if (i < 0) return s
      const j = dir === 'up' ? i + 1 : i - 1
      if (j < 0 || j >= layers.length) return s
      ;[layers[i], layers[j]] = [layers[j], layers[i]]
      return { doc: { ...s.doc, layers } }
    }),
}))
