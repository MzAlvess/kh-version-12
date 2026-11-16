import styles from './CloudLayer.module.css'

/**
 * Nuvens (arte original nuvens 2.png) atravessando o header em loop contínuo.
 * A faixa é 1 tile mais larga que a tela e anda exatamente 1 tile: o recomeço é invisível.
 */
export function CloudLayer() {
  return (
    <div className={styles.sky} aria-hidden="true">
      <div className={styles.layer} />
    </div>
  )
}
