import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react'
import styles from './Button.module.css'

export type Tone = 'green' | 'pink' | 'orange' | 'teal' | 'yellow' | 'red' | 'purple' | 'cyan'

interface CommonProps {
  /** cor do botão; "ghost" = estilo claro dos botões de navegação */
  tone?: Tone | 'ghost'
  loading?: boolean
  className?: string
  children?: ReactNode
}

type AsButton = CommonProps & Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof CommonProps> & { href?: never }
type AsLink = CommonProps & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof CommonProps> & { href: string }

/** Botão no padrão do layout: borda 1px, sombra inferior de 2px, raio 6px. Com `href` vira link. */
export function Button({ tone = 'green', loading, className, children, ...rest }: AsButton | AsLink) {
  const toneClass = tone === 'ghost' ? styles.ghost : `tone-${tone}`
  const cls = `${styles.btn} ${toneClass} ${loading ? styles.loading : ''} ${className ?? ''}`
  const label = <span className={styles.label}>{children}</span>

  if (typeof rest.href === 'string') {
    const anchor = rest as AnchorHTMLAttributes<HTMLAnchorElement>
    const external = /^https?:\/\//.test(rest.href)
    return (
      <a {...anchor} className={cls} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
        {label}
      </a>
    )
  }

  const { disabled, type = 'button', ...button } = rest as ButtonHTMLAttributes<HTMLButtonElement>
  return (
    <button {...button} type={type} className={cls} disabled={disabled || loading} aria-busy={loading || undefined}>
      {label}
      {loading && <span className={styles.spinner} aria-hidden="true" />}
    </button>
  )
}
