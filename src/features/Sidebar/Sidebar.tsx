import { Link } from 'react-router-dom'
import { Box } from '../../components/Box/Box'
import { useAsync } from '../../hooks/useAsync'
import { getRanking } from '../../services/kihabbo'
import { EventsBox } from '../Agenda/EventsBox'
import { FindHabboBox } from '../FindHabbo/FindHabboBox'
import { RankingList } from './RankingList'
import styles from './Sidebar.module.css'

export function TopLocutoresBox() {
  const { data, error, loading, reload } = useAsync('ranking-month', (s) => getRanking('month', s))
  return (
    <Box
      variant="dark"
      title="Top locutores"
      accent="orange"
      hideNav
      onRefresh={reload}
      minBodyHeight={120}
      footer={
        <Link to="/radio#ranking" className={styles.footerBtn}>
          Ver ranking completo
        </Link>
      }
    >
      <div className={styles.panel}>
        {error ? (
          <p className={styles.empty}>Não foi possível carregar o ranking.</p>
        ) : loading || !data ? (
          <p className={styles.empty}>Carregando...</p>
        ) : (
          <RankingList locutores={data.slice(0, 5)} period="month" />
        )}
      </div>
    </Box>
  )
}

/** Coluna lateral padrão das páginas internas */
export function DefaultSidebar({ userNick, hide = [] }: { userNick: string; hide?: ('find' | 'ranking' | 'agenda')[] }) {
  return (
    <>
      {!hide.includes('find') && <FindHabboBox initialNick={userNick} />}
      {!hide.includes('ranking') && <TopLocutoresBox />}
      {!hide.includes('agenda') && <EventsBox title="Agenda" accent="green" showPublish />}
    </>
  )
}
