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
  | 'entrar'

/** Função que o backend implementa para cada modal. Lançar um Error mostra a mensagem no modal. */
export type SubmitHandler = (values: FormValues) => void | Promise<void>

/** Formulários que ficam dentro das páginas (não são modais) */
export type PageFormName = 'faca-parte' | 'contato'

export type ModalHandlers = Partial<Record<ModalName | PageFormName, SubmitHandler>>

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
