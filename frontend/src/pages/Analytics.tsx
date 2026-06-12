import React, { useState, useEffect } from 'react'
import { BarChart2, Loader2, TrendingUp, Activity, Target } from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { api, Analytics } from '../api/client'

const BAR_COLORS = ['#2563eb', '#16a34a', '#d97706', '#9333ea', '#ef4444', '#0891b2']

function toChartData(counts: Record<string, number>) {
  return Object.entries(counts).map(([name, value]) => ({ name, value }))
}

interface StatBadge {
  label: string
  value: string | number
  icon: React.ReactNode
  color: string
}

function StatCard({ stat }: { stat: StatBadge }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.color}`}>
        {stat.icon}
      </div>
      <div>
        <p className="text-sm text-gray-500">{stat.label}</p>
        <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
      </div>
    </div>
  )
}

interface BarSectionProps {
  title: string
  data: { name: string; value: number }[]
  color?: string
}

function BarSection({ title, data }: BarSectionProps) {
  if (data.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-base font-semibold text-gray-900 mb-4">{title}</h3>
        <p className="text-sm text-gray-400 text-center py-8">No data available</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-base font-semibold text-gray-900 mb-5">{title}</h3>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 0, right: 10, left: -10, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 11 }}
            angle={-20}
            textAnchor="end"
            interval={0}
          />
          <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
          <Tooltip
            contentStyle={{
              borderRadius: '8px',
              border: '1px solid #e5e7eb',
              fontSize: '12px',
            }}
          />
          <Bar dataKey="value" name="Count" radius={[4, 4, 0, 0]}>
            {data.map((_, index) => (
              <Cell key={index} fill={BAR_COLORS[index % BAR_COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true)
      try {
        const res = await api.getAnalytics()
        setAnalytics(res.data)
      } catch {
        setError('Failed to load analytics data.')
      } finally {
        setLoading(false)
      }
    }
    fetchAnalytics()
  }, [])

  const statCards: StatBadge[] = analytics
    ? [
        {
          label: 'Total Episodes',
          value: analytics.total_episodes,
          icon: <Activity size={22} className="text-blue-600" />,
          color: 'bg-blue-50',
        },
        {
          label: 'Average Score',
          value:
            analytics.avg_score !== null && analytics.avg_score !== undefined
              ? analytics.avg_score.toFixed(2)
              : '—',
          icon: <TrendingUp size={22} className="text-green-600" />,
          color: 'bg-green-50',
        },
        {
          label: 'Unique Classifications',
          value: Object.keys(analytics.classification_counts).length,
          icon: <Target size={22} className="text-purple-600" />,
          color: 'bg-purple-50',
        },
      ]
    : []

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-500 mt-1">
          Insights into your fitness assessment effectiveness.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-24">
          <Loader2 size={32} className="animate-spin text-gray-400" />
        </div>
      ) : error ? (
        <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      ) : !analytics ? null : (
        <>
          {/* Summary stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            {statCards.map((stat) => (
              <StatCard key={stat.label} stat={stat} />
            ))}
          </div>

          {analytics.total_episodes === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-16 text-center text-gray-400">
              <BarChart2 size={48} className="mx-auto mb-3 opacity-30" />
              <p className="text-base font-medium">No analytics data yet</p>
              <p className="text-sm mt-1">
                Complete some assessments to see insights here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <BarSection
                title="Classification Distribution"
                data={toChartData(analytics.classification_counts)}
              />
              <BarSection
                title="Recommendation Distribution"
                data={toChartData(analytics.recommendation_counts)}
              />
              <div className="lg:col-span-2">
                <BarSection
                  title="Program Distribution"
                  data={toChartData(analytics.program_counts)}
                />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
