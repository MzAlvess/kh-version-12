import { Field, FormRow, ImageUpload, Input, Select, Textarea } from '../../components/Form/Form'
import { FormModal } from '../FormModal'
import type { ModalComponentProps } from '../types'

export function NotificarEvento({ onClose, onSubmit }: ModalComponentProps) {
  return (
    <FormModal
      title="Notificar evento"
      tone="green"
      onClose={onClose}
      onSubmit={onSubmit}
      submitLabel="Notificar evento"
      success={{
        title: 'Evento enviado!',
        text: 'A equipe vai revisar as informações. Assim que for aprovado, ele aparece na lista de eventos.',
      }}
    >
      <Field label="Nome do evento" name="nome" required>
        <Input name="nome" required maxLength={80} placeholder="Ex.: Habblindados: Evento mensal de abril" />
      </Field>

      <FormRow>
        <Field label="Categoria" name="categoria" required>
          <Select name="categoria" required defaultValue="">
            <option value="" disabled>
              Selecione...
            </option>
            <option value="habblindados">#Habblindados</option>
            <option value="oficial">Oficial</option>
            <option value="comunidade">Comunidade</option>
            <option value="promocao">Promoção</option>
          </Select>
        </Field>
        <Field label="Premiação (moedas)" name="premiacao" hint="Deixe em branco se não houver prêmio.">
          <Input name="premiacao" type="number" min={0} step={1} inputMode="numeric" placeholder="50" />
        </Field>
      </FormRow>

      <FormRow>
        <Field label="Data" name="data" required>
          <Input name="data" type="date" required />
        </Field>
        <Field label="Horário" name="horario" required>
          <Input name="horario" type="time" required />
        </Field>
      </FormRow>

      <Field label="Quarto" name="quarto" required hint="Nome do quarto ou link para ele no hotel.">
        <Input name="quarto" required maxLength={120} placeholder="Ex.: Arena Habblindados" />
      </Field>

      <Field label="Descrição" name="descricao">
        <Textarea name="descricao" rows={4} maxLength={500} placeholder="Como funciona, regras, quem organiza..." />
      </Field>

      <Field label="Banner" name="banner" hint="Aparece no card do evento.">
        <ImageUpload name="banner" aspect="16 / 5" />
      </Field>
    </FormModal>
  )
}
