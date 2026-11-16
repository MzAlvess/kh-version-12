import type { SVGProps } from 'react'

export type IconName =
  | 'refresh'
  | 'prev'
  | 'next'
  | 'search'
  | 'user'
  | 'mic'
  | 'star'
  | 'play'
  | 'pause'
  | 'volume'
  | 'music'
  | 'close'
  | 'check'
  | 'image'
  | 'alert'

const paths: Record<IconName, string> = {
  refresh:
    'M17.65 6.35A7.96 7.96 0 0 0 12 4a8 8 0 1 0 7.73 10h-2.08A6 6 0 1 1 12 6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z',
  prev: 'M15.4 7.4 14 6l-6 6 6 6 1.4-1.4L10.8 12z',
  next: 'M8.6 16.6 10 18l6-6-6-6-1.4 1.4 4.6 4.6z',
  search:
    'M15.5 14h-.8l-.3-.3A6.5 6.5 0 1 0 9.5 16a6.5 6.5 0 0 0 4.2-1.6l.3.3v.8l5 5 1.5-1.5-5-5zm-6 0a4.5 4.5 0 1 1 0-9 4.5 4.5 0 0 1 0 9z',
  user: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm0 2c-2.7 0-8 1.3-8 4v2h16v-2c0-2.7-5.3-4-8-4z',
  mic: 'M12 14a3 3 0 0 0 3-3V5a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3zm5.3-3a5.3 5.3 0 0 1-10.6 0H5a7 7 0 0 0 6 6.9V21h2v-3.1a7 7 0 0 0 6-6.9h-1.7z',
  star: 'M12 17.3 18.2 21l-1.6-7L22 9.2l-7.2-.6L12 2 9.2 8.6 2 9.2 7.5 14l-1.7 7z',
  play: 'M8 5v14l11-7z',
  pause: 'M6 19h4V5H6v14zm8-14v14h4V5h-4z',
  volume:
    'M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0 0 14 8v8a4.5 4.5 0 0 0 2.5-4zM14 3.2v2.1a7 7 0 0 1 0 13.4v2.1a9 9 0 0 0 0-17.6z',
  music: 'M12 3v10.6A4 4 0 1 0 14 17V7h4V3h-6z',
  close: 'M19 6.4 17.6 5 12 10.6 6.4 5 5 6.4 10.6 12 5 17.6 6.4 19 12 13.4 17.6 19 19 17.6 13.4 12z',
  check: 'M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z',
  image:
    'M21 19V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2zM8.5 13.5l2.5 3 3.5-4.5 4.5 6H5l3.5-4.5z',
  alert: 'M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z',
}

type Props = SVGProps<SVGSVGElement> & { name: IconName; size?: number }

export function Icon({ name, size = 16, ...rest }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...rest}>
      <path d={paths[name]} />
    </svg>
  )
}
