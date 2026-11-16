import { Link } from 'react-router-dom'
import { Box } from '../../components/Box/Box'
import { useAsync } from '../../hooks/useAsync'
import { useModal } from '../../modals/modalContext'
import { eventDate, eventTitle, getAgenda, getRanking } from '../../services/kihabbo'
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

export function AgendaBox() {
  const { openModal } = useModal()
  const { data, error, loading, reload } = useAsync('agenda', (s) => getAgenda(s))
  return (
    <Box
      variant="dark"
      title="Agenda"
      accent="green"
      hideNav
      onRefresh={reload}
      minBodyHeight={80}
      footer={
        <button type="button" className={styles.footerBtn} onClick={() => openModal('notificar-evento')}>
          Publicar evento
        </button>
      }
    >
      <div className={styles.panel}>
        {error ? (
          <p className={styles.empty}>Não foi possível carregar a agenda.</p>
        ) : loading || !data ? (
          <p className={styles.empty}>Carregando...</p>
        ) : data.length ? (
          <ul className={styles.events}>
            {data.slice(0, 5).map((e) => (
              <li key={e.id}>
                <strong>{eventTitle(e)}</strong>
                {eventDate(e) && <small>{eventDate(e)}</small>}
              </li>
            ))}
          </ul>
        ) : (
          <p className={styles.empty}>Nenhum evento agendado no momento.</p>
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
      {!hide.includes('agenda') && <AgendaBox />}
    </>
  )
}
