import type { CSSProperties } from 'react'

interface IsoTileProps {
  /** largura do losango (px) */
  width: number
  /** espessura da lateral (px) */
  thickness: number
  tone?: 'light' | 'dark' | 'gray'
  className?: string
  style?: CSSProperties
}

const tones = {
  light: { top: 'var(--tile-top)', left: 'var(--tile-left)', right: 'var(--tile-right)' },
  dark: { top: '#46717f', left: '#3c6472', right: '#345a67' },
  gray: { top: '#6b6f74', left: '#55595e', right: '#44474b' },
}

/** Piso isométrico (mesma geometria do layout: altura do losango = 45% da largura). */
export function IsoTile({ width: w, thickness: t, tone = 'light', className, style }: IsoTileProps) {
  const h = Math.round(w * 0.45)
  const c = tones[tone]
  return (
    <svg
      className={className}
      style={style}
      width={w}
      height={h + t}
      viewBox={`0 0 ${w} ${h + t}`}
      aria-hidden="true"
    >
      <polygon points={`0,${h / 2} ${w / 2},${h} ${w / 2},${h + t} 0,${h / 2 + t}`} fill={c.left} />
      <polygon points={`${w / 2},${h} ${w},${h / 2} ${w},${h / 2 + t} ${w / 2},${h + t}`} fill={c.right} />
      <polygon points={`${w / 2},0 ${w},${h / 2} ${w / 2},${h} 0,${h / 2}`} fill={c.top} />
    </svg>
  )
}
