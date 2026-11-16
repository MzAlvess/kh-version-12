import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Box } from '../../components/Box/Box'
import { useAsync } from '../../hooks/useAsync'
import { getPosts, longDate } from '../../services/kihabbo'
import styles from './TopEventos.module.css'

const PAGE_SIZE = 3
/** slug da tag das notícias de evento no Kihabbo */
const EVENTS_TAG = 'eventos'

/** "TOP Eventos" do painel da rádio: notícias com a tag Eventos (mais recentes primeiro), com medalhas 1–3 */
export function TopEventosBox() {
  const [page, setPage] = useState(1)
  const { data, error, loading, previous, reload } = useAsync(`top-eventos-${page}`, (s) =>
    getPosts({ page, limit: PAGE_SIZE, tag: EVENTS_TAG }, s),
  )
  const current = data ?? (loading ? previous : undefined)
  const lastPage = current ? Math.max(1, Math.ceil(current.total / PAGE_SIZE)) : 1

  return (
    <Box
      variant="bare"
      accent="pink"
      title={
        <span className={styles.title}>
          TOP <span>Eventos</span>
        </span>
      }
      onRefresh={reload}
      onPrev={() => setPage((p) => Math.max(1, p - 1))}
      onNext={() => setPage((p) => Math.min(lastPage, p + 1))}
      prevDisabled={page <= 1 || loading}
      nextDisabled={page >= lastPage || loading}
      minBodyHeight={176}
    >
      {error && !loading ? (
        <p className={styles.empty}>Não foi possível carregar os eventos.</p>
      ) : !current ? (
        <ul className={styles.list} aria-busy="true">
          {Array.from({ length: PAGE_SIZE }, (_, i) => (
            <li key={i} className={`${styles.card} ${styles.skeleton}`} />
          ))}
        </ul>
      ) : current.posts.length ? (
        <ul className={`${styles.list} ${loading ? styles.busy : ''}`}>
          {current.posts.map((post, i) => {
            const position = (page - 1) * PAGE_SIZE + i + 1
            return (
              <li key={post.id}>
                <Link to={`/noticias/${post.slug}`} className={styles.card} title={post.title}>
                  <span className={styles.icon}>
                    {position <= 3 ? (
                      <img src={`/assets/ui/medalha-${position}.png`} alt={`${position}º`} className="pixel" />
                    ) : (
                      <span className={styles.number}>{position}</span>
                    )}
                  </span>
                  <span className={styles.text}>
                    <strong>{post.title}</strong>
                    <small>{longDate(post.publishedAt ?? post.createdAt)}</small>
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
      ) : (
        <p className={styles.empty}>Nenhuma notícia de evento publicada ainda.</p>
      )}
    </Box>
  )
}
