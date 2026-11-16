import { ChoiceList } from '../../components/Form/Form'
import type { Poll } from '../types'
import styles from './forms.module.css'

/** Pergunta + opções de uma enquete (usado em "Votar na enquete" e em "Enquetes") */
export function PollVote({ poll }: { poll: Poll }) {
  return (
    <>
      <div>
        <p className={styles.question}>{poll.pergunta}</p>
        {poll.descricao && <p className={styles.muted}>{poll.descricao}</p>}
      </div>
      <input type="hidden" name="enquete" value={poll.id} />
      <ChoiceList name="opcao" options={poll.opcoes} required />
    </>
  )
}
