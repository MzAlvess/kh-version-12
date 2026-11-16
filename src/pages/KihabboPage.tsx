import { useSearchParams } from 'react-router-dom'
import { Box } from '../components/Box/Box'
import { IsoTile } from '../components/IsoTile/IsoTile'
import { PageGrid } from '../components/PageGrid/PageGrid'
import { Tabs } from '../components/Tabs/Tabs'
import { DefaultSidebar } from '../features/Sidebar/Sidebar'
import { useAsync } from '../hooks/useAsync'
import { historia, regras } from '../content/kihabbo'
import { avatarUrl } from '../services/habbo'
import { getTeam } from '../services/kihabbo'
import styles from './pages.module.css'

const TABS = [
  { id: 'historia', label: 'História' },
  { id: 'equipe', label: 'Equipe' },
  { id: 'regras', label: 'Regras' },
] as const
type TabId = (typeof TABS)[number]['id']

export function KihabboPage({ userNick }: { userNick: string }) {
  const [params, setParams] = useSearchParams()
  const tab = (TABS.find((t) => t.id === params.get('aba'))?.id ?? 'historia') as TabId

  return (
    <PageGrid aside={<DefaultSidebar userNick={userNick} />}>
      <Box title="Kihabbo" accent="green" hideNav hideRefresh minBodyHeight={300}>
        <Tabs tabs={[...TABS]} active={tab} onChange={(id) => setParams({ aba: id }, { replace: true })} label="Seções" />
        {tab === 'historia' && <Historia />}
        {tab === 'equipe' && <Equipe />}
        {tab === 'regras' && <Regras />}
      </Box>
    </PageGrid>
  )
}

function Historia() {
  return (
    <div className={styles.historia}>
      <header className={styles.hero}>
        <span className={styles.heroKicker}>Nossa história</span>
        <strong>{historia.intro.period}</strong>
        <p>{historia.intro.text}</p>
      </header>

      <ol className={styles.timeline}>
        {historia.timeline.map((entry) => (
          <li key={entry.year} id={`ano-${entry.year}`}>
            <span className={styles.year}>{entry.year}</span>
            <article className={styles.entry}>
              {entry.title && <h3>{entry.title}</h3>}
              {entry.date && <time>{entry.date}</time>}
              {entry.paragraphs.map((p) => (
                <p key={p.slice(0, 24)}>{p}</p>
              ))}
              {entry.highlight && (
                <div className={styles.highlight}>
                  <strong>{entry.highlight.label}</strong>
                  <p>{entry.highlight.text}</p>
                </div>
              )}
              {entry.quote && <blockquote className={styles.quote}>“{entry.quote}”</blockquote>}
            </article>
          </li>
        ))}
      </ol>

      <footer className={styles.outro}>
        <span>2010 → 2026</span>
        <strong>{historia.outro.title}</strong>
        {historia.outro.lines.map((l) => (
          <p key={l}>{l}</p>
        ))}
        <p className={styles.outroClosing}>{historia.outro.closing}</p>
        <em>KIHABBO · Um Mundo Diferente.</em>
      </footer>
    </div>
  )
}

function Equipe() {
  const { data, error, loading, reload } = useAsync('team', (s) => getTeam(s))
  if (error)
    return (
      <p className={styles.state}>
        Não foi possível carregar a equipe.{' '}
        <button type="button" className={styles.linkBtn} onClick={reload}>
          Tentar novamente
        </button>
      </p>
    )
  if (loading || !data) return <p className={styles.state}>Carregando equipe...</p>
  if (!data.length) return <p className={styles.state}>A equipe ainda não foi cadastrada.</p>

  return (
    <div className={styles.team}>
      {data.map((group) => (
        <section key={group.id}>
          <h3 className={styles.sectionTitle}>{group.label}</h3>
          <ul className={styles.members}>
            {[...group.members]
              .sort((a, b) => a.sortOrder - b.sortOrder)
              .map((m) => (
                <li key={m.id}>
                  <span className={styles.memberStage}>
                    <IsoTile width={100} thickness={9} className={styles.memberTile} />
                    <img
                      src={avatarUrl({ user: m.avatarUser || m.username, direction: 2, size: 'm' })}
                      alt=""
                      loading="lazy"
                      className={`${styles.memberAvatar} pixel`}
                    />
                  </span>
                  <strong>{m.displayName || m.username}</strong>
                  <small>{m.role}</small>
                </li>
              ))}
          </ul>
        </section>
      ))}
    </div>
  )
}

function Regras() {
  return (
    <ol className={styles.steps}>
      {regras.map((r, i) => (
        <li key={r}>
          <span className={styles.stepNumber}>{i + 1}</span>
          <p>{r}</p>
        </li>
      ))}
    </ol>
  )
}
