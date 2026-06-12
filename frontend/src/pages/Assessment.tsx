import { useState, FormEvent } from 'react'
import { ClipboardList, CheckCircle, Loader2 } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { api, EpisodeResponse } from '../api/client'

const SMM_OPTIONS = [
  { value: 'normal', label: 'Normal' },
  { value: 'high', label: 'High' },
  { value: 'low', label: 'Low' },
]

const GOAL_OPTIONS = [
  { value: 'fat_loss', label: 'Fat Loss' },
  { value: 'muscle_gain', label: 'Muscle Gain' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'general_fitness', label: 'General Fitness' },
]

export default function Assessment() {
  const { user } = useAuth()
  const [pbf, setPbf] = useState('')
  const [smm, setSmm] = useState('normal')
  const [goal, setGoal] = useState('general_fitness')
  const [restriction, setRestriction] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<EpisodeResponse | null>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setResult(null)
    setLoading(true)
    try {
      const res = await api.generateEpisode({
        pbf: parseFloat(pbf),
        smm,
        goal,
        restriction: restriction.trim() || undefined,
        user_id: user?.id,
        username: user?.username,
      })
      setResult(res.data)
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { detail?: string } } }
      setError(axiosError.response?.data?.detail ?? 'Failed to generate assessment. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Fitness Assessment</h1>
        <p className="text-gray-500 mt-1">
          Enter your body composition data to get personalized recommendations.
        </p>
      </div>

      {/* Form */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center">
            <ClipboardList size={20} className="text-brand-600" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900">Body Composition Input</h2>
        </div>

        {error && (
          <div className="mb-5 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* PBF */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Body Fat Percentage (PBF) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={pbf}
              onChange={(e) => setPbf(e.target.value)}
              required
              min={1}
              max={70}
              step={0.1}
              placeholder="e.g. 22.5"
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition"
            />
            <p className="mt-1 text-xs text-gray-400">Enter value between 1–70 (%)</p>
          </div>

          {/* SMM */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Skeletal Muscle Mass (SMM) <span className="text-red-500">*</span>
            </label>
            <select
              value={smm}
              onChange={(e) => setSmm(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition bg-white"
            >
              {SMM_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Goal */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fitness Goal <span className="text-red-500">*</span>
            </label>
            <select
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition bg-white"
            >
              {GOAL_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Restriction */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Restrictions / Injuries{' '}
              <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <input
              type="text"
              value={restriction}
              onChange={(e) => setRestriction(e.target.value)}
              placeholder="e.g. knee injury, no jumping"
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Generating Recommendation...
              </>
            ) : (
              'Generate Recommendation'
            )}
          </button>
        </form>
      </div>

      {/* Result */}
      {result && (
        <div className="bg-white rounded-xl shadow-sm border border-green-200 p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
              <CheckCircle size={20} className="text-green-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Your Recommendation</h2>
              <p className="text-sm text-gray-500">Episode #{result.episode_id}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-blue-50 border border-blue-100">
                <p className="text-xs font-medium text-blue-600 uppercase tracking-wider mb-1">
                  Classification
                </p>
                <p className="text-base font-semibold text-gray-900">{result.classification}</p>
              </div>
              <div className="p-4 rounded-lg bg-purple-50 border border-purple-100">
                <p className="text-xs font-medium text-purple-600 uppercase tracking-wider mb-1">
                  Program
                </p>
                <p className="text-base font-semibold text-gray-900">{result.program}</p>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-green-50 border border-green-100">
              <p className="text-xs font-medium text-green-600 uppercase tracking-wider mb-2">
                Recommendation
              </p>
              <p className="text-sm text-gray-800 leading-relaxed">{result.recommendation}</p>
            </div>

            <div className="flex items-center gap-4 text-xs text-gray-400 pt-1">
              <span>Episode ID: {result.episode_id}</span>
              <span>Assessment ID: {result.assessment_id}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
