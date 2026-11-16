import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { Box } from '../../components/Box/Box'
import { Icon } from '../../components/Icon/Icon'
import { IsoTile } from '../../components/IsoTile/IsoTile'
import { useModal } from '../../modals/modalContext'
import { habboAvatar } from '../Header/menu'
import styles from './RadioPanel.module.css'

export interface RadioPanelProps {
  locutor: string
  programa: string
  musica: string
  /** URL do stream (Shoutcast/Icecast). Sem ela o play só alterna o ícone. */
  streamUrl?: string
  /** Avatar do locutor; padrão: habbo-imaging pelo nick */
  locutorAvatarUrl?: string
  onFavorite?: () => void
  onArrowClick?: () => void
  /** Slots preenchidos pelo backend */
  banner?: ReactNode
  topEventos?: ReactNode
  habboStars?: ReactNode
  onVotarEnquete?: () => void
}

export function RadioPanel({
  locutor,
  programa,
  musica,
  streamUrl,
  locutorAvatarUrl,
  onFavorite,
  onArrowClick,
  banner,
  topEventos,
  habboStars,
  onVotarEnquete,
}: RadioPanelProps) {
  const { openModal } = useModal()
  const audioRef = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(false)
  const [volume, setVolume] = useState(78)

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume / 100
  }, [volume])

  const togglePlay = () => {
    const audio = audioRef.current
    if (audio) {
      if (playing) audio.pause()
      else audio.play().catch(() => setPlaying(false))
    }
    setPlaying((p) => !p)
  }

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
              className={`${styles.round} ${styles.play}`}
              onClick={togglePlay}
              aria-label={playing ? 'Pausar' : 'Tocar'}
            >
              <Icon name={playing ? 'pause' : 'play'} size={22} />
            </button>

            <label className={`${styles.pill} ${styles.wVolume}`}>
              <span className={styles.pillIcon}><Icon name="volume" size={18} /></span>
              <span className={styles.track} style={{ '--vol': `${volume}%` } as CSSProperties}>
                <span className={styles.fill} />
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={volume}
                  onChange={(e) => setVolume(Number(e.target.value))}
                  aria-label="Volume"
                />
              </span>
            </label>

            <span className={`${styles.pill} ${styles.music}`} title={musica}>
              <span className={styles.pillIcon}><Icon name="music" size={20} /></span>
              <span className={styles.pillText}>{musica}</span>
            </span>
          </div>

          <button type="button" className={styles.arrow} onClick={onArrowClick} aria-label="Mais opções da rádio">
            <img src="/assets/radio-arrow.png" alt="" width={22} height={20} className="pixel" />
          </button>

          {streamUrl && <audio ref={audioRef} src={streamUrl} preload="none" />}
        </div>

        {/* ---------- slots ---------- */}
        <div className={styles.grid}>
          <div className={styles.banner}>{banner ?? <div className={styles.bannerSlot}>Banner / destaque</div>}</div>

          <span className={styles.divider} aria-hidden="true" />

          <Box
            variant="bare"
            accent="pink"
            title={
              <span className={styles.topTitle}>
                TOP <span>Eventos</span>
              </span>
            }
            minBodyHeight={176}
          >
            {topEventos}
          </Box>

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
