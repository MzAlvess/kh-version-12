import { useAuth } from '../../auth/authContext'
import { Field, Input, Notice, Select, Textarea } from '../../components/Form/Form'
import { TICKET_CATEGORIES } from '../../services/kihabbo'
import { FormModal } from '../FormModal'
import type { ModalComponentProps } from '../types'

/** Ticket de suporte → POST /v1/support/tickets (exige login) */
export function AbrirTicket({ onClose, onSubmit }: ModalComponentProps) {
  const { user } = useAuth()
  return (
    <FormModal
      title="Abrir ticket"
      tone="orange"
      onClose={onClose}
      onSubmit={onSubmit}
      submitLabel="Abrir ticket"
      success={{
        title: 'Ticket aberto!',
        text: 'Nossa equipe vai responder em breve. Você recebe uma notificação quando houver resposta.',
      }}
    >
      {!user && <Notice>Você precisa entrar com sua conta Habbo para abrir um ticket.</Notice>}
      <TicketFields />
    </FormModal>
  )
}

/** Campos do ticket (usados também na página Utilidades › Contato) */
export function TicketFields() {
  return (
    <>
      <Field label="Categoria" name="assunto" required>
        <Select name="assunto" required defaultValue="">
          <option value="" disabled>
            Selecione...
          </option>
          {TICKET_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </Select>
      </Field>

      <Field label="Assunto" name="titulo" required>
        <Input name="titulo" required maxLength={150} placeholder="Resumo do seu problema" />
      </Field>

      <Field label="Mensagem" name="mensagem" required>
        <Textarea name="mensagem" rows={6} required minLength={10} maxLength={5000} placeholder="Descreva com detalhes..." />
      </Field>
    </>
  )
}
