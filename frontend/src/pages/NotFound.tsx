import { useNavigate } from 'react-router-dom'
import { Home, Frown } from 'lucide-react'

export default function NotFound() {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center">
        <Frown size={56} className="mx-auto text-gray-300 mb-4" />
        <h1 className="text-6xl font-bold text-gray-200 mb-2">404</h1>
        <p className="text-xl font-semibold text-gray-700 mb-1">Page not found</p>
        <p className="text-gray-500 mb-8">The page you're looking for doesn't exist.</p>
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-lg text-sm transition-colors"
        >
          <Home size={16} />
          Back to Dashboard
        </button>
      </div>
    </div>
  )
}
