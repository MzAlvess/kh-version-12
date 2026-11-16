import { useState } from 'react'
import { Box } from '../../components/Box/Box'
import { Button } from '../../components/Button/Button'
import { Modal } from '../../components/Modal/Modal'
import { useAsync } from '../../hooks/useAsync'
import { formatDate, getNewBadges, type NewBadge } from '../../services/habbo'
import styles from './NewBadgesBox.module.css'

const PAGE_SIZE = 6
const NEW_DAYS = 7

const isNew = (iso: string) => Date.now() - new Date(iso).getTime() < NEW_DAYS * 24 * 60 * 60 * 1000

export function NewBadgesBox() {
  const [page, setPage] = useState(0)
  const [selected, setSelected] = useState<NewBadge | null>(null)
  const { data, error, loading, previous, reload } = useAsync(`badges-${page}`, (signal) =>
    getNewBadges({ limit: PAGE_SIZE, offset: page * PAGE_SIZE }, signal),
  )

  const badges = data ?? (loading ? previous : undefined)

  return (
    <Box
      id="novos-emblemas"
      title="Novos emblemas"
      accent="pink"
      sideStrip={{ color: 'pink', icon: <img src="/assets/strip-emblemas.png" alt="" width={31} height={32} /> }}
      onRefresh={reload}
      onPrev={() => setPage((p) => Math.max(0, p - 1))}
      onNext={() => setPage((p) => p + 1)}
      prevDisabled={page === 0 || loading}
      nextDisabled={loading || !!error || (data !== undefined && data.length < PAGE_SIZE)}
      minBodyHeight={110}
    >
      {error && !loading ? (
        <div className={styles.message}>
          <span>Não foi possível carregar os emblemas agora.</span>
          <Button tone="pink" className={styles.retry} onClick={reload}>
            Tentar novamente
          </Button>
        </div>
      ) : (
        <ul className={`${styles.grid} ${loading ? styles.busy : ''}`} aria-busy={loading}>
          {badges
            ? badges.map((b) => (
                <li key={b.code}>
                  <button type="button" className={styles.card} onClick={() => setSelected(b)} title={b.name}>
                    <span className={styles.image}>
                      {isNew(b.createdAt) && <img src="/assets/ui/new.png" alt="Novo" className={`${styles.new} pixel`} />}
                      <img src={b.imageUrl} alt={b.name} loading="lazy" className="pixel" />
                    </span>
                    <span className={styles.code}>{b.code}</span>
                  </button>
                </li>
              ))
            : Array.from({ length: PAGE_SIZE }, (_, i) => (
                <li key={i}>
                  <span className={`${styles.card} ${styles.skeleton}`} />
                </li>
              ))}
        </ul>
      )}

      {selected && (
        <Modal title="Emblema" tone="pink" size="sm" onClose={() => setSelected(null)}>
          <div className={styles.detail}>
            <span className={styles.detailImage}>
              <img src={selected.imageUrl} alt="" className="pixel" />
            </span>
            <strong>{selected.name || selected.code}</strong>
            {selected.description && <p>{selected.description}</p>}
            <dl>
              <dt>Código</dt>
              <dd>{selected.code}</dd>
              <dt>Lançado em</dt>
              <dd>{formatDate(selected.createdAt)}</dd>
            </dl>
          </div>
        </Modal>
      )}
    </Box>
  )
}
