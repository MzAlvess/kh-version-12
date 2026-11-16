import { useEffect, useId, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { Icon } from '../Icon/Icon'
import type { Tone } from '../Button/Button'
import styles from './Modal.module.css'

export interface ModalProps {
  title: ReactNode
  /** cor da barrinha do título (mesmo padrão das caixas) */
  tone?: Tone
  size?: 'sm' | 'md' | 'lg'
  onClose: () => void
  /** impede fechar (ex.: durante o envio) */
  locked?: boolean
  footer?: ReactNode
  children: ReactNode
}

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

export function Modal({ title, tone = 'green', size = 'md', onClose, locked, footer, children }: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const titleId = useId()

  // guarda as funções mais recentes sem reexecutar os efeitos
  const latest = useRef({ onClose, locked })
  useEffect(() => {
    latest.current = { onClose, locked }
  })

  // trava a rolagem da página, foca o primeiro campo e devolve o foco ao fechar
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null
    const { overflow } = document.body.style
    document.body.style.overflow = 'hidden'

    const dialog = dialogRef.current
    const firstField = dialog?.querySelector<HTMLElement>('input:not([type="hidden"]), select, textarea')
    ;(firstField ?? dialog)?.focus()

    return () => {
      document.body.style.overflow = overflow
      previous?.focus?.()
    }
  }, [])

  // ESC fecha; Tab fica preso dentro do modal
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !latest.current.locked) {
        e.preventDefault()
        latest.current.onClose()
      }
      if (e.key === 'Tab' && dialogRef.current) {
        const items = Array.from(dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE))
        if (!items.length) return
        const first = items[0]
        const last = items[items.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  return createPortal(
    <div
      className={styles.overlay}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !locked) onClose()
      }}
    >
      <div
        ref={dialogRef}
        className={`${styles.dialog} ${styles[size]} tone-${tone}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
      >
        <header className={styles.header}>
          <h2 id={titleId} className={styles.title}>
            {title}
          </h2>
          <button type="button" className={styles.close} onClick={onClose} disabled={locked} aria-label="Fechar">
            <Icon name="close" size={20} />
          </button>
        </header>

        <div className={styles.body}>{children}</div>

        {footer && <footer className={styles.footer}>{footer}</footer>}
      </div>
    </div>,
    document.body,
  )
}
