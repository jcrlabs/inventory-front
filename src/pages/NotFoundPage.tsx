import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

export default function NotFoundPage() {
  const { t } = useTranslation()
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-base)' }}>
      <div className="text-center">
        <h1 className="text-6xl font-bold" style={{ color: 'var(--text-3)' }}>404</h1>
        <p className="text-xl font-semibold mt-4" style={{ color: 'var(--text-2)' }}>{t('notFound.title')}</p>
        <Link to="/" className="mt-6 inline-block px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700">
          {t('notFound.back')}
        </Link>
      </div>
    </div>
  )
}
