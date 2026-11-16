import styles from './Footer.module.css'

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.inner}`}>
        <img
          src="/assets/footer-mascote.png"
          alt=""
          width={280}
          height={230}
          className={`${styles.mascot} pixel`}
        />

        <div className={styles.text}>
          <p className={styles.copy}>Copyright © Todos os direitos reservados. Kihabbo 2010 - {year}.</p>
          <p className={styles.disclaimer}>
            Esta Fã Site não está afiliada com, patrocinada por, apoiada por, ou principalmente aprovada pela Sulake
            Oy ou suas empresas Afiliadas. Esta Fã Site pode utilizar as marcas registradas e outras propriedades
            intelectuais do Habbo, que estão permitidas sob a Política de Fã Sites Habbo.
          </p>
          <p className={styles.credits}>
            <span>
              <img src="/assets/credit-pencil.png" alt="" width={18} height={18} className="pixel" />
              DinhuLOL
            </span>
            <span>
              <img src="/assets/credit-marcell.png" alt="" width={18} height={18} className="pixel" />
              Marcell
            </span>
          </p>
        </div>

        <img src="/assets/fansite.png" alt="Habbo Fansite" width={135} height={80} className={`${styles.badge} pixel`} />
      </div>
    </footer>
  )
}
