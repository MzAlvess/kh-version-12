import { IsoTile } from '../../components/IsoTile/IsoTile'
import { menuLeft, menuRight, type MenuItem } from './menu'
import { UserHub } from './UserHub'
import type { HeaderUser } from './Header'
import styles from './MenuBar.module.css'

function MenuTile({ item }: { item: MenuItem }) {
  return (
    <li className={styles.item}>
      <a href={item.href} className={styles.tile}>
        <IsoTile width={100} thickness={9} className={styles.base} />
        <img src="/assets/menu/tile-shadow.png" alt="" width={40} height={10} className={styles.shadow} />
        {/* ícones em tamanho natural: pixel art não pode ser redimensionada */}
        <img src={item.icon} alt="" className={`${styles.icon} pixel`} />
        <span className={styles.label}>{item.label}</span>
      </a>
    </li>
  )
}

export function MenuBar({ user }: { user: HeaderUser }) {
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
    </nav>
  )
}
