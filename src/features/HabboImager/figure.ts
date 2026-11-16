import { avatarUrl } from '../../services/habbo'

/** Peça vestida: id do set + cores (0, 1 ou 2) */
export interface Worn {
  id: number
  colors: number[]
}

/** figure string → { hr: {id, colors}, ... }  (ex.: "hd-180-1.hr-828-61-45") */
export type Figure = Record<string, Worn>

export const DEFAULT_FIGURE = 'hd-180-1.hr-828-61.ch-3030-82.lg-275-82.sh-295-62'

const ORDER = ['hr', 'hd', 'ch', 'lg', 'sh', 'ha', 'he', 'ea', 'fa', 'ca', 'wa', 'cc', 'cp']

export function parseFigure(value: string): Figure {
  const figure: Figure = {}
  for (const part of value.split('.')) {
    const [type, id, ...colors] = part.split('-')
    if (!type || !id || Number.isNaN(Number(id))) continue
    figure[type] = { id: Number(id), colors: colors.map(Number).filter((n) => !Number.isNaN(n)) }
  }
  return figure
}

export function serializeFigure(figure: Figure): string {
  const types = [...ORDER.filter((t) => figure[t]), ...Object.keys(figure).filter((t) => !ORDER.includes(t))]
  return types.map((t) => [t, figure[t].id, ...figure[t].colors].join('-')).join('.')
}

/* ---------- abas do layout → categorias ---------- */
export const TABS = [
  { id: 'corpo', label: 'Rosto e corpo', types: ['hd'] },
  { id: 'cabeca', label: 'Cabeça', types: ['hr', 'ha', 'he', 'ea', 'fa'] },
  { id: 'cima', label: 'Parte de cima', types: ['ch', 'cc', 'ca', 'cp'] },
  { id: 'baixo', label: 'Parte de baixo', types: ['lg', 'sh', 'wa'] },
] as const

export type TabId = (typeof TABS)[number]['id']

export const TYPE_LABEL: Record<string, string> = {
  hd: 'Rosto',
  hr: 'Cabelo',
  ha: 'Chapéu',
  he: 'Acessório',
  ea: 'Óculos',
  fa: 'Máscara',
  ch: 'Camisa',
  cc: 'Casaco',
  ca: 'Colar',
  cp: 'Estampa',
  lg: 'Calça',
  sh: 'Sapato',
  wa: 'Cinto',
}

/** peças obrigatórias (não têm opção "nenhum") */
export const REQUIRED = new Set(['hd', 'ch', 'lg'])

const HEAD_TYPES = new Set(['hd', 'hr', 'ha', 'he', 'ea', 'fa'])
const BOTTOM_TYPES = new Set(['lg', 'sh', 'wa'])

export const tabOfType = (type: string) => TABS.find((t) => (t.types as readonly string[]).includes(type))!.id

/** onde enquadrar a miniatura dentro da imagem do avatar */
export const thumbArea = (type: string) => (HEAD_TYPES.has(type) ? 'head' : BOTTOM_TYPES.has(type) ? 'bottom' : 'top')

/** URL da miniatura: só a peça (+ um rosto base, para as peças de cabeça/corpo aparecerem no lugar) */
export function thumbUrl(type: string, id: number, colors: number[], skin: Worn | undefined, gender: 'M' | 'F') {
  const part = [type, id, ...colors].join('-')
  const base = skin ? `hd-${skin.id}-${skin.colors[0] ?? 1}` : 'hd-180-1'
  const figure = type === 'hd' ? part : `${base}.${part}`
  return thumbArea(type) === 'head'
    ? avatarUrl({ figure, gender, direction: 2, size: 'm', headonly: true })
    : avatarUrl({ figure, gender, direction: 2, size: 'm' })
}
