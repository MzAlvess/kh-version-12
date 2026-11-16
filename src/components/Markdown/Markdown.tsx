import type { ReactNode } from 'react'
import styles from './Markdown.module.css'

/**
 * Markdown seguro (sem HTML cru) no dialeto do editor de notícias do Kihabbo:
 * - # títulos, **negrito**, *itálico*, ***negrito+itálico***, ++sublinhado++, [link](url), ![imagem](url)
 * - listas (- / 1.), > citação, ---, parágrafos com quebra de linha
 * - {.center} / {.right} → alinha o parágrafo (sozinho na linha, alinha o bloco seguinte)
 * - ![](img.png#a=center) → imagem alinhada
 * - > \[!ATENCAO\] Título  /  > [!PREMIO] ... → caixa de destaque
 * - escapes com \ (ex.: \[  \]  \*)
 */

type Align = 'left' | 'center' | 'right' | 'justify'

const safeUrl = (url: string) => (/^(https?:\/\/|\/)/i.test(url.trim()) ? url.trim() : undefined)

/** separa "img.png#a=center" em url + alinhamento */
function imageParts(raw: string): { src?: string; align?: Align } {
  const [url, fragment = ''] = raw.split('#')
  const align = /(?:^|&)a=(left|center|right)/.exec(fragment)?.[1] as Align | undefined
  return { src: safeUrl(url), align }
}

/* ============================== inline ============================== */

const ENTITIES: Record<string, string> = { nbsp: ' ', amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", '#39': "'" }
/** &nbsp; &amp; &lt; ... viram texto (o editor do Kihabbo às vezes salva entidades) */
const decodeEntities = (text: string) => text.replace(/&(nbsp|amp|lt|gt|quot|apos|#39);/g, (_, e: string) => ENTITIES[e])

function inline(text: string, keyPrefix = ''): ReactNode[] {
  const out: ReactNode[] = []
  // ordem importa: escape, imagem, link, ***, **, ++, *, _
  const re =
    /\\([\\`*_{}[\]()#+\-.!>|~])|!\[([^\]]*)\]\(([^)\s]+)\)|\[([^\]]+)\]\(([^)\s]+)\)|\*\*\*([^*]+?)\*\*\*|\*\*([^*]+?)\*\*|\+\+([^+]+?)\+\+|\*([^*\n]+?)\*|_([^_\n]+?)_/g
  let last = 0
  let m: RegExpExecArray | null
  let i = 0
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index))
    const key = `${keyPrefix}${i++}`
    if (m[1] !== undefined) out.push(m[1])
    else if (m[3] !== undefined) {
      const { src, align } = imageParts(m[3])
      if (src) out.push(<img key={key} src={src} alt={m[2]} loading="lazy" className={`${styles.img} ${align ? styles[`img_${align}`] : ''}`} />)
    } else if (m[5] !== undefined) {
      const href = safeUrl(m[5])
      out.push(
        href ? (
          <a key={key} href={href} target="_blank" rel="noopener noreferrer">
            {inline(m[4], key)}
          </a>
        ) : (
          inline(m[4], key)
        ),
      )
    } else if (m[6] !== undefined)
      out.push(
        <strong key={key}>
          <em>{inline(m[6], key)}</em>
        </strong>,
      )
    else if (m[7] !== undefined) out.push(<strong key={key}>{inline(m[7], key)}</strong>)
    else if (m[8] !== undefined) out.push(<u key={key}>{inline(m[8], key)}</u>)
    else if (m[9] !== undefined || m[10] !== undefined) out.push(<em key={key}>{inline(m[9] ?? m[10], key)}</em>)
    last = re.lastIndex
  }
  if (last < text.length) out.push(text.slice(last))
  return out.map((n) => (typeof n === 'string' ? decodeEntities(n) : n))
}

/* ============================== blocos ============================== */

const ALIGN_RE = /^\{\.(center|right|left|justify)\}\s*/
const LIST_RE = /^\s*([-*•]|\d+[.)])\s+/
const isBlockStart = (line: string) => /^(#{1,4}\s|>|-{3,}$|\*{3,}$)/.test(line.trim()) || LIST_RE.test(line)

/** tipos de destaque (> [!TIPO]) → classe de cor */
const CALLOUTS: Record<string, string> = {
  ATENCAO: 'warning',
  ATENÇÃO: 'warning',
  AVISO: 'warning',
  WARNING: 'warning',
  PREMIO: 'prize',
  PRÊMIO: 'prize',
  IMPORTANTE: 'danger',
  PERIGO: 'danger',
  CAUTION: 'danger',
  DICA: 'tip',
  TIP: 'tip',
  INFO: 'info',
  NOTA: 'info',
  NOTE: 'info',
}

function blocks(source: string, keyPrefix = ''): ReactNode[] {
  const lines = source.replace(/\r\n/g, '\n').split('\n')
  const out: ReactNode[] = []
  let i = 0
  let k = 0
  let pendingAlign: Align | undefined // {.center} sozinho alinha o próximo bloco
  const key = () => `${keyPrefix}${k++}`
  const alignClass = (a?: Align) => (a ? styles[`align_${a}`] : undefined)

  while (i < lines.length) {
    const trimmed = lines[i].trim()

    if (!trimmed) {
      i++
      continue
    }

    // linha só com &nbsp;: espaço extra entre blocos
    if (/^(&nbsp;s*)+$/.test(trimmed)) {
      out.push(<div key={key()} className={styles.spacer} aria-hidden="true" />)
      i++
      continue
    }

    // título
    const heading = /^(#{1,4})\s+(.*)$/.exec(trimmed)
    if (heading) {
      const level = Math.min(heading[1].length + 1, 4) // # → h2 (o h1 é o título da notícia)
      // "## {.center} Título" → título centralizado
      let headingText = heading[2].replace(/\s+#+$/, '')
      const headingAlign = ALIGN_RE.exec(headingText)?.[1] as Align | undefined
      if (headingAlign) headingText = headingText.replace(ALIGN_RE, '')
      const content = inline(headingText, `${keyPrefix}h${k}-`)
      const cls = alignClass(headingAlign ?? pendingAlign)
      out.push(
        level === 2 ? (
          <h2 key={key()} className={cls}>{content}</h2>
        ) : level === 3 ? (
          <h3 key={key()} className={cls}>{content}</h3>
        ) : (
          <h4 key={key()} className={cls}>{content}</h4>
        ),
      )
      pendingAlign = undefined
      i++
      continue
    }

    // linha horizontal
    if (/^(-{3,}|\*{3,})$/.test(trimmed)) {
      out.push(<hr key={key()} />)
      i++
      continue
    }

    // listas
    if (LIST_RE.test(lines[i])) {
      const ordered = /^\s*\d+[.)]\s+/.test(lines[i])
      const items: ReactNode[] = []
      while (i < lines.length && LIST_RE.test(lines[i]) && /^\s*\d+[.)]\s+/.test(lines[i]) === ordered) {
        items.push(<li key={items.length}>{inline(lines[i].trim().replace(LIST_RE, ''), `${keyPrefix}l${k}-${items.length}-`)}</li>)
        i++
      }
      out.push(ordered ? <ol key={key()}>{items}</ol> : <ul key={key()}>{items}</ul>)
      continue
    }

    // citação / caixa de destaque
    if (trimmed.startsWith('>')) {
      const quote: string[] = []
      while (i < lines.length && lines[i].trim().startsWith('>')) {
        quote.push(lines[i].trim().replace(/^>\s?/, ''))
        i++
      }
      const callout = /^\\?\[!([A-ZÇÃÊÉÍÓÚ]+)\\?\]\s*(.*)$/i.exec(quote[0]?.trim() ?? '')
      if (callout) {
        const variant = CALLOUTS[callout[1].toUpperCase()] ?? 'info'
        const rest = quote.slice(1).join('\n')
        out.push(
          <aside key={key()} className={`${styles.callout} ${styles[`callout_${variant}`]}`} role="note">
            {callout[2] && <p className={styles.calloutTitle}>{inline(callout[2], `${keyPrefix}c${k}-`)}</p>}
            {rest.trim() && <div className={styles.calloutBody}>{blocks(rest, `${keyPrefix}c${k}-`)}</div>}
          </aside>,
        )
      } else {
        out.push(<blockquote key={key()}>{blocks(quote.join('\n'), `${keyPrefix}q${k}-`)}</blockquote>)
      }
      pendingAlign = undefined
      continue
    }

    // parágrafo: junta linhas até uma linha vazia ou outro bloco
    const para: string[] = []
    while (i < lines.length && lines[i].trim() && !(para.length && isBlockStart(lines[i]))) {
      para.push(lines[i].trim())
      i++
    }

    // {.center} no começo do parágrafo
    let align = pendingAlign
    pendingAlign = undefined
    const marker = ALIGN_RE.exec(para[0] ?? '')
    if (marker) {
      para[0] = para[0].replace(ALIGN_RE, '')
      align = marker[1] as Align
      if (!para.join('').trim()) {
        // {.center} sozinho: vale para o próximo bloco
        pendingAlign = align
        continue
      }
    }
    while (para.length && !para[0].trim()) para.shift()

    // parágrafo que é só uma imagem: herda o alinhamento do #a=center
    const onlyImage = para.length === 1 && /^!\[[^\]]*\]\(([^)\s]+)\)$/.exec(para[0])
    if (onlyImage) {
      align = align ?? imageParts(onlyImage[1]).align
      out.push(
        <p key={key()} className={`${styles.figure} ${alignClass(align ?? 'left') ?? ''}`}>
          {inline(para[0], `${keyPrefix}f${k}-`)}
        </p>,
      )
      continue
    }

    const children: ReactNode[] = []
    para.forEach((p, idx) => {
      if (idx) children.push(<br key={`br${idx}`} />)
      children.push(...inline(p, `${keyPrefix}p${k}-${idx}-`))
    })
    out.push(
      <p key={key()} className={alignClass(align)}>
        {children}
      </p>,
    )
  }

  return out
}

export function Markdown({ source }: { source: string }) {
  return <div className={styles.markdown}>{blocks(source)}</div>
}
