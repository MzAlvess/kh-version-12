import { Box } from '../components/Box/Box'
import { Button } from '../components/Button/Button'
import { PageGrid } from '../components/PageGrid/PageGrid'
import { DefaultSidebar } from '../features/Sidebar/Sidebar'
import styles from './pages.module.css'

export function NotFoundPage({ userNick }: { userNick: string }) {
  return (
    <PageGrid aside={<DefaultSidebar userNick={userNick} hide={['ranking', 'agenda']} />}>
      <Box title="Página não encontrada" accent="pink" hideNav hideRefresh minBodyHeight={200}>
        <div className={styles.notFound}>
          <strong>404</strong>
          <p>Essa página fugiu do hotel. Confira o endereço ou volte para o início.</p>
          <Button tone="pink" href="/" >
            Voltar para a home
          </Button>
        </div>
      </Box>
    </PageGrid>
  )
}
