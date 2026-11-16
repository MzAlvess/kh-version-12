import { useState, type ReactNode } from 'react'
import { Button, type Tone } from '../Button/Button'
import { Icon } from '../Icon/Icon'
import { Form, Notice } from './Form'
import type { FormValues } from './formContext'
import styles from './InlineForm.module.css'

interface InlineFormProps {
  tone: Tone
  submitLabel: string
  onSubmit: (values: FormValues) => void | Promise<void>
  success: { title: string; text?: string }
  children: ReactNode
}

/** Formulário dentro da página, com os mesmos estados do modal (enviando, erro, sucesso). */
export function InlineForm({ tone, submitLabel, onSubmit, success, children }: InlineFormProps) {
  const [status, setStatus] = useState<'idle' | 'sending' | 'done'>('idle')
  const [error, setError] = useState<string | null>(null)
  const [round, setRound] = useState(0) // remonta o form ao enviar outro

  const handleSubmit = async (values: FormValues) => {
    setStatus('sending')
    setError(null)
    try {
      await onSubmit(values)
      setStatus('done')
    } catch (err) {
      setStatus('idle')
      setError(err instanceof Error && err.message ? err.message : 'Não foi possível enviar. Tente novamente.')
    }
  }

  if (status === 'done') {
    return (
      <div className={styles.success} role="status">
        <span className={`${styles.icon} tone-${tone}`}>
          <Icon name="check" size={30} />
        </span>
        <strong>{success.title}</strong>
        {success.text && <p>{success.text}</p>}
        <Button
          tone="ghost"
          onClick={() => {
            setStatus('idle')
            setRound((r) => r + 1)
          }}
        >
          Enviar outro
        </Button>
      </div>
    )
  }

  return (
    <div className={`tone-${tone}`}>
      <Form key={round} onSubmit={handleSubmit}>
        {error && <Notice tone="error">{error}</Notice>}
        {children}
        <div className={styles.actions}>
          <Button tone={tone} type="submit" loading={status === 'sending'}>
            {submitLabel}
          </Button>
        </div>
      </Form>
    </div>
  )
}
