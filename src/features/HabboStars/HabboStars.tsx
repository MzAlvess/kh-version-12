import { useAsync } from '../../hooks/useAsync'
import { avatarUrl } from '../../services/habbo'
import { getFeatureFlags, getHallCategories, getHallWinners, getRanking } from '../../services/kihabbo'
import styles from './HabboStars.module.css'

interface Star {
  nick: string
  caption: string
}

const SHOWN = 3

/**
 * Conteúdo da coluna "Habbo Stars" do painel da rádio.
 * - Hall da Fama ligado no Kihabbo (feature flag history_hall_of_fame): vencedores do "Melhores da rodada"
 * - Senão: os 3 primeiros locutores do mês (/v1/rankings/locutores)
 */
async function loadStars(signal: AbortSignal): Promise<Star[]> {
  const flags = await getFeatureFlags(signal).catch(() => ({}) as Record<string, boolean>)

  if (flags.history_hall_of_fame) {
    const categories = await getHallCategories(signal)
    // um vencedor (o 1º) de cada categoria, até 3
    const tops = await Promise.all(
      categories.slice(0, SHOWN).map(async (c) => {
        const [first] = await getHallWinners(c.id, signal)
        return first ? { nick: first.name, caption: `${c.label} · ${first.wins} vitórias` } : null
      }),
    )
    const stars = tops.filter((s): s is Star => !!s)
    if (stars.length) return stars
  }

  const ranking = await getRanking('month', signal)
  return [...ranking]
    .sort((a, b) => b.hypeMonth - a.hypeMonth)
    .slice(0, SHOWN)
    .map((l, i) => ({ nick: l.name, caption: `${i + 1}º locutor do mês · ${l.hypeMonth} hype` }))
}

export function HabboStars() {
  const { data, error, loading } = useAsync('habbo-stars', loadStars)

  if (error) return <p className={styles.empty}>Não foi possível carregar os destaques.</p>
  if (loading || !data)
    return (
      <ul className={styles.list} aria-busy="true">
        {Array.from({ length: SHOWN }, (_, i) => (
          <li key={i} className={`${styles.row} ${i === 1 ? styles.reverse : ''}`}>
            <span className={`${styles.avatar} ${styles.skeleton}`} />
            <span className={`${styles.card} ${styles.skeleton}`} />
          </li>
        ))}
      </ul>
    )
  if (!data.length) return <p className={styles.empty}>Nenhum destaque ainda.</p>

  return (
    <ul className={styles.list}>
      {data.map((s, i) => (
        // a linha do meio é espelhada, como no layout
        <li key={s.nick} className={`${styles.row} ${i === 1 ? styles.reverse : ''}`}>
          <span className={styles.avatar}>
            <img
              src={avatarUrl({ user: s.nick, headonly: true, direction: i === 1 ? 4 : 2, size: 'm' })}
              alt=""
              loading="lazy"
              className="pixel"
            />
          </span>
          <span className={styles.card}>
            <strong>{s.nick}</strong>
            <small>{s.caption}</small>
          </span>
        </li>
      ))}
    </ul>
  )
}
