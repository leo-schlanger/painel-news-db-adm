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
  ArrowRight,
  Flame,
  Zap,
  BarChart3
} from 'lucide-react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Skeleton
} from '@/components/ui'

function StatCard({ icon: Icon, label, value, color = 'blue', subtext, trend }) {
  const colorConfig = {
    blue: {
      bg: 'bg-gradient-to-br from-blue-500 to-blue-600',
      light: 'bg-blue-50',
      text: 'text-blue-600',
      shadow: 'shadow-blue-500/20'
    },
    green: {
      bg: 'bg-gradient-to-br from-emerald-500 to-emerald-600',
      light: 'bg-emerald-50',
      text: 'text-emerald-600',
      shadow: 'shadow-emerald-500/20'
    },
    orange: {
      bg: 'bg-gradient-to-br from-orange-500 to-orange-600',
      light: 'bg-orange-50',
      text: 'text-orange-600',
      shadow: 'shadow-orange-500/20'
    },
    purple: {
      bg: 'bg-gradient-to-br from-violet-500 to-violet-600',
      light: 'bg-violet-50',
      text: 'text-violet-600',
      shadow: 'shadow-violet-500/20'
    },
  }

  const config = colorConfig[color]

  return (
    <Card className="relative overflow-hidden group">
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-500">{label}</p>
            <p className="text-3xl font-bold text-gray-900">{value ?? '-'}</p>
            {subtext && (
              <p className="text-xs text-gray-400 flex items-center gap-1">
                {subtext}
              </p>
            )}
          </div>
          <div className={`p-3 rounded-xl ${config.bg} shadow-lg ${config.shadow}`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
      </div>
      <div className={`absolute bottom-0 left-0 right-0 h-1 ${config.bg} opacity-20 group-hover:opacity-40 transition-opacity`} />
    </Card>
  )
}

function StatCardSkeleton() {
  return (
    <Card className="p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-20" />
        </div>
        <Skeleton className="w-12 h-12 rounded-xl" />
      </div>
    </Card>
  )
}

function CategoryCard({ category, count, total, color }) {
  const percentage = total > 0 ? (count / total) * 100 : 0

  const colorConfig = {
    green: { bg: 'bg-emerald-500', light: 'bg-emerald-50', ring: 'ring-emerald-500/20' },
    yellow: { bg: 'bg-amber-500', light: 'bg-amber-50', ring: 'ring-amber-500/20' },
    blue: { bg: 'bg-sky-500', light: 'bg-sky-50', ring: 'ring-sky-500/20' },
    pink: { bg: 'bg-pink-500', light: 'bg-pink-50', ring: 'ring-pink-500/20' },
    red: { bg: 'bg-rose-500', light: 'bg-rose-50', ring: 'ring-rose-500/20' },
    orange: { bg: 'bg-orange-500', light: 'bg-orange-50', ring: 'ring-orange-500/20' },
  }

  const config = colorConfig[color] || colorConfig.blue

  return (
    <div className={`p-4 rounded-xl ${config.light} ring-1 ${config.ring} hover:ring-2 transition-all duration-200`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-semibold text-gray-700">{category}</span>
        <span className="text-lg font-bold text-gray-900">{count.toLocaleString()}</span>
      </div>
      <div className="h-2 bg-white/60 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${config.bg} transition-all duration-700 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <p className="text-xs text-gray-500 mt-2">{percentage.toFixed(1)}% do total</p>
    </div>
  )
}

function RecentNewsItem({ news }) {
  const categories = getCategories()
  const categoryData = categories.find(c => c.value === news.category)
  const categoryLabel = categoryData?.label || news.category

  const getPriorityIcon = (score) => {
    if (score >= 3) return <Flame className="w-4 h-4 text-red-500" />
    if (score >= 1) return <Zap className="w-4 h-4 text-orange-500" />
    return null
  }

  return (
    <a
      href={news.link}
      target="_blank"
      rel="noopener noreferrer"
      className="block p-4 hover:bg-gray-50/80 transition-all duration-200 border-b border-gray-100 last:border-0 group"
    >
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 line-clamp-2 group-hover:text-blue-700 transition-colors">
            {news.title}
          </p>
          <div className="flex items-center flex-wrap gap-2 mt-2">
            <Badge variant={news.category}>
              {categoryLabel}
            </Badge>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              {getPriorityIcon(news.priority_score)}
              <span className="font-medium">
                {news.priority_score?.toFixed(1)}
              </span>
            </div>
            <span className="text-xs text-gray-400">
              {news.sources?.name}
            </span>
          </div>
        </div>
        <ExternalLink className="w-4 h-4 text-gray-300 group-hover:text-blue-500 transition-colors flex-shrink-0 mt-1" />
      </div>
    </a>
  )
}

function RecentNewsSkeleton() {
  return (
    <div className="p-4 border-b border-gray-100 last:border-0">
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-3/4 mb-3" />
      <div className="flex items-center gap-3">
        <Skeleton className="h-5 w-20 rounded-full" />
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-24" />
      </div>
    </div>
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

  if (error) {
    return (
      <Card className="p-6 bg-gradient-to-r from-red-50 to-rose-50 border-red-200">
        <div className="flex items-center gap-4 text-red-700">
          <div className="p-3 bg-red-100 rounded-xl">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">Erro ao carregar dados</h3>
            <p className="text-sm mt-1 text-red-600">{error}</p>
            <p className="text-xs mt-2 text-red-500">Verifique se as variaveis de ambiente do Supabase estao configuradas.</p>
          </div>
        </div>
      </Card>
    )
  }

  const categories = getCategories()
  const totalByCategory = Object.values(stats?.byCategory || {}).reduce((a, b) => a + b, 0)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">Dashboard</h2>
        <p className="text-gray-500 mt-1">Visao geral das noticias agregadas</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : (
          <>
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
          </>
        )}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent High Priority News */}
        <Card className="lg:col-span-2 overflow-hidden">
          <CardHeader className="p-5 border-b border-gray-100 flex-row items-center justify-between bg-gradient-to-r from-gray-50 to-white">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Flame className="w-4 h-4 text-orange-600" />
              </div>
              <CardTitle className="text-base">Noticias de Alta Prioridade</CardTitle>
            </div>
            <Link
              to="/news"
              className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1 font-medium hover:gap-2 transition-all"
            >
              Ver todas <ArrowRight className="w-4 h-4" />
            </Link>
          </CardHeader>
          <div className="divide-y divide-gray-100">
            {isLoading ? (
              <>
                <RecentNewsSkeleton />
                <RecentNewsSkeleton />
                <RecentNewsSkeleton />
                <RecentNewsSkeleton />
              </>
            ) : recentNews.length > 0 ? (
              recentNews.map(news => (
                <RecentNewsItem key={news.id} news={news} />
              ))
            ) : (
              <div className="p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Newspaper className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 font-medium">Nenhuma noticia encontrada</p>
                <p className="text-gray-400 text-sm mt-1">As noticias aparecerao aqui quando forem coletadas</p>
              </div>
            )}
          </div>
        </Card>

        {/* Categories Distribution */}
        <Card className="overflow-hidden">
          <CardHeader className="p-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BarChart3 className="w-4 h-4 text-blue-600" />
              </div>
              <CardTitle className="text-base">Por Categoria</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            {isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-24 w-full rounded-xl" />
                <Skeleton className="h-24 w-full rounded-xl" />
                <Skeleton className="h-24 w-full rounded-xl" />
              </div>
            ) : (
              <div className="space-y-3">
                {categories.map(cat => (
                  <CategoryCard
                    key={cat.value}
                    category={cat.label}
                    count={stats?.byCategory?.[cat.value] || 0}
                    total={totalByCategory}
                    color={cat.color}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
