import { SceneDoc } from './doc'

/**
 * Local template catalog. Later these move to Supabase (documents where
 * is_template = true); for now they seed the landing gallery + editor so the
 * full create→login→onboarding→editor flow works end to end.
 */
export interface TemplateMeta {
  id: string
  name: string
  category: string
  badge?: string
  bg: string
  accent: string
  headline: string
  sub: string
}

export const TEMPLATES: TemplateMeta[] = [
  { id: 'sale-30', name: 'Sitewide Sale', category: 'Sale', badge: 'NEW', bg: '#ffe14d', accent: '#15120e', headline: '30% OFF', sub: 'Sitewide sale · use code SILK' },
  { id: 'new-drop', name: 'New Drop', category: 'Apparel', badge: 'NEW', bg: '#1b1f4d', accent: '#ffffff', headline: 'THE NEW DROP', sub: 'Shop the collection' },
  { id: 'before-after', name: 'Before / After', category: 'Beauty', bg: '#ff9a9e', accent: '#15120e', headline: 'GLOW UP', sub: 'See the results' },
  { id: 'product-show', name: 'Product Showcase', category: 'Product', bg: '#1fb6a6', accent: '#ffffff', headline: 'MEET THE\nBESTSELLER', sub: 'Now back in stock' },
  { id: 'review', name: 'Customer Review', category: 'UGC', bg: '#ff8a3d', accent: '#15120e', headline: '"Obsessed."', sub: '★★★★★ — Verified buyer' },
  { id: 'feature', name: 'Feature Callout', category: 'Software', bg: '#7db4ff', accent: '#15120e', headline: 'FASTER.\nSIMPLER.', sub: 'Built for modern teams' },
  { id: 'launch', name: 'Big Launch', category: 'Press', bg: '#8b6cf6', accent: '#ffffff', headline: 'LAUNCH DAY', sub: "It's finally here" },
  { id: 'menu', name: 'Food Special', category: 'Food & Beverage', bg: '#1f8f4e', accent: '#ffffff', headline: 'FRESH DAILY', sub: 'Order now' },
]

export function getTemplateMeta(id: string): TemplateMeta | undefined {
  return TEMPLATES.find((t) => t.id === id)
}

/** Build an editable SceneDoc for a template (or the default starter). */
export function buildDoc(id?: string): SceneDoc {
  const t = (id && getTemplateMeta(id)) || TEMPLATES[0]
  return {
    id: t.id,
    name: t.name,
    width: 1080,
    height: 1920,
    fps: 30,
    durationInFrames: 150,
    background: t.bg,
    layers: [
      {
        id: 'bg-shape', name: 'Backdrop', type: 'shape',
        x: 90, y: 250, width: 900, height: 1100, rotation: -4, opacity: 1,
        startFrame: 0, endFrame: 150, shape: 'rect', fill: t.accent === '#ffffff' ? '#ffffff' : '#ff5b7f', radius: 48,
        anim: { enter: { preset: 'scaleIn', duration: 14 } },
      },
      {
        id: 'photo', name: 'Product photo', type: 'image',
        x: 240, y: 560, width: 600, height: 600, rotation: 0, opacity: 1,
        startFrame: 8, endFrame: 150, src: `https://picsum.photos/seed/${t.id}/800/800`, fit: 'cover', radius: 24,
        anim: { enter: { preset: 'pop', duration: 16 } },
      },
      {
        id: 'headline', name: 'Headline', type: 'text',
        x: 90, y: 300, width: 900, height: 240, rotation: 0, opacity: 1,
        startFrame: 14, endFrame: 150, text: t.headline, fontSize: 150, fontWeight: 900,
        color: t.accent, align: 'center', lineHeight: 1, fontFamily: 'Inter, sans-serif',
        anim: { enter: { preset: 'slideUp', duration: 16 } },
      },
      {
        id: 'sub', name: 'Subhead', type: 'text',
        x: 140, y: 1240, width: 800, height: 120, rotation: 0, opacity: 1,
        startFrame: 22, endFrame: 150, text: t.sub, fontSize: 46, fontWeight: 600,
        color: t.accent === '#15120e' ? '#15120e' : '#ffffff', align: 'center', lineHeight: 1.2, fontFamily: 'Inter, sans-serif',
        anim: { enter: { preset: 'fade', duration: 16 } },
      },
    ],
  }
}

/** @deprecated use buildDoc() */
export const starterTemplate = () => buildDoc('sale-30')
