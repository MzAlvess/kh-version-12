import { useMemo } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { useAuth } from './auth/authContext'
import { useAsync } from './hooks/useAsync'
import type { HeaderUser } from './layout/Header/Header'
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
import { BANNED_MESSAGE, createTicket, getPollCategories, votePoll } from './services/kihabbo'

/** nick usado nas caixas "Encontrar habbo" e "Habbo imager" quando ninguém está logado */
const DEFAULT_NICK = 'DinhuLOL'

const LOGIN_REQUIRED = 'Entre com sua conta Habbo (botão "Entrar" no topo) para continuar.'

export default function App() {
  const auth = useAuth()

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

  const headerUser: HeaderUser | null = auth.user
    ? // a conta do Kihabbo ainda não tem saldo de fichas: mostra 0 para manter a pílula (e o "Gerar fichas")
      { nick: auth.user.displayName, fichas: auth.user.fichas ?? 0, avatarNick: auth.user.avatarUser }
    : null

  /**
   * Envio de cada modal/formulário. Os que não estiverem aqui só mostram os dados no console (simulação):
   * notificar-evento, postar-artigo, gerar-fichas, config, habbo e faca-parte ainda não têm rota pública na API.
   * Para mostrar erro no formulário, basta lançar: throw new Error('Mensagem')
   */
  const handlers = useMemo<ModalHandlers>(() => {
    const requireLogin = () => {
      if (!auth.user) throw new Error(LOGIN_REQUIRED)
    }
    const sendTicket = async (v: Record<string, unknown>) => {
      requireLogin()
      await createTicket({ category: String(v.assunto), subject: String(v.titulo), message: String(v.mensagem) })
    }
    const sendVote = async (v: Record<string, unknown>) => {
      requireLogin()
      if (auth.user?.banned) throw new Error(BANNED_MESSAGE)
      await votePoll(String(v.enquete), String(v.opcao))
    }
    return {
      sair: () => auth.logout(),
      'abrir-ticket': sendTicket,
      contato: sendTicket,
      'votar-enquete': sendVote,
      enquetes: sendVote,
    }
  }, [auth])

  const nick = auth.user?.avatarUser ?? DEFAULT_NICK

  return (
    <BrowserRouter>
      <ModalProvider
        user={{ nick: auth.user?.displayName ?? 'visitante', fichas: auth.user?.fichas ?? 0 }}
        handlers={handlers}
        polls={polls}
        destaquePollId={polls[0]?.id}
      >
        <Routes>
          <Route element={<Layout user={headerUser} authLoading={auth.status === 'loading'} />}>
            <Route index element={<Home userNick={nick} />} />
            <Route path="kihabbo" element={<KihabboPage userNick={nick} />} />
            <Route path="habbo-hotel" element={<HabboHotelPage userNick={nick} />} />
            <Route path="noticias" element={<NoticiasPage userNick={nick} />} />
            <Route path="noticias/:slug" element={<NoticiaPage userNick={nick} />} />
            <Route path="radio" element={<RadioPage userNick={nick} />} />
            <Route path="utilidades" element={<UtilidadesPage userNick={nick} />} />
            <Route path="*" element={<NotFoundPage userNick={nick} />} />
          </Route>
        </Routes>
      </ModalProvider>
    </BrowserRouter>
  )
}
