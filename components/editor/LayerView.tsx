'use client'

import { Layer } from '@/lib/doc'

/**
 * Pure presentation of a single layer at the current frame.
 * No editor logic here — this same component is what the export renderer
 * will draw, so the edited result and the final video stay identical.
 */
export function LayerView({ layer }: { layer: Layer }) {
  const common: React.CSSProperties = {
    position: 'absolute',
    left: layer.x,
    top: layer.y,
    width: layer.width,
    height: layer.height,
    transform: `rotate(${layer.rotation}deg)`,
    opacity: layer.opacity,
  }

  switch (layer.type) {
    case 'text':
      return (
        <div
          style={{
            ...common,
            display: 'flex',
            alignItems: 'center',
            justifyContent:
              layer.align === 'center' ? 'center' : layer.align === 'right' ? 'flex-end' : 'flex-start',
          }}
        >
          <div
            style={{
              width: '100%',
              color: layer.color,
              fontSize: layer.fontSize,
              fontWeight: layer.fontWeight,
              fontFamily: layer.fontFamily,
              textAlign: layer.align,
              lineHeight: layer.lineHeight,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}
          >
            {layer.text}
          </div>
        </div>
      )

    case 'shape':
      return (
        <div
          style={{
            ...common,
            background: layer.fill,
            borderRadius: layer.shape === 'ellipse' ? '50%' : layer.radius,
          }}
        />
      )

    case 'image':
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={layer.src}
          alt=""
          draggable={false}
          style={{ ...common, objectFit: layer.fit, borderRadius: layer.radius }}
        />
      )

    case 'video':
      return layer.src ? (
        <video
          src={layer.src}
          muted
          playsInline
          style={{ ...common, objectFit: layer.fit, borderRadius: layer.radius }}
        />
      ) : (
        <div
          style={{
            ...common,
            borderRadius: layer.radius,
            background: 'repeating-linear-gradient(45deg,#2a2a33,#2a2a33 12px,#23232b 12px,#23232b 24px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#7c7c8a',
            fontSize: 28,
            fontWeight: 600,
          }}
        >
          Video slot
        </div>
      )
  }
}
