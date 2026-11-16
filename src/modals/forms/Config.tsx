import { Field, Select, Switch, Textarea } from '../../components/Form/Form'
import { FormModal } from '../FormModal'
import type { ModalComponentProps } from '../types'

/* Estrutura genérica: ajustar com as configurações reais do painel. */
export function Config({ onClose, onSubmit }: ModalComponentProps) {
  return (
    <FormModal
      title="Configurações"
      tone="cyan"
      onClose={onClose}
      onSubmit={onSubmit}
      submitLabel="Salvar"
      success={{ title: 'Configurações salvas!' }}
    >
      <Field label="Missão" name="missao" hint="Aparece no seu perfil do Kihabbo.">
        <Textarea name="missao" rows={2} maxLength={60} />
      </Field>

      <Field label="Quem pode ver meu perfil" name="visibilidade">
        <Select name="visibilidade" defaultValue="todos">
          <option value="todos">Todos</option>
          <option value="amigos">Apenas amigos</option>
          <option value="ninguem">Ninguém</option>
        </Select>
      </Field>

      <Switch
        name="notificar_eventos"
        label="Notificações de eventos"
        description="Avisar quando um evento estiver para começar."
        defaultChecked
      />
      <Switch name="mostrar_online" label="Mostrar quando estou online" defaultChecked />
      <Switch name="radio_auto" label="Tocar a rádio ao abrir o site" />
    </FormModal>
  )
}
