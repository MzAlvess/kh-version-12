import { useState } from 'react'
import { Notice } from '../../components/Form/Form'
import { Icon } from '../../components/Icon/Icon'
import { FormModal } from '../FormModal'
import type { ModalComponentProps } from '../types'
import { PollVote } from './PollVote'
import styles from './forms.module.css'

/** Lista as enquetes abertas; ao escolher uma, mostra as opções para votar. */
export function Enquetes({ onClose, onSubmit, data }: ModalComponentProps) {
  const [pollId, setPollId] = useState<string | null>(null)
  const poll = data.polls.find((p) => p.id === pollId)

  return (
    <FormModal
      title={poll ? 'Enquete' : 'Enquetes'}
      tone="purple"
      onClose={onClose}
      onSubmit={onSubmit}
      submitLabel={poll ? 'Votar' : undefined}
      cancelLabel={poll ? 'Cancelar' : 'Fechar'}
      success={{ title: 'Voto registrado!', text: 'Obrigado por participar.' }}
    >
      {poll ? (
        <>
          <button type="button" className={styles.back} onClick={() => setPollId(null)}>
            <Icon name="prev" size={18} /> Todas as enquetes
          </button>
          <PollVote poll={poll} />
        </>
      ) : data.polls.length ? (
        <div className={styles.polls}>
          {data.polls.map((p) => (
            <button key={p.id} type="button" className={styles.pollCard} onClick={() => setPollId(p.id)}>
              <span>
                <strong>{p.pergunta}</strong>
                <small>
                  {p.opcoes.length} opções{p.descricao ? ` · ${p.descricao}` : ''}
                </small>
              </span>
              <Icon name="next" size={22} />
            </button>
          ))}
        </div>
      ) : (
        <Notice>Nenhuma enquete aberta no momento.</Notice>
      )}
    </FormModal>
  )
}
