import { useState } from 'react'
import { Button } from '../../components/Button/Button'
import { Modal } from '../../components/Modal/Modal'
import { roomIdOf, type AgendaEvent } from '../../services/kihabbo'
import { AgendaTimes } from './AgendaTimes'
import styles from './Agenda.module.css'

/** Detalhe do evento: banner, horário BR/PT, local, prêmio, descrição e acesso ao quarto */
export function EventModal({ event, onClose }: { event: AgendaEvent; onClose: () => void }) {
  const [copied, setCopied] = useState(false)
  const roomId = roomIdOf(event)
  const command = roomId ? `:roomid ${roomId}` : ''

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(command)
      setCopied(true)
    } catch {
      setCopied(false)
    }
  }

  return (
    <Modal title="Evento" tone="orange" onClose={onClose}>
      <div className={styles.modal}>
        {event.bannerUrl && <img src={event.bannerUrl} alt="" className={styles.modalBanner} />}
        <AgendaTimes start={event.startsAt} end={event.endsAt} />
        <h3 className={styles.modalTitle}>{event.title}</h3>
        {(event.place || event.prize) && (
          <p className={styles.modalMeta}>
            {event.place}
            {event.place && event.prize && ' · '}
            {event.prize && <strong>{event.prize}</strong>}
          </p>
        )}
        {event.description && <p className={styles.modalText}>{event.description}</p>}
        {roomId && (
          <div className={styles.room}>
            <Button tone="orange" href={`https://www.habbo.com.br/room/${roomId}`}>
              Visitar quarto
            </Button>
            <span className={styles.command}>
              <code>{command}</code>
              <button type="button" onClick={copy} aria-label="Copiar comando do quarto">
                {copied ? 'Copiado!' : 'Copiar'}
              </button>
            </span>
          </div>
        )}
      </div>
    </Modal>
  )
}
