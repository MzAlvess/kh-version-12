import { useEffect, useState } from 'react'
import { useAsync } from '../../hooks/useAsync'
import { getDestaques } from '../../services/kihabbo'
import styles from './DestaquesBanner.module.css'

const reducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

/** Banner do painel da rádio: destaques da Kihabbo (/v1/destaques), girando automaticamente */
export function DestaquesBanner() {
  const { data, error } = useAsync('destaques', (s) => getDestaques(s))
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)

  const items = data?.items ?? []
  const count = items.length
  const current = count ? index % count : 0

  useEffect(() => {
    if (count < 2 || paused || reducedMotion()) return
    const id = setInterval(() => setIndex((i) => (i + 1) % count), (data?.rotationSeconds ?? 15) * 1000)
    return () => clearInterval(id)
  }, [count, paused, data?.rotationSeconds])

  if (error || (data && !count)) return <div className={styles.placeholder}>Kihabbo — A Rádio do Habbo Hotel</div>
  if (!data) return <div className={`${styles.placeholder} ${styles.loading}`} />

  return (
    <div
      className={styles.banner}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      aria-roledescription="carrossel"
      aria-label="Destaques"
    >
      {items.map((d, i) => {
        const content = (
          <>
            <img src={d.imageUrl} alt="" loading={i === 0 ? 'eager' : 'lazy'} />
            <span className={styles.caption}>
              <strong>{d.title}</strong>
              {d.text && <small>{d.text}</small>}
            </span>
          </>
        )
        const common = {
          className: `${styles.slide} ${i === current ? styles.active : ''}`,
          'aria-hidden': i !== current,
          tabIndex: i === current ? 0 : -1,
        }
        return d.linkUrl ? (
          <a key={d.id} href={d.linkUrl} target="_blank" rel="noopener noreferrer" {...common}>
            {content}
          </a>
        ) : (
          <div key={d.id} {...common}>
            {content}
          </div>
        )
      })}

      {count > 1 && (
        <div className={styles.dots}>
          {items.map((d, i) => (
            <button
              key={d.id}
              type="button"
              className={i === current ? styles.dotActive : undefined}
              onClick={() => setIndex(i)}
              aria-label={`Ir para o destaque ${i + 1}`}
              aria-current={i === current}
            />
          ))}
        </div>
      )}
    </div>
  )
}
