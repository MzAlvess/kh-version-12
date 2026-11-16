import type { FormValues } from '../components/Form/formContext'
import type { ChoiceOption } from '../components/Form/Form'

export type ModalName =
  | 'notificar-evento'
  | 'postar-artigo'
  | 'votar-enquete'
  | 'abrir-ticket'
  | 'sair'
  | 'gerar-fichas'
  | 'enquetes'
  | 'config'
  | 'habbo'

/** Função que o backend implementa para cada modal. Lançar um Error mostra a mensagem no modal. */
export type SubmitHandler = (values: FormValues) => void | Promise<void>

export type ModalHandlers = Partial<Record<ModalName, SubmitHandler>>

export interface Poll {
  id: string
  pergunta: string
  descricao?: string
  opcoes: ChoiceOption[]
}

export interface ModalData {
  user: { nick: string; fichas: number }
  polls: Poll[]
  /** id da enquete que o botão "Votar na enquete" (Habbo Stars) abre */
  destaquePollId: string
}

/** Props que todo modal registrado recebe */
export interface ModalComponentProps {
  onClose: () => void
  onSubmit: SubmitHandler
  data: ModalData
}
