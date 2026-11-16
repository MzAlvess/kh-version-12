import { avatarUrl } from '../../services/habbo'
import type { Locutor } from '../../services/kihabbo'
import styles from './Sidebar.module.css'

/** Linhas do ranking de locutores (usada na lateral e na página da Rádio) */
export function RankingList({
  locutores,
  period,
  variant = 'dark',
}: {
  locutores: Locutor[]
  period: 'month' | 'all'
  variant?: 'dark' | 'light'
}) {
  if (!locutores.length) return <p className={styles.empty}>Nenhum locutor no ranking ainda.</p>
  return (
    <ol className={`${styles.ranking} ${variant === 'light' ? styles.light : ''}`}>
      {locutores.map((l, i) => (
        <li key={l.id} className={i < 3 ? styles[`top${i + 1}`] : undefined}>
          <span className={styles.position}>{i + 1}</span>
          <span className={styles.head}>
            <img
              src={avatarUrl({ user: l.user, headonly: true, size: 'm', direction: 3, headDirection: 3 })}
              alt=""
              loading="lazy"
              className="pixel"
            />
          </span>
          <span className={styles.who}>
            <strong>{l.name}</strong>
            {l.live ? <em className={styles.live}>Ao vivo</em> : <small>{period === 'month' ? 'Este mês' : 'Geral'}</small>}
          </span>
          <span className={styles.hype}>
            <strong>{period === 'month' ? l.hypeMonth : l.hypeAllTime}</strong>
            <small>hype</small>
          </span>
        </li>
      ))}
    </ol>
  )
}
