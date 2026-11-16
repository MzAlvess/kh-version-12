import { useState } from 'react'
import { Button } from '../../components/Button/Button'
import { Field, FormRow, Input, Notice, Select } from '../../components/Form/Form'
import { FormModal } from '../FormModal'
import type { ModalComponentProps } from '../types'
import styles from './forms.module.css'

const newCode = () => `KH-${Math.floor(1000 + Math.random() * 9000)}`

/* Estrutura genérica: vincular a conta do Habbo verificando um código na missão. */
export function Habbo({ onClose, onSubmit }: ModalComponentProps) {
  const [code] = useState(newCode)
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
    } catch {
      setCopied(false)
    }
  }

  return (
    <FormModal
      title="Conta do Habbo"
      tone="green"
      onClose={onClose}
      onSubmit={onSubmit}
      submitLabel="Verificar conta"
      success={{ title: 'Conta vinculada!', text: 'Pode remover o código da sua missão.' }}
    >
      <FormRow>
        <Field label="Nick no Habbo" name="nick" required>
          <Input name="nick" required maxLength={32} autoComplete="off" placeholder="Seu nick" />
        </Field>
        <Field label="Hotel" name="hotel" required>
          <Select name="hotel" required defaultValue="com.br">
            <option value="com.br">Brasil (.com.br)</option>
            <option value="com">Internacional (.com)</option>
            <option value="es">España (.es)</option>
            <option value="fr">France (.fr)</option>
            <option value="de">Deutschland (.de)</option>
            <option value="it">Italia (.it)</option>
            <option value="nl">Nederland (.nl)</option>
            <option value="fi">Suomi (.fi)</option>
            <option value="com.tr">Türkiye (.com.tr)</option>
          </Select>
        </Field>
      </FormRow>

      <Notice>Coloque o código abaixo na sua missão do Habbo e depois clique em “Verificar conta”.</Notice>

      <div className={styles.code}>
        <strong>{code}</strong>
        <Button tone="ghost" className={styles.copy} onClick={copy}>
          {copied ? 'Copiado!' : 'Copiar'}
        </Button>
      </div>
      <input type="hidden" name="codigo" value={code} />
    </FormModal>
  )
}
