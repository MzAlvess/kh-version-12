/**
 * API do Kihabbo (a mesma usada pelo site atual): kihabbo.com.br/v1
 * Em produção, mesmo domínio. No desenvolvimento, o Vite repassa /v1 (vite.config.ts).
 * Para apontar para outro servidor: VITE_KIHABBO_API=https://... no .env
 */
const API = `${import.meta.env.VITE_KIHABBO_API ?? ''}/v1`

interface ApiResponse<T> {
  success: boolean
  data: T
  error?: { code: string; message: string }
}

export class ApiError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

async function get<T>(path: string, signal?: AbortSignal): Promise<T> {
  const res = await fetch(`${API}${path}`, { signal, credentials: 'include' })
  let body: ApiResponse<T> | null = null
  try {
    body = (await res.json()) as ApiResponse<T>
  } catch {
    /* resposta sem JSON */
  }
  if (!res.ok || !body?.success) {
    throw new ApiError(body?.error?.message ?? `Erro ${res.status}`, res.status)
  }
  return body.data
}

/* ============================== notícias ============================== */

export interface Post {
  id: string
  slug: string
  title: string
  excerpt: string
  content: string
  coverImage: string | null
  author: string
  authorUsername: string | null
  createdAt: string
  publishedAt: string | null
  commentsCount: number
  likesCount: number
  tags: string[]
}

export interface PostPage {
  posts: Post[]
  page: number
  limit: number
  total: number
}

export const getPosts = ({ page = 1, limit = 6 }, signal?: AbortSignal) =>
  get<PostPage>(`/news/posts?page=${page}&limit=${limit}`, signal)

/** A API aceita no máximo 50 por página (acima disso ela volta para o padrão de 6). */
export const MAX_PAGE_SIZE = 50

/** Todas as notícias publicadas, buscando página por página até completar o total. */
export async function getAllPosts(signal?: AbortSignal): Promise<Post[]> {
  const all: Post[] = []
  for (let page = 1; page <= 40; page++) {
    const res = await getPosts({ page, limit: MAX_PAGE_SIZE }, signal)
    all.push(...res.posts)
    if (!res.posts.length || all.length >= res.total) break
  }
  return all
}

export const getPost = (slug: string, signal?: AbortSignal) =>
  get<Post>(`/news/posts/${encodeURIComponent(slug)}`, signal)

export interface Comment {
  id: string
  parentId: string | null
  author: string
  text: string
  createdAt: string
  likesCount: number
  deleted: boolean
}

export const getComments = (postId: string, signal?: AbortSignal) =>
  get<{ comments: Comment[] }>(`/news/posts/${encodeURIComponent(postId)}/comments`, signal).then((d) => d.comments)

/* ============================== rádio ============================== */

export interface PlayerStatus {
  radio: {
    mode: 'autodj' | 'live' | string
    streamUrl: string | null
    startedAt: string | null
    trackTitle: string | null
    locutor: string | null
    program: string | null
  }
}

export const getPlayerStatus = (signal?: AbortSignal) => get<PlayerStatus>('/player/status', signal)

export interface Locutor {
  id: string
  name: string
  user: string
  hypeMonth: number
  hypeAllTime: number
  live: boolean
  hypeValue: number
}

export const getRanking = (period: 'month' | 'all', signal?: AbortSignal) =>
  get<{ locutores: Locutor[] }>(`/rankings/locutores?period=${period}`, signal).then((d) => d.locutores)

/** Evento da agenda (campos usados pelo site atual: card + modal do evento) */
export interface AgendaEvent {
  id: string
  title: string
  startsAt: string
  endsAt?: string | null
  place?: string | null
  prize?: string | null
  description?: string | null
  bannerUrl?: string | null
  /** id do quarto no Habbo → link "Visitar quarto" e comando :roomid */
  roomId?: string | number | null
}

export const getAgenda = (signal?: AbortSignal) =>
  get<{ events: AgendaEvent[] }>('/agenda/events', signal).then((d) =>
    [...d.events].sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime()),
  )

/** Fusos mostrados na agenda (o site atual mostra Brasil e Portugal) */
export const AGENDA_ZONES = [
  { id: 'br', label: 'Brasil', timeZone: 'America/Sao_Paulo' },
  { id: 'pt', label: 'Portugal', timeZone: 'Europe/Lisbon' },
] as const

/** "sáb., 21/11 · 20:00–22:00" no fuso indicado */
export function formatAgendaRange(start: string, end: string | null | undefined, timeZone: string) {
  const day = new Intl.DateTimeFormat('pt-BR', { timeZone, weekday: 'short', day: '2-digit', month: '2-digit' })
  const time = new Intl.DateTimeFormat('pt-BR', { timeZone, hour: '2-digit', minute: '2-digit' })
  const s = new Date(start)
  if (Number.isNaN(s.getTime())) return '—'
  if (!end) return `${day.format(s)} · ${time.format(s)}`
  const e = new Date(end)
  return day.format(s) === day.format(e)
    ? `${day.format(s)} · ${time.format(s)}–${time.format(e)}`
    : `${day.format(s)} ${time.format(s)} → ${day.format(e)} ${time.format(e)}`
}

/** id de quarto válido do Habbo (número positivo) */
export const roomIdOf = (e: AgendaEvent) => {
  const id = String(e.roomId ?? '')
  return /^\d+$/.test(id) && Number(id) > 0 ? id : null
}

/* ============================== destaques (banner) ============================== */

export interface Destaque {
  id: string
  title: string
  text: string
  imageUrl: string
  linkUrl: string | null
  sortOrder: number
}

export const getDestaques = (signal?: AbortSignal) =>
  get<{ items: Destaque[]; rotationSeconds: number }>('/destaques', signal).then((d) => ({
    items: [...d.items].sort((a, b) => a.sortOrder - b.sortOrder),
    rotationSeconds: d.rotationSeconds || 15,
  }))

/* ============================== mercado (Atacadão) ============================== */

export interface MarketStatus {
  enabled: boolean
  tradingOpen: boolean
  pauseReason: string | null
}

export const getMarketStatus = (signal?: AbortSignal) => get<MarketStatus>('/market/status', signal)

/**
 * Anúncio do mercado. Enquanto o mercado está fechado a lista vem vazia, então os nomes dos campos
 * não puderam ser confirmados: a normalização aceita as variações mais prováveis.
 */
export interface MarketListing {
  id: string
  name: string
  imageUrl: string | null
  price: number | null
  quantity: number | null
  createdAt: string | null
}

type RawListing = Record<string, unknown>
const pick = <T>(o: RawListing, ...keys: string[]) => keys.map((k) => o[k]).find((v) => v !== undefined && v !== null) as T | undefined

function normalizeListing(raw: RawListing): MarketListing {
  const item = (raw.item && typeof raw.item === 'object' ? (raw.item as RawListing) : {}) as RawListing
  const merged = { ...item, ...raw }
  return {
    id: String(pick(merged, 'id', 'listingId', 'guid') ?? Math.random()),
    name: String(pick(merged, 'name', 'title', 'itemName', 'classname', 'className') ?? 'Item'),
    imageUrl: pick<string>(merged, 'imageUrl', 'iconUrl', 'image', 'icon') ?? null,
    price: Number(pick(merged, 'price', 'priceCoins', 'unitPrice', 'askPrice', 'coins')) || null,
    quantity: Number(pick(merged, 'quantity', 'qty', 'amount')) || null,
    createdAt: pick<string>(merged, 'createdAt', 'listedAt') ?? null,
  }
}

export const getMarketListings = ({ page = 1, limit = 3 }, signal?: AbortSignal) =>
  get<{ items: RawListing[]; total: number }>(`/market/listings?page=${page}&limit=${limit}`, signal).then((d) => ({
    items: d.items.map(normalizeListing),
    total: d.total,
  }))

/** página do mercado no site atual (compra exige login) */
export const MARKET_URL = 'https://www.kihabbo.com.br/mercado'

export interface PollCategory {
  id: string
  title: string
  options: { id: string; label: string }[]
}

export const getPollCategories = (signal?: AbortSignal) =>
  get<{ categories: PollCategory[] }>('/polls/categories', signal).then((d) => d.categories)

/* ============================== equipe ============================== */

export interface TeamMember {
  id: string
  username: string
  displayName: string
  avatarUser: string
  role: string
  sortOrder: number
}

export interface TeamGroup {
  id: string
  label: string
  sortOrder: number
  members: TeamMember[]
}

export const getTeam = (signal?: AbortSignal) =>
  get<{ groups: TeamGroup[] }>('/team', signal).then((d) => [...d.groups].sort((a, b) => a.sortOrder - b.sortOrder))

/* ============================== utilidades ============================== */

/** "20 de setembro de 2026" */
export const longDate = (iso: string) =>
  new Date(iso).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })

/** minutos de leitura (~200 palavras/min) */
export const readingTime = (text: string) => Math.max(1, Math.round(text.split(/\s+/).length / 200))
