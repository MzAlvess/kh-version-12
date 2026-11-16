import { useSearchParams } from 'react-router-dom'
import { Box } from '../components/Box/Box'
import { Button } from '../components/Button/Button'
import { PageGrid } from '../components/PageGrid/PageGrid'
import { Tabs } from '../components/Tabs/Tabs'
import { DefaultSidebar } from '../features/Sidebar/Sidebar'
import { comoJogar, curiosidades, hoteis, sobre } from '../content/habbo'
import styles from './pages.module.css'

const TABS = [
  { id: 'sobre', label: 'Sobre o jogo' },
  { id: 'como-jogar', label: 'Como jogar' },
  { id: 'hoteis', label: 'Hotéis pelo mundo' },
  { id: 'curiosidades', label: 'Curiosidades' },
] as const
type TabId = (typeof TABS)[number]['id']

export function HabboHotelPage({ userNick }: { userNick: string }) {
  const [params, setParams] = useSearchParams()
  const tab = (TABS.find((t) => t.id === params.get('aba'))?.id ?? 'sobre') as TabId

  return (
    <PageGrid aside={<DefaultSidebar userNick={userNick} />}>
      <Box title="Habbo Hotel" accent="teal" hideNav hideRefresh minBodyHeight={300}>
        <Tabs tabs={[...TABS]} active={tab} onChange={(id) => setParams({ aba: id }, { replace: true })} label="Seções" />

        {tab === 'sobre' && (
          <div className={styles.prose}>
            <h3 className={styles.sectionTitle}>O que é o Habbo Hotel</h3>
            {sobre.map((p) => (
              <p key={p.slice(0, 24)}>{p}</p>
            ))}
            <div className={styles.actionsRow}>
              <Button tone="teal" href="https://www.habbo.com.br">
                Visitar o site oficial
              </Button>
            </div>
          </div>
        )}

        {tab === 'como-jogar' && (
          <>
            <h3 className={styles.sectionTitle}>Como jogar</h3>
            <ol className={styles.steps}>
              {comoJogar.map((s, i) => (
                <li key={s}>
                  <span className={styles.stepNumber}>{i + 1}</span>
                  <p>{s}</p>
                </li>
              ))}
            </ol>
          </>
        )}

        {tab === 'hoteis' && (
          <>
            <h3 className={styles.sectionTitle}>Hotéis pelo mundo</h3>
            <p className={styles.lead}>
              O Habbo tem hotéis (servidores) independentes para vários países e idiomas, cada um com sua própria
              comunidade:
            </p>
            <ul className={styles.hotels}>
              {hoteis.map((h) => (
                <li key={h.domain}>
                  <a href={h.url} target="_blank" rel="noopener noreferrer">
                    <span className={styles.flag} aria-hidden="true">
                      {h.code}
                    </span>
                    <span>
                      <strong>{h.domain}</strong>
                      <small>{h.idioma}</small>
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </>
        )}

        {tab === 'curiosidades' && (
          <>
            <h3 className={styles.sectionTitle}>Curiosidades</h3>
            <ul className={styles.stars}>
              {curiosidades.map((c) => (
                <li key={c}>
                  <span aria-hidden="true">★</span>
                  <p>{c}</p>
                </li>
              ))}
            </ul>
          </>
        )}
      </Box>
    </PageGrid>
  )
}
