import { useState } from 'react'
import { Box } from '../components/Box/Box'
import { Button } from '../components/Button/Button'
import { IsoTile } from '../components/IsoTile/IsoTile'
import { PageGrid } from '../components/PageGrid/PageGrid'
import { Tabs } from '../components/Tabs/Tabs'
import { RankingList } from '../features/Sidebar/RankingList'
import { DefaultSidebar } from '../features/Sidebar/Sidebar'
import { useAsync } from '../hooks/useAsync'
import { useModal } from '../modals/modalContext'
import { discord } from '../content/kihabbo'
import { avatarUrl } from '../services/habbo'
import { getPlayerStatus, getPollCategories, getRanking } from '../services/kihabbo'
import { DEFAULT_FIGURE } from '../features/HabboImager/figure'
import styles from './pages.module.css'

export function RadioPage({ userNick }: { userNick: string }) {
  const { openModal } = useModal()
  const [period, setPeriod] = useState<'month' | 'all'>('month')
  const status = useAsync('player-status', (s) => getPlayerStatus(s))
  const ranking = useAsync(`ranking-${period}`, (s) => getRanking(period, s))
  const polls = useAsync('polls', (s) => getPollCategories(s))

  const radio = status.data?.radio
  const live = !!radio?.live
  const sortedRanking = ranking.data
    ? [...ranking.data].sort((a, b) => (period === 'month' ? b.hypeMonth - a.hypeMonth : b.hypeAllTime - a.hypeAllTime))
    : undefined

  return (
    <PageGrid aside={<DefaultSidebar userNick={userNick} hide={['ranking']} />}>
      {/* ---------- no ar ---------- */}
      <Box title="No ar agora" accent="pink" hideNav onRefresh={status.reload} minBodyHeight={180}>
        <div className={styles.onAir}>
          <span className={styles.onAirStage}>
            <IsoTile width={120} thickness={10} tone="dark" className={styles.onAirTile} />
            <img
              src={radio?.avatarUser ? avatarUrl({ user: radio.avatarUser, direction: 2, size: 'l' }) : avatarUrl({ figure: DEFAULT_FIGURE, direction: 2, size: 'l' })}
              alt=""
              className={`${styles.onAirAvatar} pixel`}
            />
          </span>
          <div className={styles.onAirInfo}>
            <span className={`${styles.onAirBadge} ${live ? styles.isLive : ''}`}>{live ? 'Ao vivo' : 'AutoDJ'}</span>
            <strong>{status.error ? 'Status indisponível' : radio?.name ?? 'AutoDJ'}</strong>
            <p>{radio?.mode === 'locucao' ? radio.programName ?? 'Locução ao vivo' : live ? 'Programa ao vivo' : 'Programação automática'}</p>
            {radio?.trackTitle && <p className={styles.track}>♪ {radio.trackTitle}</p>}
            <div className={styles.actionsRow}>
              <Button tone="pink" href={radio?.streamUrl || discord.playerExterno}>
                Abrir player externo
              </Button>
              <Button tone="teal" href={discord.bot}>
                Ouça no Discord
              </Button>
            </div>
          </div>
        </div>
      </Box>

      {/* ---------- ranking ---------- */}
      <div id="ranking">
        <Box title="Ranking de locutores" accent="orange" hideNav onRefresh={ranking.reload} minBodyHeight={200}>
          <Tabs
            tabs={[
              { id: 'month', label: 'Este mês' },
              { id: 'all', label: 'Geral' },
            ]}
            active={period}
            onChange={setPeriod}
            label="Período do ranking"
          />
          {ranking.error ? (
            <p className={styles.state}>Não foi possível carregar o ranking.</p>
          ) : !sortedRanking ? (
            <p className={styles.state}>Carregando...</p>
          ) : (
            <RankingList locutores={sortedRanking} period={period} variant="light" />
          )}
        </Box>
      </div>

      {/* ---------- melhores da rodada ---------- */}
      <Box
        title="Melhores da rodada"
        accent="pink"
        hideNav
        onRefresh={polls.reload}
        primaryAction={polls.data?.length ? { label: 'Votar', color: 'pink', onClick: () => openModal('enquetes') } : undefined}
        minBodyHeight={120}
      >
        {polls.error ? (
          <p className={styles.state}>Não foi possível carregar as categorias.</p>
        ) : !polls.data ? (
          <p className={styles.state}>Carregando...</p>
        ) : polls.data.length ? (
          <ul className={styles.pollGrid}>
            {polls.data.map((c) => (
              <li key={c.id}>
                <strong>{c.title}</strong>
                <ul>
                  {c.options.map((o) => (
                    <li key={o.id}>{o.label}</li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        ) : (
          <p className={styles.state}>Nenhuma votação aberta no momento.</p>
        )}
      </Box>
    </PageGrid>
  )
}
