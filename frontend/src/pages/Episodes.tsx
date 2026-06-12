import { useState, useEffect } from 'react'
import { Play, Loader2 } from 'lucide-react'
import { api, Episode, EpisodeOutcome } from '../api/client'

function ProgramBadge({ text }: { text: string }) {
  return (
    <span className="inline-block px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-700 text-xs font-medium">
      {text}
    </span>
  )
}

function getOutcomeProgram(outcomes: EpisodeOutcome[]): string | null {
  for (const o of outcomes) {
    if (o.result?.program) return String(o.result.program)
  }
  return null
}

function getOutcomeClassification(outcomes: EpisodeOutcome[]): string | null {
  for (const o of outcomes) {
    if (o.result?.classification) return String(o.result.classification)
  }
  return null
}

export default function Episodes() {
  const [episodes, setEpisodes] = useState<Episode[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchEpisodes = async () => {
      setLoading(true)
      try {
        const res = await api.getEpisodes()
        setEpisodes(res.data)
      } catch {
        setError('Failed to load episodes.')
      } finally {
        setLoading(false)
      }
    }
    fetchEpisodes()
  }, [])

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Episodes</h1>
        <p className="text-gray-500 mt-1">Your fitness episode history and outcomes.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 size={28} className="animate-spin text-gray-400" />
          </div>
        ) : error ? (
          <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
            {error}
          </div>
        ) : episodes.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Play size={48} className="mx-auto mb-3 opacity-30" />
            <p className="text-base font-medium">No episodes yet</p>
            <p className="text-sm mt-1">
              Complete an assessment to start your first episode.
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Episode
                    </th>
                    <th className="text-left py-3 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Sequence
                    </th>
                    <th className="text-left py-3 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Program
                    </th>
                    <th className="text-left py-3 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Outcomes
                    </th>
                    <th className="text-left py-3 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Started
                    </th>
                    <th className="text-left py-3 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Completed
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {episodes.map((ep) => {
                    const program = getOutcomeProgram(ep.outcomes)
                    const classification = getOutcomeClassification(ep.outcomes)
                    return (
                      <tr key={ep.id} className="hover:bg-gray-50 transition-colors">
                        <td className="py-3.5 px-3">
                          <div>
                            <p className="font-medium text-gray-900">{ep.name}</p>
                            <p className="text-xs text-gray-400">ID: {ep.id}</p>
                          </div>
                        </td>
                        <td className="py-3.5 px-3 text-gray-600">{ep.sequence}</td>
                        <td className="py-3.5 px-3">
                          {program ? <ProgramBadge text={program} /> : <span className="text-gray-400">—</span>}
                        </td>
                        <td className="py-3.5 px-3">
                          {classification ? (
                            <span className="inline-block px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-medium">
                              {classification}
                            </span>
                          ) : (
                            <span className="text-gray-400">{ep.outcomes.length} outcome{ep.outcomes.length !== 1 ? 's' : ''}</span>
                          )}
                        </td>
                        <td className="py-3.5 px-3 text-gray-500 text-xs">
                          {ep.started_at ? new Date(ep.started_at).toLocaleDateString() : '—'}
                        </td>
                        <td className="py-3.5 px-3 text-gray-500 text-xs">
                          {ep.completed_at ? new Date(ep.completed_at).toLocaleDateString() : (
                            <span className="text-amber-500">In progress</span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="sm:hidden space-y-3">
              {episodes.map((ep) => (
                <div
                  key={ep.id}
                  className="p-4 rounded-lg bg-gray-50 border border-gray-100"
                >
                  <div className="flex items-start justify-between mb-2">
                    <p className="font-medium text-gray-900">{ep.name}</p>
                    {getOutcomeProgram(ep.outcomes) && (
                      <ProgramBadge text={getOutcomeProgram(ep.outcomes)!} />
                    )}
                  </div>
                  <div className="space-y-1 text-xs text-gray-500">
                    {getOutcomeClassification(ep.outcomes) && (
                      <p>Classification: {getOutcomeClassification(ep.outcomes)}</p>
                    )}
                    <p>Sequence: {ep.sequence}</p>
                    {ep.started_at && (
                      <p>Started: {new Date(ep.started_at).toLocaleDateString()}</p>
                    )}
                    {ep.completed_at ? (
                      <p>Completed: {new Date(ep.completed_at).toLocaleDateString()}</p>
                    ) : (
                      <p className="text-amber-500">In progress</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <p className="mt-4 text-xs text-gray-400 text-right">
              {episodes.length} episode{episodes.length !== 1 ? 's' : ''} total
            </p>
          </>
        )}
      </div>
    </div>
  )
}
