import { useState, useEffect, FormEvent } from 'react'
import { TrendingUp, Plus, Trash2, Loader2, X, Download } from 'lucide-react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { api, ProgressLog, ProgressLogRequest } from '../api/client'
import { useToast } from '../contexts/ToastContext'

interface ChartDataPoint {
  date: string
  weight?: number
  pbf?: number
  smm?: number
}

export default function Progress() {
  const { toast } = useToast()
  const [logs, setLogs] = useState<ProgressLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Form state
  const [weightKg, setWeightKg] = useState('')
  const [pbf, setPbf] = useState('')
  const [smmKg, setSmmKg] = useState('')
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')

  // Delete
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null)
  const [deleting, setDeleting] = useState(false)

  const fetchLogs = async () => {
    try {
      const res = await api.getProgressLogs()
      setLogs(res.data)
    } catch {
      setError('Failed to load progress logs.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLogs()
  }, [])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setFormError('')
    setSubmitting(true)
    try {
      const data: ProgressLogRequest = {}
      if (weightKg) data.weight_kg = parseFloat(weightKg)
      if (pbf) data.pbf = parseFloat(pbf)
      if (smmKg) data.smm_kg = parseFloat(smmKg)
      if (notes.trim()) data.notes = notes.trim()

      await api.createProgressLog(data)
      setWeightKg('')
      setPbf('')
      setSmmKg('')
      setNotes('')
      await fetchLogs()
      toast('Progress logged')
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { detail?: string } } }
      const msg = axiosError.response?.data?.detail ?? 'Failed to log progress.'
      setFormError(msg)
      toast(msg, 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: number) => {
    setDeleting(true)
    try {
      await api.deleteProgressLog(id)
      setLogs((prev) => prev.filter((l) => l.id !== id))
      setDeleteConfirmId(null)
      toast('Entry deleted', 'info')
    } catch {
      const msg = 'Failed to delete log.'
      setError(msg)
      toast(msg, 'error')
    } finally {
      setDeleting(false)
    }
  }

  // Build chart data (sorted ascending by date)
  const chartData: ChartDataPoint[] = [...logs]
    .sort((a, b) => {
      const dateA = a.logged_at ?? a.created_at ?? ''
      const dateB = b.logged_at ?? b.created_at ?? ''
      return new Date(dateA).getTime() - new Date(dateB).getTime()
    })
    .map((log) => {
      const dateStr = log.logged_at ?? log.created_at ?? ''
      return {
        date: dateStr ? new Date(dateStr).toLocaleDateString() : `#${log.id}`,
        ...(log.weight_kg !== undefined && { weight: log.weight_kg }),
        ...(log.pbf !== undefined && { pbf: log.pbf }),
        ...(log.smm_kg !== undefined && { smm: log.smm_kg }),
      }
    })

  const hasWeightData = chartData.some((d) => d.weight !== undefined)
  const hasPbfData = chartData.some((d) => d.pbf !== undefined)
  const hasSmmData = chartData.some((d) => d.smm !== undefined)

  const handleExportCsv = () => {
    const rows = [
      ['Date', 'Weight (kg)', 'Body Fat %', 'Muscle Mass (kg)', 'Notes'],
      ...[...logs]
        .sort((a, b) => {
          const da = a.logged_at ?? a.created_at ?? ''
          const db_ = b.logged_at ?? b.created_at ?? ''
          return new Date(da).getTime() - new Date(db_).getTime()
        })
        .map((l) => {
          const date = l.logged_at ?? l.created_at ?? ''
          return [
            date ? new Date(date).toLocaleDateString() : '',
            l.weight_kg ?? '',
            l.pbf ?? '',
            l.smm_kg ?? '',
            (l.notes ?? '').replace(/,/g, ' '),
          ]
        }),
    ]
    const csv = rows.map((r) => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `progress_${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Progress Tracking</h1>
        <p className="text-gray-500 mt-1">Log and visualize your body composition over time.</p>
      </div>

      {error && (
        <div className="mb-5 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError('')}>
            <X size={14} />
          </button>
        </div>
      )}

      {/* Log Entry Form */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
            <Plus size={20} className="text-purple-600" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900">Log Progress</h2>
        </div>

        {formError && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
            {formError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Weight (kg)
              </label>
              <input
                type="number"
                value={weightKg}
                onChange={(e) => setWeightKg(e.target.value)}
                min={0}
                step={0.1}
                placeholder="e.g. 75.5"
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Body Fat % (PBF)
              </label>
              <input
                type="number"
                value={pbf}
                onChange={(e) => setPbf(e.target.value)}
                min={0}
                max={70}
                step={0.1}
                placeholder="e.g. 22.5"
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Muscle Mass (kg)
              </label>
              <input
                type="number"
                value={smmKg}
                onChange={(e) => setSmmKg(e.target.value)}
                min={0}
                step={0.1}
                placeholder="e.g. 35.0"
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional notes..."
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-2 px-6 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-semibold rounded-lg text-sm transition-colors"
          >
            {submitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Logging...
              </>
            ) : (
              <>
                <Plus size={16} />
                Log Entry
              </>
            )}
          </button>
        </form>
      </div>

      {/* Chart */}
      {!loading && chartData.length >= 2 && (hasWeightData || hasPbfData || hasSmmData) && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <TrendingUp size={20} className="text-blue-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Progress Chart</h2>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb',
                  fontSize: '12px',
                }}
              />
              <Legend />
              {hasWeightData && (
                <Line
                  type="monotone"
                  dataKey="weight"
                  name="Weight (kg)"
                  stroke="#2563eb"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                  connectNulls
                />
              )}
              {hasPbfData && (
                <Line
                  type="monotone"
                  dataKey="pbf"
                  name="Body Fat %"
                  stroke="#ef4444"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                  connectNulls
                />
              )}
              {hasSmmData && (
                <Line
                  type="monotone"
                  dataKey="smm"
                  name="Muscle Mass (kg)"
                  stroke="#16a34a"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                  connectNulls
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* History Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-gray-900">Log History</h2>
          {logs.length > 0 && (
            <button
              onClick={handleExportCsv}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Download size={14} />
              Export CSV
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 size={28} className="animate-spin text-gray-400" />
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <TrendingUp size={40} className="mx-auto mb-2 opacity-30" />
            <p className="text-sm">No entries yet. Log your first progress above!</p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="text-left py-3 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Weight (kg)</th>
                    <th className="text-left py-3 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Body Fat %</th>
                    <th className="text-left py-3 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Muscle (kg)</th>
                    <th className="text-left py-3 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Notes</th>
                    <th className="py-3 px-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {[...logs]
                    .sort((a, b) => {
                      const dateA = a.logged_at ?? a.created_at ?? ''
                      const dateB = b.logged_at ?? b.created_at ?? ''
                      return new Date(dateB).getTime() - new Date(dateA).getTime()
                    })
                    .map((log) => {
                      const dateStr = log.logged_at ?? log.created_at ?? ''
                      return (
                        <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                          <td className="py-3 px-3 text-gray-600 text-xs">
                            {dateStr ? new Date(dateStr).toLocaleDateString() : '—'}
                          </td>
                          <td className="py-3 px-3 font-medium text-gray-900">
                            {log.weight_kg !== undefined ? log.weight_kg : '—'}
                          </td>
                          <td className="py-3 px-3 text-gray-700">
                            {log.pbf !== undefined ? `${log.pbf}%` : '—'}
                          </td>
                          <td className="py-3 px-3 text-gray-700">
                            {log.smm_kg !== undefined ? log.smm_kg : '—'}
                          </td>
                          <td className="py-3 px-3 text-gray-500 text-xs max-w-[200px] truncate">
                            {log.notes ?? '—'}
                          </td>
                          <td className="py-3 px-3 text-right">
                            {deleteConfirmId === log.id ? (
                              <div className="flex items-center gap-1.5 justify-end">
                                <button onClick={() => handleDelete(log.id)} disabled={deleting}
                                  className="px-2 py-1 rounded bg-red-600 text-white text-xs font-medium disabled:opacity-50">
                                  {deleting ? '...' : 'Yes'}
                                </button>
                                <button onClick={() => setDeleteConfirmId(null)}
                                  className="px-2 py-1 rounded border border-gray-300 text-gray-600 text-xs">
                                  No
                                </button>
                              </div>
                            ) : (
                              <button onClick={() => setDeleteConfirmId(log.id)}
                                className="p-1.5 rounded text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors">
                                <Trash2 size={14} />
                              </button>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="sm:hidden space-y-3">
              {[...logs]
                .sort((a, b) => {
                  const da = a.logged_at ?? a.created_at ?? ''
                  const db_ = b.logged_at ?? b.created_at ?? ''
                  return new Date(db_).getTime() - new Date(da).getTime()
                })
                .map((log) => {
                  const dateStr = log.logged_at ?? log.created_at ?? ''
                  return (
                    <div key={log.id} className="p-4 rounded-lg bg-gray-50 border border-gray-100">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-semibold text-gray-500">
                          {dateStr ? new Date(dateStr).toLocaleDateString() : '—'}
                        </p>
                        {deleteConfirmId === log.id ? (
                          <div className="flex items-center gap-1.5">
                            <button onClick={() => handleDelete(log.id)} disabled={deleting}
                              className="px-2 py-1 rounded bg-red-600 text-white text-xs font-medium disabled:opacity-50">
                              {deleting ? '...' : 'Delete'}
                            </button>
                            <button onClick={() => setDeleteConfirmId(null)}
                              className="px-2 py-1 rounded border border-gray-300 text-gray-600 text-xs">
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button onClick={() => setDeleteConfirmId(log.id)}
                            className="p-1 rounded text-gray-400 hover:text-red-600 transition-colors">
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-center">
                        {log.weight_kg !== undefined && (
                          <div className="p-2 rounded bg-white border border-gray-100">
                            <p className="text-xs text-gray-400">Weight</p>
                            <p className="font-semibold text-gray-900 text-sm">{log.weight_kg} kg</p>
                          </div>
                        )}
                        {log.pbf !== undefined && (
                          <div className="p-2 rounded bg-white border border-gray-100">
                            <p className="text-xs text-gray-400">Body Fat</p>
                            <p className="font-semibold text-gray-900 text-sm">{log.pbf}%</p>
                          </div>
                        )}
                        {log.smm_kg !== undefined && (
                          <div className="p-2 rounded bg-white border border-gray-100">
                            <p className="text-xs text-gray-400">Muscle</p>
                            <p className="font-semibold text-gray-900 text-sm">{log.smm_kg} kg</p>
                          </div>
                        )}
                      </div>
                      {log.notes && (
                        <p className="mt-2 text-xs text-gray-500 italic">{log.notes}</p>
                      )}
                    </div>
                  )
                })}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
