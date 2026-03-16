import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-300">404</h1>
        <p className="text-xl font-semibold text-gray-600 mt-4">Página no encontrada</p>
        <Link to="/" className="mt-6 inline-block px-6 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700">
          Volver al inicio
        </Link>
      </div>
    </div>
  )
}
