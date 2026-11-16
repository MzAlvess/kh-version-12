import { FormModal } from '../FormModal'
import type { ModalComponentProps } from '../types'
import styles from './forms.module.css'

export function Sair({ onClose, onSubmit, data }: ModalComponentProps) {
  return (
    <FormModal title="Sair" tone="red" size="sm" onClose={onClose} onSubmit={onSubmit} submitLabel="Sair da conta">
      <p className={styles.text}>
        Tem certeza que deseja sair, <strong>{data.user.nick}</strong>?
      </p>
    </FormModal>
  )
}
