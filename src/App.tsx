import { Header } from './layout/Header/Header'
import { RadioPanel } from './layout/RadioPanel/RadioPanel'
import { Footer } from './layout/Footer/Footer'
import { Home } from './pages/Home'
import { ModalProvider } from './modals/ModalProvider'
import type { ModalHandlers } from './modals/types'

// Dados de exemplo — o backend substitui pelos dados reais da sessão / rádio.
const user = { nick: 'DinhuLOL', fichas: 600 }
const radio = {
  locutor: 'Dinho...lol',
  programa: 'Show do Coelho',
  musica: 'Exclusivo.mp3 - Emilia feat. Tropkillaz',
}

/**
 * Envio de cada modal. Os que não estiverem aqui só mostram os dados no console (simulação).
 * Ex.: 'postar-artigo': (values) => api.post('/artigos', values)
 * Para mostrar erro no modal, basta lançar: throw new Error('Mensagem')
 */
const handlers: ModalHandlers = {}

export default function App() {
  return (
    <ModalProvider user={user} handlers={handlers}>
      <Header user={user} />
      <RadioPanel {...radio} />
      <Home userNick={user.nick} />
      <Footer />
    </ModalProvider>
  )
}
