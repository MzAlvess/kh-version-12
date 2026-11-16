import { useMemo, useState } from 'react'
import { Box } from '../components/Box/Box'
import { PageGrid } from '../components/PageGrid/PageGrid'
import { DefaultSidebar } from '../features/Sidebar/Sidebar'
import { useAsync } from '../hooks/useAsync'
import { useModal } from '../modals/modalContext'
import { getAllPosts } from '../services/kihabbo'
import { NewsGrid } from '../features/News/NewsGrid'
import styles from './pages.module.css'

const PAGE_SIZE = 6

const normalize = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')

export function NoticiasPage({ userNick }: { userNick: string }) {
  const { openModal } = useModal()
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(0)
  // a API ainda não filtra por texto: carrega todas as publicações e filtra/pagina aqui
  const { data, error, loading, reload } = useAsync('news-all', (s) => getAllPosts(s))

  const filtered = useMemo(() => {
    const q = normalize(query.trim())
    const posts = data ?? []
    return q ? posts.filter((p) => normalize(`${p.title} ${p.excerpt} ${p.author}`).includes(q)) : posts
  }, [data, query])

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const current = Math.min(page, pages - 1)
  const visible = filtered.slice(current * PAGE_SIZE, (current + 1) * PAGE_SIZE)

  return (
    <PageGrid aside={<DefaultSidebar userNick={userNick} />}>
      <Box
        title="Notícias"
        accent="green"
        primaryAction={{ label: 'Postar artigo', onClick: () => openModal('postar-artigo') }}
        search={{
          placeholder: 'Pesquisar...',
          value: query,
          onChange: (v) => {
            setQuery(v)
            setPage(0)
          },
        }}
        onRefresh={reload}
        onPrev={() => setPage(Math.max(0, current - 1))}
        onNext={() => setPage(Math.min(pages - 1, current + 1))}
        prevDisabled={current === 0}
        nextDisabled={current >= pages - 1}
        minBodyHeight={400}
      >
        {error ? (
          <p className={styles.state}>
            Não foi possível carregar as notícias.{' '}
            <button type="button" className={styles.linkBtn} onClick={reload}>
              Tentar novamente
            </button>
          </p>
        ) : loading || !data ? (
          <NewsGrid />
        ) : visible.length ? (
          <>
            <NewsGrid posts={visible} />
            {pages > 1 && (
              <p className={styles.pager}>
                Página {current + 1} de {pages}
              </p>
            )}
          </>
        ) : (
          <p className={styles.state}>Nenhuma notícia encontrada para “{query}”.</p>
        )}
      </Box>
    </PageGrid>
  )
}
