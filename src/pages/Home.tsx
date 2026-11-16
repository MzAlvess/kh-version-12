import { Box } from '../components/Box/Box'
import { useModal } from '../modals/modalContext'
import styles from './Home.module.css'

/**
 * Grade principal da home (coluna 860px + lateral 310px).
 * Cada <Box> é só a moldura: o backend coloca o componente do painel como children.
 *   <Box title="Eventos" ...><EventosDoPainel /></Box>
 * As alturas mínimas reproduzem o tamanho de cada caixa no layout.
 */
export function Home() {
  const { openModal } = useModal()

  return (
    <main className={`container ${styles.grid}`}>
      <div className={styles.main}>
        <Box
          id="eventos"
          title="Eventos"
          accent="green"
          primaryAction={{ label: 'Notificar evento', onClick: () => openModal('notificar-evento') }}
          search={{ placeholder: 'Pesquisar...' }}
          minBodyHeight={232}
        />

        <Box
          id="voz-da-comunidade"
          title="Voz da comunidade"
          accent="green"
          primaryAction={{ label: 'Postar artigo', onClick: () => openModal('postar-artigo') }}
          search={{ placeholder: 'Pesquisar...' }}
          minBodyHeight={446}
        />

        <Box
          id="novos-emblemas"
          title="Novos emblemas"
          accent="pink"
          sideStrip={{ color: 'pink', icon: <img src="/assets/strip-emblemas.png" alt="" width={31} height={32} /> }}
          minBodyHeight={110}
        />

        <Box
          id="habbo-imager"
          title="Habbo imager"
          accent="teal"
          sideStrip={{ color: 'teal', icon: <img src="/assets/strip-imager.png" alt="" width={32} height={39} /> }}
          search={{ placeholder: 'Pesquisar habbo...' }}
          minBodyHeight={515}
        />
      </div>

      <aside className={styles.side}>
        <Box
          id="encontrar-habbo"
          variant="dark"
          title="Encontrar habbo"
          accent="pink"
          search={{ placeholder: 'Encontrar...' }}
          minBodyHeight={359}
        />

        <Box id="eventos-oficiais" variant="dark" title="Eventos oficiais" accent="orange" minBodyHeight={337} />

        <Box
          id="atacadao"
          variant="dark"
          title="Atacadão"
          accent="green"
          minBodyHeight={472}
          footer={
            <a href="/atacadao" className={styles.verTodos}>
              Ver todos
            </a>
          }
        />
      </aside>
    </main>
  )
}
