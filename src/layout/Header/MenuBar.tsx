import { useEffect, useRef } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { IsoTile } from '../../components/IsoTile/IsoTile'
import { menuLeft, menuRight, type MenuItem } from './menu'
import { UserHub } from './UserHub'
import type { HeaderUser } from './Header'
import styles from './MenuBar.module.css'

function MenuTile({ item }: { item: MenuItem }) {
  return (
    <li className={styles.item}>
      <NavLink
        to={item.href}
        end={item.href === '/'}
        aria-label={item.label}
        className={({ isActive }) => `${styles.tile} ${isActive ? styles.current : ''}`}
      >
        <IsoTile width={100} thickness={9} className={styles.base} />
        <img src="/assets/menu/tile-shadow.png" alt="" width={40} height={10} className={styles.shadow} />
        {/* ícones em tamanho natural: pixel art não pode ser redimensionada */}
        <img src={item.icon} alt="" className={`${styles.icon} pixel`} />
        <span className={styles.label} aria-hidden="true">
          {item.label}
        </span>
      </NavLink>
    </li>
  )
}

export function MenuBar({ user }: { user: HeaderUser | null }) {
  const { pathname } = useLocation()
  const mobileRow = useRef<HTMLUListElement>(null)

  // celular: rola a linha até o tile da página atual (só na horizontal, sem mexer na página)
  useEffect(() => {
    const row = mobileRow.current
    const current = row?.querySelector<HTMLElement>('[aria-current="page"]')
    if (!row || !current || row.scrollWidth <= row.clientWidth) return
    const li = current.parentElement ?? current
    row.scrollLeft = li.offsetLeft - (row.clientWidth - li.offsetWidth) / 2
  }, [pathname])

  return (
    <nav className={`container ${styles.bar}`} aria-label="Menu principal">
      <ul className={`${styles.group} ${styles.left}`}>
        {menuLeft.map((item) => (
          <MenuTile key={item.id} item={item} />
        ))}
      </ul>

      <div className={styles.hub}>
        <UserHub user={user} />
      </div>

      <ul className={`${styles.group} ${styles.right}`}>
        {menuRight.map((item) => (
          <MenuTile key={item.id} item={item} />
        ))}
      </ul>

      {/* celular: os 6 tiles numa linha só, com rolagem lateral e o nome visível (não há hover no toque) */}
      <ul ref={mobileRow} className={styles.mobileRow}>
        {[...menuLeft, ...menuRight].map((item) => (
          <MenuTile key={item.id} item={item} />
        ))}
      </ul>
    </nav>
  )
}
