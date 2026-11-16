import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box } from '../../components/Box/Box'
import { useAsync } from '../../hooks/useAsync'
import { getPosts } from '../../services/kihabbo'
import { NewsGrid } from './NewsGrid'
import styles from './News.module.css'

const PAGE_SIZE = 6

/** Caixa "Notícias" da home: últimas publicações da equipe (API /v1/news), 6 por página */
export function LatestNewsBox() {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const { data, error, loading, previous, reload } = useAsync(`home-news-${page}`, (s) =>
    getPosts({ page, limit: PAGE_SIZE }, s),
  )
  const current = data ?? (loading ? previous : undefined)
  const lastPage = current ? Math.max(1, Math.ceil(current.total / PAGE_SIZE)) : 1

  return (
    <Box
      id="noticias"
      title="Notícias"
      accent="green"
      primaryAction={{ label: 'Ver todas', onClick: () => navigate('/noticias') }}
      onRefresh={reload}
      onPrev={() => setPage((p) => Math.max(1, p - 1))}
      onNext={() => setPage((p) => Math.min(lastPage, p + 1))}
      prevDisabled={page <= 1 || loading}
      nextDisabled={page >= lastPage || loading}
      minBodyHeight={280}
    >
      {error && !loading ? (
        <p className={styles.message}>
          Não foi possível carregar as notícias.{' '}
          <button type="button" onClick={reload}>
            Tentar novamente
          </button>
        </p>
      ) : current?.posts.length === 0 ? (
        <p className={styles.message}>Nenhuma notícia publicada ainda.</p>
      ) : (
        <NewsGrid posts={current?.posts} busy={loading && !!current} />
      )}
    </Box>
  )
}
