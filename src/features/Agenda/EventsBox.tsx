import { useState } from 'react'
import { Box, type Accent } from '../../components/Box/Box'
import { useAsync } from '../../hooks/useAsync'
import { useModal } from '../../modals/modalContext'
import { getAgenda, type AgendaEvent } from '../../services/kihabbo'
import { AgendaTimes } from './AgendaTimes'
import { EventModal } from './EventModal'
import styles from './Agenda.module.css'

interface EventsBoxProps {
  id?: string
  title: string
  accent: Accent
  /** quantos eventos por página */
  pageSize?: number
  /** mostra o botão "Publicar evento" no rodapé */
  showPublish?: boolean
  minBodyHeight?: number
}

/** Caixa escura com os eventos da agenda da Kihabbo (/v1/agenda/events) */
export function EventsBox({ id, title, accent, pageSize = 3, showPublish, minBodyHeight = 120 }: EventsBoxProps) {
  const { openModal } = useModal()
  const [page, setPage] = useState(0)
  const [selected, setSelected] = useState<AgendaEvent | null>(null)
  const { data, error, loading, reload } = useAsync('agenda', (s) => getAgenda(s))
  const [now] = useState(() => Date.now())

  // só eventos que ainda não terminaram (com 1h de folga)
  const upcoming = (data ?? []).filter((e) => new Date(e.endsAt ?? e.startsAt).getTime() >= now - 60 * 60 * 1000)
  const pages = Math.max(1, Math.ceil(upcoming.length / pageSize))
  const current = Math.min(page, pages - 1)
  const visible = upcoming.slice(current * pageSize, (current + 1) * pageSize)

  return (
    <Box
      id={id}
      variant="dark"
      title={title}
      accent={accent}
      onRefresh={reload}
      onPrev={() => setPage(Math.max(0, current - 1))}
      onNext={() => setPage(Math.min(pages - 1, current + 1))}
      prevDisabled={current === 0}
      nextDisabled={current >= pages - 1}
      minBodyHeight={minBodyHeight}
      footer={
        showPublish ? (
          <button type="button" className={styles.footerBtn} onClick={() => openModal('notificar-evento')}>
            Publicar evento
          </button>
        ) : undefined
      }
    >
      <div className={styles.panel}>
        {error ? (
          <p className={styles.empty}>Não foi possível carregar a agenda.</p>
        ) : loading || !data ? (
          <p className={styles.empty}>Carregando...</p>
        ) : visible.length ? (
          <ul className={styles.list}>
            {visible.map((e) => (
              <li key={e.id}>
                <button type="button" className={styles.card} onClick={() => setSelected(e)}>
                  <span className={styles.thumb}>
                    {e.bannerUrl ? <img src={e.bannerUrl} alt="" loading="lazy" /> : <span aria-hidden="true">★</span>}
                  </span>
                  <span className={styles.info}>
                    <strong>{e.title}</strong>
                    <AgendaTimes start={e.startsAt} end={e.endsAt} only="br" />
                    {(e.place || e.prize) && (
                      <small>
                        {[e.place, e.prize].filter(Boolean).join(' · ')}
                      </small>
                    )}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className={styles.empty}>Nenhum evento agendado no momento.</p>
        )}
      </div>

      {selected && <EventModal event={selected} onClose={() => setSelected(null)} />}
    </Box>
  )
}
