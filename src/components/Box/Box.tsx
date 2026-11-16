import type { CSSProperties, ReactNode } from 'react'
import { ErrorBoundary } from '../ErrorBoundary/ErrorBoundary'
import { Icon } from '../Icon/Icon'
import styles from './Box.module.css'

export type Accent = 'green' | 'pink' | 'orange' | 'teal'

export interface BoxAction {
  label: string
  onClick?: () => void
  /** Cor do botão (padrão: mesma do accent) */
  color?: Accent
}

export interface BoxSearch {
  placeholder?: string
  value?: string
  onChange?: (value: string) => void
  onSubmit?: (value: string) => void
}

export interface BoxProps {
  title: ReactNode
  /**
   * light = card claro com header cinza-azulado (coluna principal)
   * dark  = card verde-petróleo (coluna lateral)
   * bare  = sem moldura (usado dentro do painel da rádio)
   */
  variant?: 'light' | 'dark' | 'bare'
  /** Cor da barrinha do título, do botão atualizar e da lupa */
  accent?: Accent
  /** Faixa colorida à esquerda com ícone (Novos emblemas / Habbo imager) */
  sideStrip?: { color: Accent; icon?: ReactNode }
  primaryAction?: BoxAction
  search?: BoxSearch
  onRefresh?: () => void
  onPrev?: () => void
  onNext?: () => void
  prevDisabled?: boolean
  nextDisabled?: boolean
  hideRefresh?: boolean
  hideNav?: boolean
  /** Conteúdo fixo no rodapé do box (ex.: botão "Ver todos") */
  footer?: ReactNode
  /** Altura mínima do corpo enquanto estiver vazio */
  minBodyHeight?: number
  /** Mostra o tracejado "Slot do painel" quando não há children */
  showSlot?: boolean
  className?: string
  id?: string
  children?: ReactNode
}

export function Box({
  title,
  variant = 'light',
  accent = 'green',
  sideStrip,
  primaryAction,
  search,
  onRefresh,
  onPrev,
  onNext,
  prevDisabled = true,
  nextDisabled = false,
  hideRefresh,
  hideNav,
  footer,
  minBodyHeight = 160,
  showSlot = true,
  className,
  id,
  children,
}: BoxProps) {
  const rootClass = [
    styles.box,
    styles[variant],
    styles[`accent_${accent}`],
    sideStrip ? styles.withStrip : '',
    className ?? '',
  ].join(' ')

  const searchForm = search && (
    <form
      className={styles.search}
      role="search"
      onSubmit={(e) => {
        e.preventDefault()
        const value = new FormData(e.currentTarget).get('q')
        search.onSubmit?.(String(value ?? ''))
      }}
    >
      <button type="submit" className={`${styles.btn} ${styles.searchBtn}`} aria-label="Pesquisar">
        <Icon name="search" size={18} />
      </button>
      <input
        name="q"
        type="search"
        placeholder={search.placeholder ?? 'Pesquisar...'}
        value={search.value}
        onChange={search.onChange ? (e) => search.onChange?.(e.target.value) : undefined}
      />
    </form>
  )

  const primaryButton = primaryAction && (
    <button
      type="button"
      className={`${styles.btn} ${styles.primary} ${styles[`c_${primaryAction.color ?? accent}`]}`}
      onClick={primaryAction.onClick}
    >
      {primaryAction.label}
    </button>
  )

  // ordem do layout: ação principal → busca → atualizar → anterior/próximo
  const buttons = (
    <>
      {!hideRefresh && (
        <button type="button" className={`${styles.btn} ${styles.square}`} onClick={onRefresh} aria-label="Atualizar">
          <Icon name="refresh" size={18} />
        </button>
      )}
      {!hideNav && (
        <>
          <button
            type="button"
            className={`${styles.btn} ${styles.nav}`}
            onClick={onPrev}
            disabled={prevDisabled}
            aria-label="Anterior"
          >
            <Icon name="prev" size={20} />
          </button>
          <button
            type="button"
            className={`${styles.btn} ${styles.nav}`}
            onClick={onNext}
            disabled={nextDisabled}
            aria-label="Próximo"
          >
            <Icon name="next" size={20} />
          </button>
        </>
      )}
    </>
  )

  const searchBelow = variant === 'dark'
  const hasButtons = primaryAction || !hideRefresh || !hideNav

  return (
    <section id={id} className={rootClass}>
      {sideStrip && (
        <div className={`${styles.strip} ${styles[`strip_${sideStrip.color}`]}`}>{sideStrip.icon}</div>
      )}

      <div className={styles.inner}>
        <header className={styles.header}>
          <h2 className={styles.title}>{title}</h2>

          {sideStrip ? (
            <div className={styles.actions}>
              {searchForm && <div className={styles.pillGroup}>{searchForm}</div>}
              {hasButtons && (
                <div className={styles.pillGroup}>
                  {primaryButton}
                  {buttons}
                </div>
              )}
            </div>
          ) : (
            <div className={styles.actions}>
              {primaryButton}
              {!searchBelow && searchForm}
              {buttons}
            </div>
          )}
        </header>

        {searchBelow && searchForm && <div className={styles.searchRow}>{searchForm}</div>}

        <div className={styles.body} style={{ '--min-body': `${minBodyHeight}px` } as CSSProperties}>
          <ErrorBoundary>{children ?? (showSlot && <div className={styles.slot}>Slot do painel</div>)}</ErrorBoundary>
        </div>

        {footer && <div className={styles.footer}>{footer}</div>}
      </div>
    </section>
  )
}
