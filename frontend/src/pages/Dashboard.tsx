import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ClipboardList, Dumbbell, Utensils, TrendingUp, ArrowRight, Play } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { api, Episode } from '../api/client'

interface StatCard {
  label: string
  value: number | string
  icon: React.ReactNode
  color: string
}

function StatCardItem({ card }: { card: StatCard }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${card.color}`}>
        {card.icon}
      </div>
      <div>
        <p className="text-sm text-gray-500">{card.label}</p>
        <p className="text-2xl font-bold text-gray-900">{card.value}</p>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    episodes: 0,
    workouts: 0,
    nutritionPlans: 0,
    progressLogs: 0,
  })
  const [recentEpisodes, setRecentEpisodes] = useState<Episode[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError('')
      try {
        const [episodesRes, workoutsRes, nutritionRes, progressRes] = await Promise.allSettled([
          api.getEpisodes(),
          api.getWorkouts(),
          api.getNutritionPlans(),
          api.getProgressLogs(),
        ])

        const episodes =
          episodesRes.status === 'fulfilled' ? episodesRes.value.data : []
        const workouts =
          workoutsRes.status === 'fulfilled' ? workoutsRes.value.data : []
        const nutrition =
          nutritionRes.status === 'fulfilled' ? nutritionRes.value.data : []
        const progress =
          progressRes.status === 'fulfilled' ? progressRes.value.data : []

        setStats({
          episodes: episodes.length,
          workouts: workouts.length,
          nutritionPlans: nutrition.length,
          progressLogs: progress.length,
        })
        setRecentEpisodes(episodes.slice(0, 3))
      } catch {
        setError('Failed to load dashboard data.')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const statCards: StatCard[] = [
    {
      label: 'Total Episodes',
      value: stats.episodes,
      icon: <Play size={22} className="text-blue-600" />,
      color: 'bg-blue-50',
    },
    {
      label: 'Total Workouts',
      value: stats.workouts,
      icon: <Dumbbell size={22} className="text-green-600" />,
      color: 'bg-green-50',
    },
    {
      label: 'Nutrition Plans',
      value: stats.nutritionPlans,
      icon: <Utensils size={22} className="text-orange-600" />,
      color: 'bg-orange-50',
    },
    {
      label: 'Progress Logs',
      value: stats.progressLogs,
      icon: <TrendingUp size={22} className="text-purple-600" />,
      color: 'bg-purple-50',
    },
  ]

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.username}!
        </h1>
        <p className="text-gray-500 mt-1">Here's an overview of your fitness journey.</p>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Stats */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gray-200" />
                <div className="space-y-2">
                  <div className="h-3 w-20 bg-gray-200 rounded" />
                  <div className="h-6 w-10 bg-gray-200 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statCards.map((card) => (
            <StatCardItem key={card.label} card={card} />
          ))}
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => navigate('/assessment')}
            className="flex items-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <ClipboardList size={16} />
            New Assessment
          </button>
          <button
            onClick={() => navigate('/workouts')}
            className="flex items-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <Dumbbell size={16} />
            Generate Workout
          </button>
          <button
            onClick={() => navigate('/progress')}
            className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <TrendingUp size={16} />
            Log Progress
          </button>
        </div>
      </div>

      {/* Recent Episodes */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Recent Episodes</h2>
          <button
            onClick={() => navigate('/episodes')}
            className="flex items-center gap-1 text-sm text-brand-600 hover:text-brand-700 font-medium"
          >
            View all
            <ArrowRight size={14} />
          </button>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-14 bg-gray-100 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : recentEpisodes.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            <Play size={36} className="mx-auto mb-2 opacity-40" />
            <p className="text-sm">No episodes yet. Start with an assessment!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentEpisodes.map((ep) => {
              const classification = ep.outcomes?.[0]?.result?.classification
              const program = ep.outcomes?.[0]?.result?.program
              return (
                <div
                  key={ep.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-gray-50 border border-gray-100"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      {ep.name ?? `Episode #${ep.id}`}
                    </p>
                    {program && (
                      <p className="text-xs text-gray-500 mt-0.5">Program: {String(program)}</p>
                    )}
                  </div>
                  <div className="text-right">
                    {ep.started_at && (
                      <p className="text-xs text-gray-400">
                        {new Date(ep.started_at).toLocaleDateString()}
                      </p>
                    )}
                    {classification && (
                      <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs">
                        {String(classification)}
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
