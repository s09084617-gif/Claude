import { useState, useEffect, FormEvent } from 'react'
import { Dumbbell, Loader2, CheckCircle } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { api, Workout } from '../api/client'

const GOAL_OPTIONS = [
  { value: 'fat_loss', label: 'Fat Loss' },
  { value: 'muscle_gain', label: 'Muscle Gain' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'general_fitness', label: 'General Fitness' },
]

export default function Workouts() {
  const { user } = useAuth()

  // Generate form state
  const [program, setProgram] = useState('')
  const [goal, setGoal] = useState('general_fitness')
  const [restriction, setRestriction] = useState('')
  const [generating, setGenerating] = useState(false)
  const [genError, setGenError] = useState('')
  const [generatedWorkout, setGeneratedWorkout] = useState<Workout | null>(null)

  // History state
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [historyLoading, setHistoryLoading] = useState(true)
  const [historyError, setHistoryError] = useState('')

  useEffect(() => {
    const fetchWorkouts = async () => {
      setHistoryLoading(true)
      try {
        const res = await api.getWorkouts(user?.id)
        setWorkouts(res.data)
      } catch {
        setHistoryError('Failed to load workout history.')
      } finally {
        setHistoryLoading(false)
      }
    }
    fetchWorkouts()
  }, [user?.id])

  const handleGenerate = async (e: FormEvent) => {
    e.preventDefault()
    setGenError('')
    setGeneratedWorkout(null)
    setGenerating(true)
    try {
      const res = await api.generateWorkout({
        program: program.trim(),
        goal,
        restriction: restriction.trim() || undefined,
        user_id: user?.id,
        username: user?.username,
      })
      setGeneratedWorkout(res.data)
      // Refresh history
      const histRes = await api.getWorkouts(user?.id)
      setWorkouts(histRes.data)
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { detail?: string } } }
      setGenError(axiosError.response?.data?.detail ?? 'Failed to generate workout.')
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Workouts</h1>
        <p className="text-gray-500 mt-1">Generate customized workouts and view your history.</p>
      </div>

      {/* Generate Workout Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
            <Dumbbell size={20} className="text-green-600" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900">Generate Workout</h2>
        </div>

        {genError && (
          <div className="mb-5 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
            {genError}
          </div>
        )}

        <form onSubmit={handleGenerate} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Program <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={program}
                onChange={(e) => setProgram(e.target.value)}
                required
                placeholder="e.g. Strength A, HIIT Circuit"
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Goal <span className="text-red-500">*</span>
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
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Restrictions / Injuries{' '}
              <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <input
              type="text"
              value={restriction}
              onChange={(e) => setRestriction(e.target.value)}
              placeholder="e.g. no heavy lifting, knee injury"
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition"
            />
          </div>

          <button
            type="submit"
            disabled={generating}
            className="flex items-center gap-2 px-6 py-2.5 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg text-sm transition-colors"
          >
            {generating ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Dumbbell size={16} />
                Generate Workout
              </>
            )}
          </button>
        </form>

        {/* Generated workout result */}
        {generatedWorkout && (
          <div className="mt-6 p-5 rounded-lg bg-green-50 border border-green-200">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle size={18} className="text-green-600" />
              <h3 className="font-semibold text-gray-900">Workout Generated!</h3>
            </div>
            <div className="space-y-2 text-sm text-gray-700">
              <p>
                <span className="font-medium">Program:</span> {generatedWorkout.program}
              </p>
              {generatedWorkout.details?.goal && (
                <p>
                  <span className="font-medium">Goal:</span> {generatedWorkout.details.goal}
                </p>
              )}
              {generatedWorkout.details?.workouts && (
                <div>
                  <p className="font-medium mb-1">Exercises:</p>
                  <pre className="whitespace-pre-wrap text-xs bg-white rounded p-3 border border-green-100 font-sans leading-relaxed">
                    {JSON.stringify(generatedWorkout.details.workouts, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Workout History */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-5">Workout History</h2>

        {historyLoading ? (
          <div className="flex justify-center py-10">
            <Loader2 size={24} className="animate-spin text-gray-400" />
          </div>
        ) : historyError ? (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
            {historyError}
          </div>
        ) : workouts.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            <Dumbbell size={36} className="mx-auto mb-2 opacity-40" />
            <p className="text-sm">No workouts generated yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="text-left py-3 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Program
                  </th>
                  <th className="text-left py-3 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Goal
                  </th>
                  <th className="text-left py-3 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {workouts.map((w) => (
                  <tr key={w.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-3 text-gray-500">#{w.id}</td>
                    <td className="py-3 px-3 font-medium text-gray-900">
                      {w.program ?? '—'}
                    </td>
                    <td className="py-3 px-3">
                      {w.details?.goal ? (
                        <span className="inline-block px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                          {w.details.goal}
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="py-3 px-3 text-gray-500">
                      {w.created_at ? new Date(w.created_at).toLocaleDateString() : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
