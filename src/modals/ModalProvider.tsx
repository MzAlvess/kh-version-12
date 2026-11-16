import { useCallback, useMemo, useState, type ComponentType, type ReactNode } from 'react'
import { ModalContext } from './modalContext'
import { samplePolls } from './sampleData'
import type { ModalComponentProps, ModalData, ModalHandlers, ModalName, PageFormName, SubmitHandler } from './types'
import { AbrirTicket } from './forms/AbrirTicket'
import { Config } from './forms/Config'
import { Enquetes } from './forms/Enquetes'
import { GerarFichas } from './forms/GerarFichas'
import { Habbo } from './forms/Habbo'
import { NotificarEvento } from './forms/NotificarEvento'
import { PostarArtigo } from './forms/PostarArtigo'
import { Sair } from './forms/Sair'
import { VotarEnquete } from './forms/VotarEnquete'

/** Registro: nome do modal → componente */
const registry: Record<ModalName, ComponentType<ModalComponentProps>> = {
  'notificar-evento': NotificarEvento,
  'postar-artigo': PostarArtigo,
  'votar-enquete': VotarEnquete,
  'abrir-ticket': AbrirTicket,
  sair: Sair,
  'gerar-fichas': GerarFichas,
  enquetes: Enquetes,
  config: Config,
  habbo: Habbo,
}

/** Enquanto o backend não liga um modal: mostra os dados no console e simula o envio. */
const fallbackHandler =
  (name: ModalName | PageFormName): SubmitHandler =>
  async (values) => {
    console.info(`[modal:${name}] enviar`, values)
    await new Promise((resolve) => setTimeout(resolve, 700))
  }

interface ModalProviderProps {
  /** Funções de envio por modal. Ex.: { 'postar-artigo': (v) => api.post('/artigos', v) } */
  handlers?: ModalHandlers
  user: ModalData['user']
  polls?: ModalData['polls']
  destaquePollId?: string
  children: ReactNode
}

export function ModalProvider({
  handlers = {},
  user,
  polls = samplePolls,
  destaquePollId = 'habbo-stars',
  children,
}: ModalProviderProps) {
  const [active, setActive] = useState<ModalName | null>(null)

  const openModal = useCallback((name: ModalName) => setActive(name), [])
  const closeModal = useCallback(() => setActive(null), [])
  const getHandler = useCallback(
    (name: ModalName | PageFormName) => handlers[name] ?? fallbackHandler(name),
    [handlers],
  )
  const ctx = useMemo(() => ({ openModal, closeModal, getHandler }), [openModal, closeModal, getHandler])

  const ActiveModal = active ? registry[active] : null

  return (
    <ModalContext.Provider value={ctx}>
      {children}
      {active && ActiveModal && (
        <ActiveModal
          key={active}
          onClose={closeModal}
          onSubmit={getHandler(active)}
          data={{ user, polls, destaquePollId }}
        />
      )}
    </ModalContext.Provider>
  )
}
