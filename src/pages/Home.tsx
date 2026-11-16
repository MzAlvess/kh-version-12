import { Box } from '../components/Box/Box'
import { PageGrid } from '../components/PageGrid/PageGrid'
import { EventsBox } from '../features/Agenda/EventsBox'
import { FindHabboBox } from '../features/FindHabbo/FindHabboBox'
import { AtacadaoBox } from '../features/Market/AtacadaoBox'
import { HabboImagerBox } from '../features/HabboImager/HabboImagerBox'
import { LatestNewsBox } from '../features/News/LatestNewsBox'
import { NewBadgesBox } from '../features/NewBadges/NewBadgesBox'
import { useModal } from '../modals/modalContext'

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
          <FindHabboBox key={userNick} initialNick={userNick} />

          <EventsBox id="eventos-oficiais" title="Eventos oficiais" accent="orange" minBodyHeight={200} />

          <AtacadaoBox />
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

      {/* últimas notícias da equipe (API do Kihabbo) */}
      <LatestNewsBox />

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
      <HabboImagerBox key={userNick} initialNick={userNick} />
    </PageGrid>
  )
}
