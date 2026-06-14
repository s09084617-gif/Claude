import { useState, useEffect, FormEvent } from 'react'
import { Dumbbell, Loader2, CheckCircle, ChevronDown, ChevronRight } from 'lucide-react'
import { useToast } from '../contexts/ToastContext'
import { api, Workout, WorkoutDetails } from '../api/client'

const GOAL_OPTIONS = [
  { value: 'fat_loss', label: 'Fat Loss' },
  { value: 'muscle_gain', label: 'Muscle Gain' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'general_fitness', label: 'General Fitness' },
]

interface Movement {
  name?: string
  sets?: number
  reps?: string | number
  duration?: string
  notes?: string
}

interface DayGroup {
  day?: string
  movements?: Movement[]
}

function ExerciseList({ details }: { details: WorkoutDetails }) {
  const workouts = details?.workouts ?? []
  if (workouts.length === 0) return <p className="text-sm text-gray-400">No exercises recorded.</p>

  const first = workouts[0] as DayGroup
  const isGrouped = first && typeof first === 'object' && 'movements' in first

  if (isGrouped) {
    return (
      <div className="space-y-4">
        {(workouts as DayGroup[]).map((group, gi) => (
          <div key={gi}>
            {group.day && (
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                {group.day}
              </p>
            )}
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-1.5 pr-4 font-medium text-gray-500">Exercise</th>
                  <th className="text-center py-1.5 px-2 font-medium text-gray-500">Sets</th>
                  <th className="text-center py-1.5 px-2 font-medium text-gray-500">Reps</th>
                  <th className="text-left py-1.5 pl-2 font-medium text-gray-500">Notes</th>
                </tr>
              </thead>
              <tbody>
                {(group.movements ?? []).map((m, mi) => (
                  <tr key={mi} className="border-b border-gray-50">
                    <td className="py-1.5 pr-4 font-medium text-gray-800">{m.name ?? '—'}</td>
                    <td className="py-1.5 px-2 text-center text-gray-600">{m.sets ?? '—'}</td>
                    <td className="py-1.5 px-2 text-center text-gray-600">{m.duration ?? m.reps ?? '—'}</td>
                    <td className="py-1.5 pl-2 text-gray-400">{m.notes ?? ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    )
  }

  return (
    <table className="w-full text-xs">
      <thead>
        <tr className="border-b border-gray-200">
          <th className="text-left py-1.5 pr-4 font-medium text-gray-500">Exercise</th>
          <th className="text-center py-1.5 px-2 font-medium text-gray-500">Sets</th>
          <th className="text-center py-1.5 px-2 font-medium text-gray-500">Reps</th>
          <th className="text-left py-1.5 pl-2 font-medium text-gray-500">Notes</th>
        </tr>
      </thead>
      <tbody>
        {(workouts as Movement[]).map((m, i) => (
          <tr key={i} className="border-b border-gray-50">
            <td className="py-1.5 pr-4 font-medium text-gray-800">{m.name ?? '—'}</td>
            <td className="py-1.5 px-2 text-center text-gray-600">{m.sets ?? '—'}</td>
            <td className="py-1.5 px-2 text-center text-gray-600">{m.duration ?? m.reps ?? '—'}</td>
            <td className="py-1.5 pl-2 text-gray-400">{m.notes ?? ''}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export default function Workouts() {
  const { toast } = useToast()

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
  const [expandedId, setExpandedId] = useState<number | null>(null)

  useEffect(() => {
    const fetchWorkouts = async () => {
      setHistoryLoading(true)
      try {
        const res = await api.getWorkouts()
        setWorkouts(res.data)
      } catch {
        setHistoryError('Failed to load workout history.')
      } finally {
        setHistoryLoading(false)
      }
    }
    fetchWorkouts()
  }, [])

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
      })
      setGeneratedWorkout(res.data)
      toast(`Workout generated for program: ${res.data.program}`)
      // Refresh history
      const histRes = await api.getWorkouts()
      setWorkouts(histRes.data)
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { detail?: string } } }
      const msg = axiosError.response?.data?.detail ?? 'Failed to generate workout.'
      setGenError(msg)
      toast(msg, 'error')
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
                  <p className="font-medium mb-2">Exercises:</p>
                  <div className="bg-white rounded-lg p-3 border border-green-100">
                    <ExerciseList details={generatedWorkout.details} />
                  </div>
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
          <div className="divide-y divide-gray-100">
            {workouts.map((w) => {
              const isOpen = expandedId === w.id
              return (
                <div key={w.id}>
                  <button
                    onClick={() => setExpandedId(isOpen ? null : w.id)}
                    className="w-full flex items-center gap-3 py-3 px-3 hover:bg-gray-50 transition-colors text-left"
                  >
                    {isOpen ? (
                      <ChevronDown size={14} className="text-gray-400 shrink-0" />
                    ) : (
                      <ChevronRight size={14} className="text-gray-400 shrink-0" />
                    )}
                    <span className="text-xs text-gray-400 w-10 shrink-0">#{w.id}</span>
                    <span className="font-medium text-gray-900 flex-1 text-sm">{w.program ?? '—'}</span>
                    {w.details?.goal && (
                      <span className="inline-block px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                        {w.details.goal}
                      </span>
                    )}
                    <span className="text-xs text-gray-400 ml-3 shrink-0">
                      {w.created_at ? new Date(w.created_at).toLocaleDateString() : '—'}
                    </span>
                  </button>
                  {isOpen && (
                    <div className="px-10 pb-5">
                      <ExerciseList details={w.details} />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
