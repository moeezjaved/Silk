'use client'

import { Layer, isLayerVisible } from '@/lib/doc'
import { resolveAnim } from '@/lib/anim'

/**
 * Pure presentation of a single layer at a given frame, including its
 * enter/exit animation. The same component draws the editor, preview, and
 * (later) the export, so what you see is what you render.
 */
export function LayerView({ layer, frame }: { layer: Layer; frame: number }) {
  const m = resolveAnim(layer, frame)

  const common: React.CSSProperties = {
    position: 'absolute',
    left: layer.x,
    top: layer.y,
    width: layer.width,
    height: layer.height,
    transform: `translate(${m.dx}px, ${m.dy}px) rotate(${layer.rotation}deg) scale(${m.scale})`,
    transformOrigin: 'center center',
    opacity: layer.opacity * m.opacityMul,
  }

  switch (layer.type) {
    case 'group': {
      const sx = layer.width / layer.baseWidth
      const sy = layer.height / layer.baseHeight
      return (
        <div
          style={{
            position: 'absolute',
            left: layer.x,
            top: layer.y,
            width: layer.baseWidth,
            height: layer.baseHeight,
            transform: `translate(${m.dx}px, ${m.dy}px) rotate(${layer.rotation}deg) scale(${sx * m.scale}, ${sy * m.scale})`,
            transformOrigin: 'top left',
            opacity: layer.opacity * m.opacityMul,
          }}
        >
          {layer.children.map((c) =>
            isLayerVisible(c, frame) ? <LayerView key={c.id} layer={c} frame={frame} /> : null,
          )}
        </div>
      )
    }

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

    case 'shape': {
      if (layer.shape === 'triangle' || layer.shape === 'star') {
        const path =
          layer.shape === 'triangle'
            ? 'M50 3 L97 97 L3 97 Z'
            : 'M50 3 L61 38 L98 38 L68 60 L79 96 L50 73 L21 96 L32 60 L2 38 L39 38 Z'
        return (
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ ...common, overflow: 'visible' }}>
            <path d={path} fill={layer.fill} />
          </svg>
        )
      }
      return (
        <div
          style={{
            ...common,
            background: layer.fill,
            borderRadius:
              layer.shape === 'ellipse' ? '50%' : layer.shape === 'line' ? layer.height / 2 : layer.radius,
          }}
        />
      )
    }

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
