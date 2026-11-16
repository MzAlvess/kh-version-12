import { Notice } from '../../components/Form/Form'
import { FormModal } from '../FormModal'
import type { ModalComponentProps } from '../types'
import { PollVote } from './PollVote'

export function VotarEnquete({ onClose, onSubmit, data }: ModalComponentProps) {
  const poll = data.polls.find((p) => p.id === data.destaquePollId) ?? data.polls[0]

  return (
    <FormModal
      title="Votar na enquete"
      tone="orange"
      onClose={onClose}
      onSubmit={onSubmit}
      submitLabel={poll ? 'Votar' : undefined}
      success={{ title: 'Voto registrado!', text: 'Obrigado por participar. O resultado sai no fim da semana.' }}
    >
      {poll ? <PollVote poll={poll} /> : <Notice>Nenhuma enquete aberta no momento.</Notice>}
    </FormModal>
  )
}
