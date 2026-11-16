import { Children, Fragment, isValidElement, type ReactElement, type ReactNode } from 'react'
import { ErrorBoundary } from '../ErrorBoundary/ErrorBoundary'
import styles from './PageGrid.module.css'

/** abre fragmentos (<>...</>) para isolar cada caixa individualmente */
function flatten(nodes: ReactNode): ReactNode[] {
  return Children.toArray(nodes).flatMap((child) =>
    isValidElement(child) && child.type === Fragment
      ? flatten((child as ReactElement<{ children?: ReactNode }>).props.children)
      : [child],
  )
}

/** cada caixa isolada: se uma quebrar (ex.: a API mudar um formato), as outras continuam */
const isolate = (nodes: ReactNode) => flatten(nodes).map((child, i) => <ErrorBoundary key={i}>{child}</ErrorBoundary>)

/** Grade padrão das páginas: coluna principal (860px) + lateral (310px), igual à home do layout */
export function PageGrid({ children, aside }: { children: ReactNode; aside?: ReactNode }) {
  return (
    <main className={`container ${styles.grid}`} id="conteudo">
      <div className={styles.main}>{isolate(children)}</div>
      {aside && <aside className={styles.side}>{isolate(aside)}</aside>}
    </main>
  )
}
