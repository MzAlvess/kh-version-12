import type { ModalName } from '../../modals/types'

export interface MenuItem {
  id: string
  label: string
  icon: string
  href: string
}

export const menuLeft: MenuItem[] = [
  { id: 'home', label: 'Home', icon: '/assets/menu/home.png', href: '/' },
  { id: 'kihabbo', label: 'Kihabbo', icon: '/assets/menu/kihabbo.png', href: '/kihabbo' },
  { id: 'habbo-hotel', label: 'Habbo Hotel', icon: '/assets/menu/habbo-hotel.png', href: '/habbo-hotel' },
]

export const menuRight: MenuItem[] = [
  { id: 'noticias', label: 'Notícias', icon: '/assets/menu/noticias.png', href: '/noticias' },
  { id: 'radio', label: 'Rádio', icon: '/assets/menu/radio.png', href: '/radio' },
  { id: 'utilidades', label: 'Utilidades', icon: '/assets/menu/utilidades.png', href: '/utilidades' },
]

export interface UserLink {
  id: string
  label: string
  href?: string
  onClick?: () => void
  /** abre este modal em vez de navegar */
  modal?: ModalName
  color: 'yellow' | 'orange' | 'red' | 'purple' | 'cyan' | 'green'
}

export const userLinksLeft: UserLink[] = [
  { id: 'gerar-fichas', label: 'Gerar fichas', modal: 'gerar-fichas', color: 'yellow' },
  { id: 'ticket', label: 'Abrir ticket', modal: 'abrir-ticket', color: 'orange' },
  { id: 'sair', label: 'Sair', modal: 'sair', color: 'red' },
]

export const userLinksRight: UserLink[] = [
  { id: 'enquetes', label: 'Enquetes', modal: 'enquetes', color: 'purple' },
  { id: 'config', label: 'Config.', modal: 'config', color: 'cyan' },
  { id: 'habbo', label: 'Habbo', modal: 'habbo', color: 'green' },
]

export const habboAvatar = (nick: string, size: 's' | 'm' | 'l' = 'm') =>
  `https://www.habbo.com.br/habbo-imaging/avatarimage?user=${encodeURIComponent(nick)}&direction=4&head_direction=3&gesture=sml&size=${size}`
