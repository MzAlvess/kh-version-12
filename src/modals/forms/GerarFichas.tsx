import { Field, Input, Notice } from '../../components/Form/Form'
import { FormModal } from '../FormModal'
import type { ModalComponentProps } from '../types'
import styles from './forms.module.css'

/* Estrutura genérica: ajustar quando a regra de "gerar fichas" estiver definida. */
export function GerarFichas({ onClose, onSubmit, data }: ModalComponentProps) {
  return (
    <FormModal
      title="Gerar fichas"
      tone="yellow"
      size="sm"
      onClose={onClose}
      onSubmit={onSubmit}
      submitLabel="Resgatar fichas"
      success={{ title: 'Fichas creditadas!', text: 'O novo saldo já aparece no topo do site.' }}
    >
      <div className={styles.balance}>
        <span className={styles.coin}>F</span>
        <span>
          Seu saldo
          <br />
          <strong>{data.user.fichas.toLocaleString('pt-BR')}</strong> fichas
        </span>
      </div>

      <Field label="Código de resgate" name="codigo" required hint="Formato: XXXX-XXXX">
        <Input
          name="codigo"
          required
          autoComplete="off"
          placeholder="ABCD-1234"
          pattern="[A-Za-z0-9]{4}-[A-Za-z0-9]{4}"
          title="Use o formato XXXX-XXXX"
          maxLength={9}
          style={{ textTransform: 'uppercase', letterSpacing: '0.08em' }}
        />
      </Field>

      <Notice>Os códigos são distribuídos em eventos oficiais e durante os programas da rádio.</Notice>
    </FormModal>
  )
}
