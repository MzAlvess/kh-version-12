import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { useAsync } from '../hooks/useAsync'
import { avatarUrl } from '../services/habbo'
import { getPlayerStatus } from '../services/kihabbo'
import { DEFAULT_FIGURE } from '../features/HabboImager/figure'
import { DestaquesBanner } from '../features/Destaques/DestaquesBanner'
import { HabboStars } from '../features/HabboStars/HabboStars'
import { TopEventosBox } from '../features/News/TopEventosBox'
import { ErrorBoundary } from '../components/ErrorBoundary/ErrorBoundary'
import { Footer } from './Footer/Footer'
import { RouteTransition } from './RouteTransition'
import { Header, type HeaderUser } from './Header/Header'
import { DEFAULT_STREAM_URL, RadioPanel } from './RadioPanel/RadioPanel'

const STATUS_REFRESH_MS = 60_000

/** Estrutura comum de todas as páginas: header + rádio + conteúdo + rodapé */
export function Layout({ user, authLoading }: { user: HeaderUser | null; authLoading?: boolean }) {
  const { pathname, hash } = useLocation()
  const status = useAsync('layout-player', (s) => getPlayerStatus(s))
  const { reload } = status

  // atualiza o "no ar agora" a cada minuto
  useEffect(() => {
    const id = setInterval(reload, STATUS_REFRESH_MS)
    return () => clearInterval(id)
  }, [reload])

  // ao trocar de página: volta ao topo (ou rola até a âncora, ex.: /radio#ranking)
  useEffect(() => {
    if (hash) {
      document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    } else {
      window.scrollTo({ top: 0 })
    }
  }, [pathname, hash])

  const radio = (status.data ?? status.previous)?.radio
  const live = radio?.mode === 'live' && !!radio.locutor

  return (
    <>
      <ErrorBoundary>
        <Header user={user} authLoading={authLoading} />
      </ErrorBoundary>
      <ErrorBoundary>
        <RadioPanel
          locutor={live ? radio!.locutor! : 'AutoDJ'}
          programa={radio?.program ?? (live ? 'Ao vivo' : 'Programação automática')}
          musica={radio?.trackTitle ?? 'Kihabbo — A Rádio do Habbo Hotel'}
          streamUrl={radio?.streamUrl || DEFAULT_STREAM_URL}
          banner={<DestaquesBanner />}
          topEventos={<TopEventosBox />}
          habboStars={<HabboStars />}
          locutorAvatarUrl={live ? undefined : avatarUrl({ figure: DEFAULT_FIGURE, direction: 4, size: 'm' })}
        />
      </ErrorBoundary>
      <ErrorBoundary resetKey={pathname} message="Não foi possível exibir esta página agora.">
        <RouteTransition hold={authLoading}>
          <Outlet />
        </RouteTransition>
      </ErrorBoundary>
      <Footer />
    </>
  )
}
