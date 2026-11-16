import { Component, type ErrorInfo, type ReactNode } from 'react'
import styles from './ErrorBoundary.module.css'

interface Props {
  children: ReactNode
  /** mensagem mostrada no lugar do conteúdo que quebrou */
  message?: string
  /** muda → tenta renderizar de novo (ex.: ao trocar de página) */
  resetKey?: unknown
}

interface State {
  error: Error | null
  resetKey: unknown
}

/**
 * Rede de segurança: se um componente quebrar (ex.: a API mudar o formato de um dado),
 * só esta parte mostra um aviso — o resto do site continua funcionando.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null, resetKey: this.props.resetKey }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { error }
  }

  static getDerivedStateFromProps(props: Props, state: State): Partial<State> | null {
    return props.resetKey !== state.resetKey ? { error: null, resetKey: props.resetKey } : null
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack)
  }

  render() {
    if (this.state.error) {
      return (
        <div className={styles.fallback} role="alert">
          <strong>{this.props.message ?? 'Não foi possível exibir esta seção agora.'}</strong>
          <button type="button" onClick={() => this.setState({ error: null })}>
            Tentar novamente
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
