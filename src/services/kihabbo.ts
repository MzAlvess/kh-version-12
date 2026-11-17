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
  /** código de erro da API (ex.: UNAUTHORIZED, ALREADY_LIKED) */
  code?: string
  constructor(message: string, status: number, code?: string) {
    super(message)
    this.status = status
    this.code = code
  }
}

/** A sessão é um cookie HttpOnly (kihabbo_session): credentials 'include' envia/recebe o cookie. */
async function request<T>(method: string, path: string, body?: unknown, signal?: AbortSignal): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    method,
    signal,
    credentials: 'include',
    headers: body !== undefined ? { 'Content-Type': 'application/json' } : undefined,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })
  let json: ApiResponse<T> | null = null
  try {
    json = (await res.json()) as ApiResponse<T>
  } catch {
    /* resposta sem JSON */
  }
  if (!res.ok || !json?.success) {
    throw new ApiError(json?.error?.message ?? `Erro ${res.status}`, res.status, json?.error?.code)
  }
  return json.data
}

const get = <T>(path: string, signal?: AbortSignal) => request<T>('GET', path, undefined, signal)
const post = <T>(path: string, body?: unknown) => request<T>('POST', path, body ?? {})
const del = <T>(path: string) => request<T>('DELETE', path)

/* ============================== login (missão do Habbo) ============================== */

/**
 * Usuário logado (formato real de GET /v1/auth/me):
 * { user: { id, username, displayName, avatarUser, memberSince, stats, isLive, role, roles,
 *           permissions, viewingAs, ban }, preferences: { theme } }
 */
export interface AuthUser {
  id: string
  username: string
  displayName: string
  /** nick usado para o avatar no habbo-imaging */
  avatarUser: string
  /** 'member', ... */
  role: string
  roles: string[]
  permissions: string[]
  /** dd/mm/aaaa */
  memberSince: string | null
  stats: { hypes: number; comments: number; votes: number }
  /** locutor ao vivo agora */
  isLive: boolean
  /** banido: perde as interações do site (só pode abrir contato) */
  banned: boolean
  banReason: string | null
  /** saldo de fichas: a conta do Kihabbo ainda não tem (o header mostra 0) */
  fichas: number | null
}

const asStrings = (v: unknown) => (Array.isArray(v) ? v.map(String) : [])

export function normalizeUser(data: unknown): AuthUser | null {
  if (!data || typeof data !== 'object') return null
  const root = data as Record<string, unknown>
  const u = (root.user && typeof root.user === 'object' ? root.user : root) as Record<string, unknown>
  const username = typeof u.username === 'string' && u.username ? u.username : null
  if (!username) return null
  const stats = (u.stats ?? {}) as Record<string, unknown>
  const ban = u.ban && typeof u.ban === 'object' ? (u.ban as Record<string, unknown>) : null
  return {
    id: String(u.id ?? username),
    username,
    displayName: typeof u.displayName === 'string' && u.displayName ? u.displayName : username,
    avatarUser: typeof u.avatarUser === 'string' && u.avatarUser ? u.avatarUser : username,
    role: typeof u.role === 'string' ? u.role : 'member',
    roles: asStrings(u.roles),
    permissions: asStrings(u.permissions),
    memberSince: typeof u.memberSince === 'string' ? u.memberSince : null,
    stats: { hypes: Number(stats.hypes) || 0, comments: Number(stats.comments) || 0, votes: Number(stats.votes) || 0 },
    isLive: !!u.isLive,
    banned: !!u.ban,
    banReason: ban ? String(ban.reason ?? ban.motivo ?? '') || null : null,
    fichas: null,
  }
}

/** mensagem para conta banida (como no site atual: só pode abrir contato para contestar) */
export const BANNED_MESSAGE =
  'Sua conta está suspensa das interações do site. Para contestar, abra um contato em Utilidades › Contato.'

/** usuário logado ou null (401 = visitante) */
export async function getMe(signal?: AbortSignal): Promise<AuthUser | null> {
  try {
    return normalizeUser(await get<unknown>('/auth/me', signal))
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) return null
    throw err
  }
}

export interface MissionChallenge {
  challengeId: string
  code: string
  expiresAt: string | null
}

/** passo 1: gera o código que o usuário coloca na missão do Habbo */
export async function createChallenge(habboName: string): Promise<MissionChallenge> {
  const d = await post<Record<string, unknown>>('/auth/habbo/challenge', { habboName: habboName.trim() })
  const challengeId = String(d.challengeId ?? d.id ?? '')
  const code = String(d.code ?? d.missionCode ?? d.token ?? d.mission ?? '')
  if (!challengeId || !code) throw new ApiError('Resposta inesperada ao gerar o código.', 500)
  return { challengeId, code, expiresAt: (d.expiresAt as string) ?? null }
}

/** passo 2: a API confere a missão e cria a sessão (cookie) */
export const verifyChallenge = (challengeId: string) => post<unknown>('/auth/habbo/verify', { challengeId })

export const logout = () => post<unknown>('/auth/logout')

/* ============================== interações (exigem login) ============================== */

export const likePost = (postId: string, like: boolean) =>
  like
    ? post<{ liked?: boolean; likesCount?: number }>(`/news/posts/${encodeURIComponent(postId)}/like`)
    : del<{ liked?: boolean; likesCount?: number }>(`/news/posts/${encodeURIComponent(postId)}/like`)

export const likeComment = (commentId: string, like: boolean) =>
  like
    ? post<{ liked: boolean; likesCount: number }>(`/comments/${encodeURIComponent(commentId)}/like`)
    : del<{ liked: boolean; likesCount: number }>(`/comments/${encodeURIComponent(commentId)}/like`)

export const votePoll = (categoryId: string, optionId: string) => post<unknown>('/polls/votes', { categoryId, optionId })

/** categorias aceitas pela API de tickets (as mesmas do site atual) */
export const TICKET_CATEGORIES = ['Problemas com a rádio', 'Dúvidas sobre emblemas', 'Denúncia de usuário', 'Sugestão', 'Outro']

export const createTicket = (t: { category: string; subject: string; message: string }) =>
  post<unknown>('/support/tickets', { category: t.category, subject: t.subject.trim(), message: t.message.trim() })

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
  /** o usuário logado já curtiu */
  liked?: boolean
  tags: NewsTag[]
}

export interface PostPage {
  posts: Post[]
  page: number
  limit: number
  total: number
}

export interface NewsTag {
  id: string
  slug: string
  name: string
  /** cor da tag (hex), quando a equipe definir */
  color: string | null
}

/** a API já mandou tags como texto e hoje manda como objeto: aceita os dois */
function normalizeTags(raw: unknown): NewsTag[] {
  if (!Array.isArray(raw)) return []
  return raw
    .map((t): NewsTag | null => {
      if (typeof t === 'string') return { id: t, slug: t, name: t, color: null }
      if (t && typeof t === 'object') {
        const o = t as Record<string, unknown>
        const name = String(o.name ?? o.slug ?? o.id ?? '')
        if (!name) return null
        return { id: String(o.id ?? name), slug: String(o.slug ?? name), name, color: typeof o.color === 'string' && o.color ? o.color : null }
      }
      return null
    })
    .filter((t): t is NewsTag => !!t)
}

const normalizePost = (p: Post): Post => ({ ...p, tags: normalizeTags(p.tags) })

/** notícias publicadas; `tag` = slug da tag (ex.: 'eventos') filtra no servidor */
export const getPosts = ({ page = 1, limit = 6, tag }: { page?: number; limit?: number; tag?: string }, signal?: AbortSignal) =>
  get<PostPage>(`/news/posts?page=${page}&limit=${limit}${tag ? `&tag=${encodeURIComponent(tag)}` : ''}`, signal).then((d) => ({
    ...d,
    posts: d.posts.map(normalizePost),
  }))

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
  get<Post>(`/news/posts/${encodeURIComponent(slug)}`, signal).then(normalizePost)

export interface Comment {
  id: string
  parentId: string | null
  author: string
  text: string
  createdAt: string
  likesCount: number
  /** o usuário logado já curtiu */
  liked?: boolean
  deleted: boolean
}

export const getComments = (postId: string, signal?: AbortSignal) =>
  get<{ comments: Comment[] }>(`/news/posts/${encodeURIComponent(postId)}/comments`, signal).then((d) => d.comments)

/** comentar (ou responder, com parentId) — exige login */
export const createComment = (postId: string, text: string, parentId?: string) =>
  post<Comment>('/comments', { postId, text: text.trim(), ...(parentId ? { parentId } : {}) })

/* ============================== rádio ============================== */

/**
 * "No ar agora", já normalizado. Formato real de GET /v1/player/status (conferido no site atual):
 * - mode: 'locucao' (locutor ao vivo) | 'programa' (programa com participantes) | 'autodj'
 * - locutor: { id, name, avatarUser } — avatarUser é o nick no Habbo, usado no habbo-imaging
 * - program: { name, image, participants: [{ id, name, avatarUser, isGuest }] }
 */
export interface OnAir {
  mode: 'locucao' | 'programa' | 'autodj'
  /** há alguém ao vivo (locução ou programa) */
  live: boolean
  /** nome exibido: locutor, programa ou "AutoDJ" */
  name: string
  /** nick do Habbo do locutor no ar (no programa: o primeiro participante da equipe) */
  avatarUser: string | null
  /** id do locutor no ar (para hype) */
  locutorId: string | null
  programName: string | null
  programImage: string | null
  trackTitle: string | null
  streamUrl: string | null
}

export interface PlayerStatus {
  radio: OnAir
}

const str = (v: unknown) => (typeof v === 'string' && v.trim() ? v.trim() : null)
const obj = (v: unknown) => (v && typeof v === 'object' ? (v as Record<string, unknown>) : {})

function normalizeOnAir(raw: unknown): OnAir {
  const r = obj(raw)
  const locutor = obj(r.locutor)
  const program = obj(r.program)
  // versões antigas mandavam locutor/program como texto
  const locutorName = str(r.locutor) ?? str(locutor.name)
  const programName = str(r.program) ?? str(program.name)
  const participants = Array.isArray(program.participants) ? program.participants.map(obj) : []
  const host = participants.find((p) => !p.isGuest && str(p.avatarUser ?? p.name)) ?? participants[0]

  const mode: OnAir['mode'] =
    (r.mode === 'locucao' || r.mode === 'live') && locutorName ? 'locucao' : r.mode === 'programa' && programName ? 'programa' : 'autodj'

  const avatarUser =
    mode === 'locucao'
      ? str(locutor.avatarUser) ?? locutorName
      : mode === 'programa' && host
        ? str(host.avatarUser) ?? str(host.name)
        : null

  return {
    mode,
    live: mode !== 'autodj',
    name: mode === 'locucao' ? locutorName! : mode === 'programa' ? programName! : 'AutoDJ',
    avatarUser,
    locutorId: mode === 'locucao' ? str(locutor.id) : null,
    programName,
    programImage: str(program.image),
    trackTitle: str(r.trackTitle),
    streamUrl: str(r.streamUrl),
  }
}

export const getPlayerStatus = (signal?: AbortSignal) =>
  get<{ radio?: unknown }>('/player/status', signal).then((d): PlayerStatus => ({ radio: normalizeOnAir(d?.radio) }))

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

/* ============================== feature flags / Hall da Fama ============================== */

/** chaves que o site atual liga/desliga (ex.: history_hall_of_fame, market, best_of_round) */
export const getFeatureFlags = (signal?: AbortSignal) => get<Record<string, boolean>>('/feature-flags', signal)

export interface HallCategory {
  id: string
  label: string
}

export interface HallWinner {
  name: string
  wins: number
  lastWin: string | null
}

export const getHallCategories = (signal?: AbortSignal) =>
  get<{ categories: HallCategory[] }>('/history/categories', signal).then((d) => d.categories)

/** vencedores do "Melhores da rodada" numa categoria (a API repete nomes: deduplicamos) */
export const getHallWinners = (categoryId: string, signal?: AbortSignal) =>
  get<{ winners: HallWinner[] }>(`/history/categories/${encodeURIComponent(categoryId)}`, signal).then((d) => {
    const seen = new Set<string>()
    return d.winners.filter((w) => !seen.has(w.name) && seen.add(w.name))
  })

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
