import { useState } from 'react'
import { useAuth } from '../../auth/authContext'
import { Button } from '../../components/Button/Button'
import { Field, Form, Input, Notice } from '../../components/Form/Form'
import { Modal } from '../../components/Modal/Modal'
import { createChallenge, verifyChallenge, type MissionChallenge } from '../../services/kihabbo'
import type { ModalComponentProps } from '../types'
import styles from './forms.module.css'

const errorText = (err: unknown, fallback: string) => (err instanceof Error && err.message ? err.message : fallback)

/** Login pela missão do Habbo (mesmo fluxo do kihabbo.com.br) */
export function Entrar({ onClose }: ModalComponentProps) {
  const { refresh } = useAuth()
  const [nick, setNick] = useState('')
  const [challenge, setChallenge] = useState<MissionChallenge | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const generate = async (habboName: string) => {
    setBusy(true)
    setError(null)
    try {
      setChallenge(await createChallenge(habboName))
      setNick(habboName)
      setCopied(false)
    } catch (err) {
      setError(errorText(err, 'Não foi possível gerar o código. Confira o nick e tente de novo.'))
    } finally {
      setBusy(false)
    }
  }

  const confirm = async () => {
    if (!challenge) return
    setBusy(true)
    setError(null)
    try {
      await verifyChallenge(challenge.challengeId)
      const user = await refresh()
      if (!user) throw new Error('Login confirmado, mas a sessão não foi criada. Tente de novo.')
      onClose()
    } catch (err) {
      setError(errorText(err, 'Ainda não encontramos o código na sua missão. Confira e tente de novo.'))
    } finally {
      setBusy(false)
    }
  }

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(challenge?.code ?? '')
      setCopied(true)
    } catch {
      setCopied(false)
    }
  }

  return (
    <Modal
      title="Entrar"
      tone="green"
      size="sm"
      onClose={onClose}
      locked={busy}
      footer={
        challenge ? (
          <>
            <Button tone="ghost" onClick={() => setChallenge(null)} disabled={busy}>
              Trocar nick
            </Button>
            <Button tone="green" onClick={confirm} loading={busy}>
              Já coloquei, confirmar
            </Button>
          </>
        ) : (
          <Button tone="green" type="submit" form="form-entrar" loading={busy}>
            Gerar código da missão
          </Button>
        )
      }
    >
      <div className={styles.login}>
        <p className={styles.text}>Entre para comentar, curtir, votar nas enquetes e falar com a equipe.</p>
        {error && <Notice tone="error">{error}</Notice>}

        {!challenge ? (
          <FormNick defaultNick={nick} onSubmit={generate} />
        ) : (
          <>
            <p className={styles.text}>
              Coloque este código na <strong>missão</strong> do seu Habbo <strong>{nick}</strong> e volte aqui para
              confirmar:
            </p>
            <div className={styles.code}>
              <strong>{challenge.code}</strong>
              <Button tone="ghost" className={styles.copy} onClick={copy}>
                {copied ? 'Copiado!' : 'Copiar'}
              </Button>
            </div>
            <Notice>
              No Habbo: clique no seu avatar › missão. Depois de entrar, você pode voltar a missão para a anterior.
            </Notice>
          </>
        )}
        <p className={styles.muted}>A verificação confirma que a conta Habbo é sua. Você continuará conectado neste navegador.</p>
      </div>
    </Modal>
  )
}

function FormNick({ defaultNick, onSubmit }: { defaultNick: string; onSubmit: (nick: string) => void }) {
  return (
    <div id="form-entrar-wrap">
      <Form id="form-entrar" onSubmit={(values) => onSubmit(String(values.nick ?? ''))}>
        <Field label="Nome do seu Habbo" name="nick" required>
          <Input
            name="nick"
            required
            maxLength={32}
            defaultValue={defaultNick}
            autoComplete="username"
            placeholder="Seu nome no Habbo"
          />
        </Field>
      </Form>
    </div>
  )
}
