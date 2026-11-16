import { useId, useState, type ReactNode } from 'react'
import { Button, type Tone } from '../components/Button/Button'
import { Form, Notice } from '../components/Form/Form'
import { Icon } from '../components/Icon/Icon'
import { Modal } from '../components/Modal/Modal'
import type { SubmitHandler } from './types'
import styles from './FormModal.module.css'

interface FormModalProps {
  title: string
  tone: Tone
  size?: 'sm' | 'md' | 'lg'
  onClose: () => void
  onSubmit: SubmitHandler
  /** sem submitLabel o botão de enviar não aparece */
  submitLabel?: string
  cancelLabel?: string
  /** tela de sucesso; sem ela o modal fecha ao concluir */
  success?: { title: string; text?: string }
  children: ReactNode
}

type Status = 'idle' | 'sending' | 'done'

/** Modal + formulário com estados de envio, erro e sucesso. */
export function FormModal({
  title,
  tone,
  size = 'md',
  onClose,
  onSubmit,
  submitLabel,
  cancelLabel = 'Cancelar',
  success,
  children,
}: FormModalProps) {
  const formId = useId()
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (values: Parameters<SubmitHandler>[0]) => {
    setStatus('sending')
    setError(null)
    try {
      await onSubmit(values)
      if (success) setStatus('done')
      else onClose()
    } catch (err) {
      setStatus('idle')
      setError(err instanceof Error && err.message ? err.message : 'Não foi possível enviar. Tente novamente.')
    }
  }

  if (status === 'done' && success) {
    return (
      <Modal
        title={title}
        tone={tone}
        size={size}
        onClose={onClose}
        footer={
          <Button tone={tone} onClick={onClose}>
            Fechar
          </Button>
        }
      >
        <div className={styles.success}>
          <span className={`${styles.successIcon} tone-${tone}`}>
            <Icon name="check" size={34} />
          </span>
          <strong>{success.title}</strong>
          {success.text && <p>{success.text}</p>}
        </div>
      </Modal>
    )
  }

  const sending = status === 'sending'

  return (
    <Modal
      title={title}
      tone={tone}
      size={size}
      onClose={onClose}
      locked={sending}
      footer={
        <>
          <Button tone="ghost" onClick={onClose} disabled={sending}>
            {cancelLabel}
          </Button>
          {submitLabel && (
            <Button tone={tone} type="submit" form={formId} loading={sending}>
              {submitLabel}
            </Button>
          )}
        </>
      }
    >
      <Form id={formId} onSubmit={handleSubmit}>
        {error && <Notice tone="error">{error}</Notice>}
        {children}
      </Form>
    </Modal>
  )
}
