/**
 * Dados públicos do Habbo, chamados direto do navegador (sem backend):
 *  - API pública oficial do Habbo (usuários, perfis, emblemas) — libera CORS
 *  - habbo-imaging oficial (imagem do avatar) — usado em <img>, não precisa de CORS
 *  - HabboAssets (comunitário, não oficial) — lista de emblemas novos, libera CORS
 */

export const HABBO_HOTEL = 'https://www.habbo.com.br'
const HABBO_ASSETS_API = 'https://www.habboassets.com/api/v1'

/* ============================== tipos ============================== */

export interface HabboBadge {
  code: string
  name: string
  description: string
}

export interface HabboUser {
  uniqueId: string
  name: string
  figureString: string
  motto: string
  online: boolean
  lastAccessTime: string | null
  memberSince: string
  profileVisible: boolean
  selectedBadges: (HabboBadge & { badgeIndex: number })[]
}

export interface HabboProfile {
  user: HabboUser
  badges: HabboBadge[]
  friends: unknown[]
  groups: unknown[]
  rooms: unknown[]
}

export interface NewBadge {
  code: string
  name: string
  description: string
  imageUrl: string
  /** imagem reserva (.png no CDN do Habbo), para emblemas que não têm a versão .gif */
  fallbackUrl?: string
  createdAt: string
}

export class NotFoundError extends Error {}

/* ============================== imagens ============================== */

export interface AvatarOptions {
  /** figure string (ex.: hd-180-1.hr-828-61) — ou use `user` */
  figure?: string
  user?: string
  gender?: 'M' | 'F'
  direction?: number
  headDirection?: number
  size?: 's' | 'm' | 'l'
  headonly?: boolean
  gesture?: string
  action?: string
}

export function avatarUrl({
  figure,
  user,
  gender,
  direction = 2,
  headDirection = direction,
  size = 'm',
  headonly,
  gesture,
  action,
}: AvatarOptions) {
  const p = new URLSearchParams()
  if (figure) p.set('figure', figure)
  else if (user) p.set('user', user)
  if (gender) p.set('gender', gender)
  p.set('direction', String(direction))
  p.set('head_direction', String(headDirection))
  p.set('size', size)
  if (headonly) p.set('headonly', '1')
  if (gesture) p.set('gesture', gesture)
  if (action) p.set('action', action)
  return `${HABBO_HOTEL}/habbo-imaging/avatarimage?${p}`
}

export const badgeUrl = (code: string) => `https://images.habbo.com/c_images/album1584/${encodeURIComponent(code)}.gif`
/** versão .png (existe também para emblemas que não têm .gif) */
export const badgePngUrl = (code: string) => `https://images.habbo.com/c_images/album1584/${encodeURIComponent(code)}.png`

/* ============================== API ============================== */

async function getJson<T>(url: string, signal?: AbortSignal): Promise<T> {
  const res = await fetch(url, { signal })
  if (res.status === 404) throw new NotFoundError('Não encontrado')
  if (!res.ok) throw new Error(`Erro ${res.status} ao buscar dados do Habbo`)
  return res.json() as Promise<T>
}

/** Busca um usuário pelo nick. Lança NotFoundError se não existir. */
export const getUser = (name: string, signal?: AbortSignal) =>
  getJson<HabboUser>(`${HABBO_HOTEL}/api/public/users?name=${encodeURIComponent(name.trim())}`, signal)

/** Perfil completo (emblemas, amigos, grupos, quartos). Perfis privados retornam 404. */
export const getProfile = (uniqueId: string, signal?: AbortSignal) =>
  getJson<HabboProfile>(`${HABBO_HOTEL}/api/public/users/${encodeURIComponent(uniqueId)}/profile`, signal)

interface AssetsBadge {
  code: string
  name: string
  description: string
  url_habbo: string
  created_at: string
}

/** Emblemas mais recentes do hotel BR (HabboAssets). */
export const getNewBadges = ({ limit = 6, offset = 0 }, signal?: AbortSignal) =>
  searchBadges({ term: '', limit, offset }, signal)

/** Busca emblemas do hotel BR por código ou nome (HabboAssets), do mais novo para o mais antigo. */
export async function searchBadges(
  { term = '', limit = 24, offset = 0 }: { term?: string; limit?: number; offset?: number },
  signal?: AbortSignal,
): Promise<NewBadge[]> {
  const q = term ? `&term=${encodeURIComponent(term)}` : ''
  const url = `${HABBO_ASSETS_API}/badges?hotel=com.br&order=desc&limit=${limit}&offset=${offset}${q}`
  const data = await getJson<{ badges?: AssetsBadge[]; error?: string }>(url, signal)
  if (!data.badges) throw new Error(data.error ?? 'Resposta inesperada do HabboAssets')
  return data.badges.map((b) => ({
    code: b.code,
    name: b.name,
    description: b.description,
    imageUrl: b.url_habbo || badgeUrl(b.code),
    fallbackUrl: badgePngUrl(b.code),
    createdAt: b.created_at,
  }))
}

/* ============================== catálogo de roupas ============================== */

/** [setId, gênero, club (0/2=HC), nº de cores] */
export type FigureItem = [number, 'M' | 'F' | 'U', number, number]
/** [colorId, hex, club] */
export type FigureColor = [number, string, number]

export interface FigureData {
  updatedAt: string
  palettes: Record<string, FigureColor[]>
  sets: Record<string, { palette: number; items: FigureItem[] }>
  names: Record<string, string>
}

let figureDataPromise: Promise<FigureData> | null = null

/** public/data/figure.json — gerado por `npm run sync:habbo` */
export function loadFigureData() {
  figureDataPromise ??= fetch('/data/figure.json').then((r) => {
    if (!r.ok) throw new Error('Catálogo de roupas não encontrado (rode npm run sync:habbo)')
    return r.json() as Promise<FigureData>
  })
  return figureDataPromise
}

/* ============================== utilidades ============================== */

// [limite em minutos, minutos por unidade, singular, plural]
const UNITS: [number, number, string, string][] = [
  [60, 1, 'minuto', 'minutos'],
  [60 * 24, 60, 'hora', 'horas'],
  [60 * 24 * 30, 60 * 24, 'dia', 'dias'],
  [60 * 24 * 365, 60 * 24 * 30, 'mês', 'meses'],
  [Infinity, 60 * 24 * 365, 'ano', 'anos'],
]

/** "20 horas atrás", como no layout */
export function timeAgo(iso: string | null, now = Date.now()) {
  if (!iso) return '—'
  const minutes = Math.max(0, Math.round((now - new Date(iso).getTime()) / 60000))
  if (minutes < 1) return 'agora mesmo'
  const [, per, one, many] = UNITS.find(([limit]) => minutes < limit)!
  const n = Math.max(1, Math.floor(minutes / per))
  return `${n} ${n === 1 ? one : many} atrás`
}

export const formatDate = (iso: string) => new Date(iso).toLocaleDateString('pt-BR')
