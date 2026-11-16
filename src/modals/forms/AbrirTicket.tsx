import { Field, ImageUpload, Input, Select, Textarea } from '../../components/Form/Form'
import { FormModal } from '../FormModal'
import type { ModalComponentProps } from '../types'

export function AbrirTicket({ onClose, onSubmit }: ModalComponentProps) {
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
      <Field label="Assunto" name="assunto" required>
        <Select name="assunto" required defaultValue="">
          <option value="" disabled>
            Selecione...
          </option>
          <option value="suporte">Suporte</option>
          <option value="fichas">Fichas</option>
          <option value="denuncia">Denúncia</option>
          <option value="bug">Problema no site</option>
          <option value="sugestao">Sugestão</option>
        </Select>
      </Field>

      <Field label="Título" name="titulo" required>
        <Input name="titulo" required maxLength={80} placeholder="Resuma o que aconteceu" />
      </Field>

      <Field label="Mensagem" name="mensagem" required>
        <Textarea name="mensagem" rows={6} required minLength={10} maxLength={1000} />
      </Field>

      <Field label="Anexo" name="anexo" hint="Opcional: um print ajuda a resolver mais rápido.">
        <ImageUpload name="anexo" aspect="16 / 5" />
      </Field>
    </FormModal>
  )
}
