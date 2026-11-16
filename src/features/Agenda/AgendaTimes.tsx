import { AGENDA_ZONES, formatAgendaRange } from '../../services/kihabbo'
import styles from './Agenda.module.css'

function Flag({ zone }: { zone: 'br' | 'pt' }) {
  return zone === 'br' ? (
    <svg viewBox="0 0 20 14" className={styles.flag} role="img" aria-label="Brasil">
      <rect width="20" height="14" rx="2" fill="#009c3b" />
      <path d="M10 2 18 7 10 12 2 7z" fill="#ffdf00" />
      <circle cx="10" cy="7" r="2.8" fill="#002776" />
    </svg>
  ) : (
    <svg viewBox="0 0 20 14" className={styles.flag} role="img" aria-label="Portugal">
      <rect width="20" height="14" rx="2" fill="#ff0000" />
      <path d="M2 0h6v14H2a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2z" fill="#006600" />
      <circle cx="8" cy="7" r="2.6" fill="#ffcc00" />
      <circle cx="8" cy="7" r="1.4" fill="#ff0000" />
    </svg>
  )
}

/** Horário do evento no Brasil e em Portugal (como no site atual) */
export function AgendaTimes({ start, end, only }: { start: string; end?: string | null; only?: 'br' | 'pt' }) {
  return (
    <span className={styles.times}>
      {AGENDA_ZONES.filter((z) => !only || z.id === only).map((z) => (
        <span key={z.id} className={styles.timeRow}>
          <Flag zone={z.id} />
          {formatAgendaRange(start, end, z.timeZone)}
        </span>
      ))}
    </span>
  )
}
