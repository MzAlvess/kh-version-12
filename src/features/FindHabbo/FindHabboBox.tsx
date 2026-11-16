import { useState } from 'react'
import { Box } from '../../components/Box/Box'
import { IsoTile } from '../../components/IsoTile/IsoTile'
import { Modal } from '../../components/Modal/Modal'
import { useAsync } from '../../hooks/useAsync'
import {
  avatarUrl,
  badgeUrl,
  formatDate,
  getProfile,
  getUser,
  NotFoundError,
  timeAgo,
  type HabboBadge,
  type HabboProfile,
} from '../../services/habbo'
import styles from './FindHabboBox.module.css'

interface Result {
  user: HabboProfile['user']
  profile: HabboProfile | null
}

async function findHabbo(name: string, signal: AbortSignal): Promise<Result> {
  const user = await getUser(name, signal)
  let profile: HabboProfile | null = null
  if (user.profileVisible) {
    try {
      profile = await getProfile(user.uniqueId, signal)
    } catch (err) {
      if (!(err instanceof NotFoundError)) throw err
    }
  }
  return { user, profile }
}

/** emblemas em destaque primeiro, completando até 6 com os demais */
function featuredBadges({ user, profile }: Result): HabboBadge[] {
  const list: HabboBadge[] = [...user.selectedBadges].sort((a, b) => a.badgeIndex - b.badgeIndex)
  for (const b of profile?.badges ?? []) {
    if (list.length >= 6) break
    if (!list.some((x) => x.code === b.code)) list.push(b)
  }
  return list.slice(0, 6)
}

export function FindHabboBox({ initialNick }: { initialNick: string }) {
  // histórico de buscas: as setas do header voltam/avançam
  const [history, setHistory] = useState([initialNick])
  const [index, setIndex] = useState(0)
  const [showAll, setShowAll] = useState(false)
  const name = history[index]

  const { data, error, loading, previous, reload } = useAsync(`find-${name.toLowerCase()}`, (signal) =>
    findHabbo(name, signal),
  )
  const result = data ?? (loading ? previous : undefined)

  const search = (value: string) => {
    const nick = value.trim()
    if (!nick || nick.toLowerCase() === name.toLowerCase()) return
    const next = [...history.slice(0, index + 1), nick]
    setHistory(next)
    setIndex(next.length - 1)
  }

  return (
    <Box
      id="encontrar-habbo"
      variant="dark"
      title="Encontrar habbo"
      accent="pink"
      search={{ placeholder: 'Encontrar...', onSubmit: search }}
      onRefresh={reload}
      onPrev={() => setIndex((i) => Math.max(0, i - 1))}
      onNext={() => setIndex((i) => Math.min(history.length - 1, i + 1))}
      prevDisabled={index === 0}
      nextDisabled={index >= history.length - 1}
      minBodyHeight={359}
    >
      <div className={`${styles.panel} ${loading ? styles.busy : ''}`} aria-busy={loading} aria-live="polite">
        {error && !loading ? (
          <div className={styles.message}>
            {error instanceof NotFoundError ? (
              <>
                <strong>Habbo não encontrado</strong>
                <span>Confira se o nick “{name}” está certo.</span>
              </>
            ) : (
              <>
                <strong>Não foi possível buscar agora</strong>
                <button type="button" className={styles.link} onClick={reload}>
                  Tentar novamente
                </button>
              </>
            )}
          </div>
        ) : result ? (
          <Profile result={result} onShowAll={() => setShowAll(true)} />
        ) : (
          <div className={styles.message}>Carregando...</div>
        )}
      </div>

      {showAll && result?.profile && (
        <Modal title={`Emblemas de ${result.user.name}`} tone="pink" size="lg" onClose={() => setShowAll(false)}>
          <ul className={styles.allBadges}>
            {result.profile.badges.map((b) => (
              <li key={b.code} title={`${b.name}${b.description ? ` — ${b.description}` : ''}`}>
                <img src={badgeUrl(b.code)} alt={b.name} loading="lazy" className="pixel" />
              </li>
            ))}
          </ul>
        </Modal>
      )}
    </Box>
  )
}

function Profile({ result, onShowAll }: { result: Result; onShowAll: () => void }) {
  const { user, profile } = result
  const badges = featuredBadges(result)
  const hidden = !profile

  return (
    <>
      <div className={styles.top}>
        <div className={styles.left}>
          <h3 className={styles.name} title={user.motto}>
            {user.name}
          </h3>
          <div className={styles.badges}>
            <ul className={styles.badgeGrid}>
              {Array.from({ length: 6 }, (_, i) => badges[i]).map((b, i) => (
                <li key={b?.code ?? i} title={b ? b.name : undefined}>
                  {b && <img src={badgeUrl(b.code)} alt={b.name} loading="lazy" className="pixel" />}
                </li>
              ))}
            </ul>
            <button type="button" className={styles.allBtn} onClick={onShowAll} disabled={hidden}>
              {hidden ? 'Perfil privado' : `Ver todos (${profile.badges.length.toLocaleString('pt-BR')})`}
            </button>
          </div>
        </div>

        <div className={styles.right}>
          <div className={styles.avatar}>
            <IsoTile width={62} thickness={12} tone="gray" className={styles.pedestal} />
            <img
              src={avatarUrl({ figure: user.figureString, direction: 4, size: 'm' })}
              alt={`Avatar de ${user.name}`}
              width={64}
              height={110}
              className={`${styles.figure} pixel`}
            />
          </div>
          <span className={`${styles.status} ${user.online ? styles.on : styles.off}`}>
            {user.online ? 'ON' : 'OFF'}
          </span>
        </div>
      </div>

      <p className={styles.info}>
        <strong>Conta criada em:</strong> {formatDate(user.memberSince)}
      </p>
      <p className={styles.info}>
        <strong>Último login:</strong> {user.online ? 'online agora' : timeAgo(user.lastAccessTime)}
      </p>

      <div className={styles.stats}>
        <div className={styles.stat}>
          <img src="/assets/ui/amigos.png" alt="" className="pixel" />
          <span>
            <strong>{hidden ? '—' : profile.friends.length.toLocaleString('pt-BR')}</strong>
            Amigos
          </span>
        </div>
        <div className={styles.stat}>
          <img src="/assets/ui/grupos.png" alt="" className="pixel" />
          <span>
            <strong>{hidden ? '—' : profile.groups.length.toLocaleString('pt-BR')}</strong>
            Grupos
          </span>
        </div>
      </div>
    </>
  )
}
