import React from 'react'
import { useTranslation } from 'react-i18next'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface Props {
  children: React.ReactNode
  fallback?: React.ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

interface InnerProps extends Props {
  t: (key: string) => string
}

class ErrorBoundaryInner extends React.Component<InnerProps, State> {
  constructor(props: InnerProps) {
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
    const { t } = this.props

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
              {t('errors.boundaryTitle')}
            </h2>
            <p className="text-sm mb-2" style={{ color: 'var(--text-2)' }}>
              {this.state.error?.message ?? t('errors.unexpected')}
            </p>
            <p className="text-xs mb-6" style={{ color: 'var(--text-3)' }}>
              {t('errors.boundaryHint')}
            </p>
            <button
              onClick={this.handleReset}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}
            >
              <RefreshCw size={14} />
              {t('errors.retry')}
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default function ErrorBoundary(props: Props) {
  const { t } = useTranslation()
  return <ErrorBoundaryInner {...props} t={t} />
}
