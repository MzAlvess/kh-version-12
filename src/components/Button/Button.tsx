import type { ButtonHTMLAttributes } from 'react'
import styles from './Button.module.css'

export type Tone = 'green' | 'pink' | 'orange' | 'teal' | 'yellow' | 'red' | 'purple' | 'cyan'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** cor do botão; "ghost" = estilo claro dos botões de navegação */
  tone?: Tone | 'ghost'
  loading?: boolean
}

/** Botão no padrão do layout: borda 1px, sombra inferior de 2px, raio 6px. */
export function Button({ tone = 'green', loading, disabled, className, children, type = 'button', ...rest }: ButtonProps) {
  const toneClass = tone === 'ghost' ? styles.ghost : `tone-${tone}`
  return (
    <button
      type={type}
      className={`${styles.btn} ${toneClass} ${loading ? styles.loading : ''} ${className ?? ''}`}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      <span className={styles.label}>{children}</span>
      {loading && <span className={styles.spinner} aria-hidden="true" />}
    </button>
  )
}
