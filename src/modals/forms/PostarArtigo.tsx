import { Field, FormRow, ImageUpload, Input, Select, Switch, Textarea } from '../../components/Form/Form'
import { FormModal } from '../FormModal'
import type { ModalComponentProps } from '../types'

export function PostarArtigo({ onClose, onSubmit }: ModalComponentProps) {
  return (
    <FormModal
      title="Postar artigo"
      tone="green"
      size="lg"
      onClose={onClose}
      onSubmit={onSubmit}
      submitLabel="Publicar artigo"
      success={{
        title: 'Artigo enviado!',
        text: 'Seu artigo foi para a moderação e logo aparece em Voz da comunidade.',
      }}
    >
      <FormRow>
        <Field label="Título" name="titulo" required>
          <Input name="titulo" required maxLength={90} placeholder="Ex.: Novos raros são encontrados" />
        </Field>
        <Field label="Categoria" name="categoria" required>
          <Select name="categoria" required defaultValue="">
            <option value="" disabled>
              Selecione...
            </option>
            <option value="habbo">#Habbo</option>
            <option value="kihabbo">#Kihabbo</option>
            <option value="eventos">#Eventos</option>
            <option value="raros">#Raros</option>
          </Select>
        </Field>
      </FormRow>

      <Field label="Imagem de capa" name="capa" required>
        <ImageUpload name="capa" required aspect="16 / 5" />
      </Field>

      <Field label="Resumo" name="resumo" hint="Texto curto que aparece no card do artigo.">
        <Textarea name="resumo" rows={2} maxLength={160} />
      </Field>

      <Field label="Conteúdo" name="conteudo" required>
        <Textarea name="conteudo" rows={9} required maxLength={5000} placeholder="Escreva seu artigo..." />
      </Field>

      <Switch name="comentarios" label="Permitir comentários" defaultChecked />
    </FormModal>
  )
}
