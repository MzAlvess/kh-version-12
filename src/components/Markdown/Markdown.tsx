import type { ReactNode } from 'react'
import styles from './Markdown.module.css'

/**
 * Markdown simples e seguro (sem HTML cru) para o conteúdo das notícias.
 * Suporta: # títulos, **negrito**, *itálico*, ++sublinhado++, [link](url), ![imagem](url),
 * listas (- / 1.), > citação, --- e parágrafos.
 */

const safeUrl = (url: string) => (/^(https?:\/\/|\/)/i.test(url.trim()) ? url.trim() : undefined)

function inline(text: string, keyPrefix = ''): ReactNode[] {
  const out: ReactNode[] = []
  // ordem importa: imagem antes de link; negrito antes de itálico
  const re = /!\[([^\]]*)\]\(([^)\s]+)\)|\[([^\]]+)\]\(([^)\s]+)\)|\*\*([^*]+?)\*\*|\+\+([^+]+?)\+\+|\*([^*\n]+?)\*|_([^_\n]+?)_/g
  let last = 0
  let m: RegExpExecArray | null
  let i = 0
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index))
    const key = `${keyPrefix}${i++}`
    if (m[2] !== undefined) {
      const src = safeUrl(m[2])
      if (src) out.push(<img key={key} src={src} alt={m[1]} loading="lazy" className={styles.img} />)
    } else if (m[4] !== undefined) {
      const href = safeUrl(m[4])
      out.push(
        href ? (
          <a key={key} href={href} target="_blank" rel="noopener noreferrer">
            {inline(m[3], key)}
          </a>
        ) : (
          m[3]
        ),
      )
    } else if (m[5] !== undefined) out.push(<strong key={key}>{inline(m[5], key)}</strong>)
    else if (m[6] !== undefined) out.push(<u key={key}>{inline(m[6], key)}</u>)
    else if (m[7] !== undefined || m[8] !== undefined) out.push(<em key={key}>{inline(m[7] ?? m[8], key)}</em>)
    last = re.lastIndex
  }
  if (last < text.length) out.push(text.slice(last))
  return out
}

export function Markdown({ source }: { source: string }) {
  const lines = source.replace(/\r\n/g, '\n').split('\n')
  const blocks: ReactNode[] = []
  let i = 0
  let k = 0

  while (i < lines.length) {
    const line = lines[i]
    const trimmed = line.trim()

    if (!trimmed) {
      i++
      continue
    }

    const heading = /^(#{1,4})\s+(.*)$/.exec(trimmed)
    if (heading) {
      const level = Math.min(heading[1].length + 1, 4) // # → h2 (o h1 é o título da notícia)
      const content = inline(heading[2].replace(/\s+#+$/, ''), `h${k}-`)
      blocks.push(level === 2 ? <h2 key={k++}>{content}</h2> : level === 3 ? <h3 key={k++}>{content}</h3> : <h4 key={k++}>{content}</h4>)
      i++
      continue
    }

    if (/^(-{3,}|\*{3,})$/.test(trimmed)) {
      blocks.push(<hr key={k++} />)
      i++
      continue
    }

    if (/^[-*•]\s+/.test(trimmed) || /^\d+[.)]\s+/.test(trimmed)) {
      const ordered = /^\d+[.)]\s+/.test(trimmed)
      const items: ReactNode[] = []
      while (i < lines.length && (ordered ? /^\s*\d+[.)]\s+/ : /^\s*[-*•]\s+/).test(lines[i])) {
        items.push(<li key={items.length}>{inline(lines[i].trim().replace(/^([-*•]|\d+[.)])\s+/, ''), `l${k}-${items.length}-`)}</li>)
        i++
      }
      blocks.push(ordered ? <ol key={k++}>{items}</ol> : <ul key={k++}>{items}</ul>)
      continue
    }

    if (trimmed.startsWith('>')) {
      const quote: string[] = []
      while (i < lines.length && lines[i].trim().startsWith('>')) {
        quote.push(lines[i].trim().replace(/^>\s?/, ''))
        i++
      }
      blocks.push(<blockquote key={k++}>{inline(quote.join(' '), `q${k}-`)}</blockquote>)
      continue
    }

    // parágrafo: junta linhas até uma linha vazia ou outro bloco
    const para: string[] = []
    while (
      i < lines.length &&
      lines[i].trim() &&
      !/^(#{1,4}\s|[-*•]\s|\d+[.)]\s|>|-{3,}$)/.test(lines[i].trim())
    ) {
      para.push(lines[i].trim())
      i++
    }
    const children: ReactNode[] = []
    para.forEach((p, idx) => {
      if (idx) children.push(<br key={`br${idx}`} />)
      children.push(...inline(p, `p${k}-${idx}-`))
    })
    blocks.push(<p key={k++}>{children}</p>)
  }

  return <div className={styles.markdown}>{blocks}</div>
}
