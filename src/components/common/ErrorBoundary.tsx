import React from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface Props {
  children: React.ReactNode
  fallback?: React.ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback

      return (
        <div className="min-h-[400px] flex items-center justify-center p-8" style={{ background: 'var(--bg-base)' }}>
          <div className="text-center max-w-md">
            <div
              className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4"
              style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}
            >
              <AlertTriangle className="text-red-400" size={32} />
            </div>
            <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-1)' }}>
              Algo salió mal
            </h2>
            <p className="text-sm mb-2" style={{ color: 'var(--text-2)' }}>
              {this.state.error?.message ?? 'Ha ocurrido un error inesperado.'}
            </p>
            <p className="text-xs mb-6" style={{ color: 'var(--text-3)' }}>
              Si el problema persiste, recarga la página.
            </p>
            <button
              onClick={this.handleReset}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}
            >
              <RefreshCw size={14} />
              Reintentar
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
