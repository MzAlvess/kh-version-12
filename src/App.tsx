import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { useAsync } from './hooks/useAsync'
import { Layout } from './layout/Layout'
import { ModalProvider } from './modals/ModalProvider'
import { samplePolls } from './modals/sampleData'
import type { ModalHandlers, Poll } from './modals/types'
import { HabboHotelPage } from './pages/HabboHotelPage'
import { Home } from './pages/Home'
import { KihabboPage } from './pages/KihabboPage'
import { NoticiaPage } from './pages/NoticiaPage'
import { NoticiasPage } from './pages/NoticiasPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { RadioPage } from './pages/RadioPage'
import { UtilidadesPage } from './pages/UtilidadesPage'
import { getPollCategories } from './services/kihabbo'

// Dados de exemplo — o backend substitui pelos dados reais da sessão.
const user = { nick: 'DinhuLOL', fichas: 600 }

/**
 * Envio de cada modal/formulário. Os que não estiverem aqui só mostram os dados no console (simulação).
 * Ex.: 'postar-artigo': (values) => api.post('/artigos', values)
 * Para mostrar erro no formulário, basta lançar: throw new Error('Mensagem')
 * Formulários de página: 'faca-parte' (Utilidades › Faça parte da equipe) e 'contato' (Utilidades › Contato).
 */
const handlers: ModalHandlers = {}

export default function App() {
  // votações "Melhores da rodada" da API do Kihabbo alimentam os modais de enquete
  const pollData = useAsync('polls-modal', (s) => getPollCategories(s))
  const polls: Poll[] = pollData.data?.length
    ? pollData.data.map((c) => ({
        id: c.id,
        pergunta: c.title,
        descricao: 'Melhores da rodada',
        opcoes: c.options.map((o) => ({ value: o.id, label: o.label })),
      }))
    : samplePolls

  return (
    <BrowserRouter>
      <ModalProvider user={user} handlers={handlers} polls={polls} destaquePollId={polls[0]?.id}>
        <Routes>
          <Route element={<Layout user={user} />}>
            <Route index element={<Home userNick={user.nick} />} />
            <Route path="kihabbo" element={<KihabboPage userNick={user.nick} />} />
            <Route path="habbo-hotel" element={<HabboHotelPage userNick={user.nick} />} />
            <Route path="noticias" element={<NoticiasPage userNick={user.nick} />} />
            <Route path="noticias/:slug" element={<NoticiaPage userNick={user.nick} />} />
            <Route path="radio" element={<RadioPage userNick={user.nick} />} />
            <Route path="utilidades" element={<UtilidadesPage userNick={user.nick} />} />
            <Route path="*" element={<NotFoundPage userNick={user.nick} />} />
          </Route>
        </Routes>
      </ModalProvider>
    </BrowserRouter>
  )
}
