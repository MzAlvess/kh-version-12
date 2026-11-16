import { type CSSProperties, type ReactNode } from 'react'
import { Box } from '../../components/Box/Box'
import { ErrorBoundary } from '../../components/ErrorBoundary/ErrorBoundary'
import { Icon } from '../../components/Icon/Icon'
import { IsoTile } from '../../components/IsoTile/IsoTile'
import { useRadioPlayer } from '../../hooks/useRadioPlayer'
import { useModal } from '../../modals/modalContext'
import { habboAvatar } from '../Header/menu'
import styles from './RadioPanel.module.css'

/** stream MP3 ao vivo da Kihabbo (o mesmo do site atual) */
export const DEFAULT_STREAM_URL = 'https://radio.kihabbo.com.br/'

export interface RadioPanelProps {
  locutor: string
  programa: string
  musica: string
  /** URL do stream MP3 (vem de /v1/player/status) */
  streamUrl?: string
  /** Avatar do locutor; padrão: habbo-imaging pelo nick */
  locutorAvatarUrl?: string
  onFavorite?: () => void
  onArrowClick?: () => void
  /** Slots preenchidos pelo backend */
  banner?: ReactNode
  /** caixa completa do TOP Eventos (ex.: <TopEventosBox />) */
  topEventos?: ReactNode
  habboStars?: ReactNode
  onVotarEnquete?: () => void
}

export function RadioPanel({
  locutor,
  programa,
  musica,
  streamUrl = DEFAULT_STREAM_URL,
  locutorAvatarUrl,
  onFavorite,
  onArrowClick,
  banner,
  topEventos,
  habboStars,
  onVotarEnquete,
}: RadioPanelProps) {
  const { openModal } = useModal()
  const player = useRadioPlayer(streamUrl, { title: musica, artist: `${locutor} · ${programa}` })
  const active = player.status === 'playing' || player.status === 'loading'
  const effectiveVolume = player.muted ? 0 : player.volume
  const volumeIcon = effectiveVolume === 0 ? 'volume-off' : effectiveVolume < 50 ? 'volume-low' : 'volume'
  const musicText =
    player.status === 'loading'
      ? 'Conectando à rádio...'
      : player.status === 'error'
        ? 'Não foi possível conectar. Clique no play para tentar de novo.'
        : musica

  return (
    <section className={`container ${styles.wrap}`} aria-label="Rádio Kihabbo">
      <div className={styles.card}>
        {/* ---------- barra do player ---------- */}
        <div className={styles.bar}>
          <div className={styles.locutor} aria-hidden="true">
            <IsoTile width={88} thickness={8} tone="dark" className={styles.locutorTile} />
            <img
              src={locutorAvatarUrl ?? habboAvatar(locutor)}
              alt=""
              width={64}
              height={110}
              className={`${styles.locutorImg} pixel`}
            />
          </div>

          <div className={styles.controls}>
            <span className={`${styles.pill} ${styles.wLocutor}`} title="Locutor">
              <span className={styles.pillIcon}><Icon name="user" size={20} /></span>
              <span className={styles.pillText}>{locutor}</span>
            </span>

            <span className={`${styles.pill} ${styles.wPrograma}`} title="Programa">
              <span className={styles.pillIcon}><Icon name="mic" size={20} /></span>
              <span className={styles.pillText}>{programa}</span>
            </span>

            <button type="button" className={styles.round} onClick={onFavorite} aria-label="Favoritar">
              <Icon name="star" size={18} />
            </button>

            <button
              type="button"
              className={`${styles.round} ${styles.play} ${player.status === 'loading' ? styles.connecting : ''} ${player.status === 'error' ? styles.failed : ''}`}
              onClick={player.toggle}
              aria-label={active ? 'Pausar a rádio' : 'Tocar a rádio'}
              aria-pressed={active}
            >
              {player.status === 'loading' ? (
                <span className={styles.spinner} aria-hidden="true" />
              ) : (
                <Icon name={active ? 'pause' : 'play'} size={22} />
              )}
            </button>

            <div className={`${styles.pill} ${styles.wVolume}`}>
              <button
                type="button"
                className={`${styles.pillIcon} ${styles.muteBtn}`}
                onClick={player.toggleMute}
                aria-label={player.muted ? 'Ativar som' : 'Silenciar'}
                aria-pressed={player.muted}
              >
                <Icon name={volumeIcon} size={18} />
              </button>
              <span className={styles.track} style={{ '--vol': `${effectiveVolume}%` } as CSSProperties}>
                <span className={styles.fill} />
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={5}
                  value={effectiveVolume}
                  onChange={(e) => player.setVolume(Number(e.target.value))}
                  aria-label="Volume"
                  aria-valuetext={`${effectiveVolume}%`}
                />
              </span>
            </div>

            <span
              className={`${styles.pill} ${styles.music} ${player.status === 'error' ? styles.musicError : ''}`}
              title={musicText}
              aria-live="polite"
            >
              <span className={`${styles.pillIcon} ${player.playing ? styles.equalizer : ''}`}>
                {player.playing ? (
                  <span className={styles.bars} aria-hidden="true">
                    <i />
                    <i />
                    <i />
                  </span>
                ) : (
                  <Icon name="music" size={20} />
                )}
              </span>
              <span className={styles.pillText}>{musicText}</span>
            </span>
          </div>

          <button type="button" className={styles.arrow} onClick={onArrowClick} aria-label="Mais opções da rádio">
            <img src="/assets/radio-arrow.png" alt="" width={22} height={20} className="pixel" />
          </button>
        </div>

        {/* ---------- slots ---------- */}
        <div className={styles.grid}>
          <div className={styles.banner}>
            <ErrorBoundary>{banner ?? <div className={styles.bannerSlot}>Banner / destaque</div>}</ErrorBoundary>
          </div>

          <span className={styles.divider} aria-hidden="true" />

          {/* topEventos = caixa completa (ex.: <TopEventosBox />); sem ela, a moldura vazia */}
          <ErrorBoundary>
            {topEventos ?? (
              <Box
                variant="bare"
                accent="pink"
                title={
                  <span className={styles.topTitle}>
                    TOP <span>Eventos</span>
                  </span>
                }
                minBodyHeight={176}
              />
            )}
          </ErrorBoundary>

          <span className={styles.divider} aria-hidden="true" />

          <Box
            variant="bare"
            title="Habbo Stars"
            hideRefresh
            hideNav
            primaryAction={{ label: 'Votar na enquete', color: 'orange', onClick: onVotarEnquete ?? (() => openModal('votar-enquete')) }}
            minBodyHeight={176}
          >
            {habboStars}
          </Box>
        </div>
      </div>
    </section>
  )
}
