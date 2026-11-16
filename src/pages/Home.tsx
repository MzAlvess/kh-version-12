import { Box } from '../components/Box/Box'
import { PageGrid } from '../components/PageGrid/PageGrid'
import { FindHabboBox } from '../features/FindHabbo/FindHabboBox'
import { HabboImagerBox } from '../features/HabboImager/HabboImagerBox'
import { NewBadgesBox } from '../features/NewBadges/NewBadgesBox'
import { useModal } from '../modals/modalContext'
import styles from './Home.module.css'

/**
 * Home do layout (coluna 860px + lateral 310px).
 * Caixas vazias = moldura para o backend: <Box title="Eventos" ...><EventosDoPainel /></Box>
 * As alturas mínimas reproduzem o tamanho de cada caixa no layout.
 */
export function Home({ userNick }: { userNick: string }) {
  const { openModal } = useModal()

  return (
    <PageGrid
      aside={
        <>
          <FindHabboBox initialNick={userNick} />

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
        </>
      }
    >
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

      {/* dados direto das APIs públicas do Habbo / HabboAssets (ver src/services/habbo.ts) */}
      <NewBadgesBox />
      <HabboImagerBox initialNick={userNick} />
    </PageGrid>
  )
}
