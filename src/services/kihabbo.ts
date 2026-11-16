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

export interface AgendaEvent {
  id: string
  title?: string
  name?: string
  description?: string
  startsAt?: string
  date?: string
  room?: string
  host?: string
  [key: string]: unknown
}

export const getAgenda = (signal?: AbortSignal) =>
  get<{ events: AgendaEvent[] }>('/agenda/events', signal).then((d) => d.events)

export const eventTitle = (e: AgendaEvent) => String(e.title ?? e.name ?? 'Evento')
export const eventDate = (e: AgendaEvent) => {
  const raw = e.startsAt ?? e.date
  return raw ? new Date(String(raw)).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }) : null
}

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
