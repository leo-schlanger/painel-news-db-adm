import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { fetchStats, fetchNews, getCategories } from '../lib/supabase'
import {
  Newspaper,
  Clock,
  TrendingUp,
  Radio,
  AlertTriangle,
  ExternalLink,
  ArrowRight
} from 'lucide-react'

function StatCard({ icon: Icon, label, value, color = 'blue', subtext }) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    orange: 'bg-orange-50 text-orange-600',
    purple: 'bg-purple-50 text-purple-600',
  }

  return (
    <div className="card p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{label}</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{value ?? '-'}</p>
          {subtext && <p className="text-xs text-gray-400 mt-1">{subtext}</p>}
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  )
}

function CategoryBar({ category, count, total }) {
  const categories = getCategories()
  const cat = categories.find(c => c.value === category)
  const percentage = total > 0 ? (count / total) * 100 : 0

  const colorClasses = {
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    blue: 'bg-blue-500',
    pink: 'bg-pink-500',
    red: 'bg-red-500',
    orange: 'bg-orange-500',
  }

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="font-medium text-gray-700">{cat?.label || category}</span>
        <span className="text-gray-500">{count.toLocaleString()}</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${colorClasses[cat?.color] || 'bg-gray-400'}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

function RecentNewsItem({ news }) {
  const getPriorityClass = (score) => {
    if (score >= 3) return 'priority-high'
    if (score >= 1) return 'priority-medium'
    return 'priority-low'
  }

  return (
    <a
      href={news.link}
      target="_blank"
      rel="noopener noreferrer"
      className="block p-4 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0"
    >
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 line-clamp-2">
            {news.title}
          </p>
          <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
            <span className={`badge badge-${news.category}`}>
              {news.category}
            </span>
            <span className={getPriorityClass(news.priority_score)}>
              Score: {news.priority_score?.toFixed(1)}
            </span>
            <span>{news.sources?.name}</span>
          </div>
        </div>
        <ExternalLink className="w-4 h-4 text-gray-400 flex-shrink-0" />
      </div>
    </a>
  )
}

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [recentNews, setRecentNews] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setIsLoading(true)
      const [statsData, newsData] = await Promise.all([
        fetchStats(),
        fetchNews({ perPage: 10, orderBy: 'priority_score', orderDir: 'desc' })
      ])
      setStats(statsData)
      setRecentNews(newsData.data || [])
    } catch (err) {
      setError(err.message)
      console.error('Error loading dashboard:', err)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="card p-6 bg-red-50 border-red-200">
        <div className="flex items-center gap-3 text-red-700">
          <AlertTriangle className="w-6 h-6" />
          <div>
            <h3 className="font-semibold">Erro ao carregar dados</h3>
            <p className="text-sm mt-1">{error}</p>
            <p className="text-xs mt-2">Verifique se as variaveis de ambiente do Supabase estao configuradas.</p>
          </div>
        </div>
      </div>
    )
  }

  const categories = getCategories()
  const totalByCategory = Object.values(stats?.byCategory || {}).reduce((a, b) => a + b, 0)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
        <p className="text-gray-500 mt-1">Visao geral das noticias agregadas</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Newspaper}
          label="Total de Noticias"
          value={stats?.totalNews?.toLocaleString()}
          color="blue"
        />
        <StatCard
          icon={Clock}
          label="Ultimas 24h"
          value={stats?.newsLast24h?.toLocaleString()}
          color="green"
        />
        <StatCard
          icon={TrendingUp}
          label="Alta Prioridade"
          value={stats?.highPriority?.toLocaleString()}
          color="orange"
          subtext="Score >= 2"
        />
        <StatCard
          icon={Radio}
          label="Fontes Ativas"
          value={`${stats?.activeSources || 0}/${stats?.totalSources || 0}`}
          color="purple"
        />
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent High Priority News */}
        <div className="lg:col-span-2 card">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Noticias de Alta Prioridade</h3>
            <Link
              to="/news"
              className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              Ver todas <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="divide-y divide-gray-100">
            {recentNews.length > 0 ? (
              recentNews.map(news => (
                <RecentNewsItem key={news.id} news={news} />
              ))
            ) : (
              <div className="p-8 text-center text-gray-500">
                <Newspaper className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>Nenhuma noticia encontrada</p>
              </div>
            )}
          </div>
        </div>

        {/* Categories Distribution */}
        <div className="card">
          <div className="p-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">Por Categoria</h3>
          </div>
          <div className="p-4 space-y-4">
            {categories.map(cat => (
              <CategoryBar
                key={cat.value}
                category={cat.value}
                count={stats?.byCategory?.[cat.value] || 0}
                total={totalByCategory}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
