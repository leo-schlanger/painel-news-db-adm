import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { fetchStatsWithTrends, fetchNews, fetchNewsOverTime, getCategories } from '../lib/supabase'
import { useAutoRefresh } from '@/hooks/useAutoRefresh'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
import { useSettings } from '@/context/SettingsContext'
import { useFavorites } from '@/context/FavoritesContext'
import { toast } from '@/hooks/useToast'
import { LineChart } from '@/components/charts'
import NewsDetailModal from '@/components/NewsDetailModal'
import {
  Newspaper,
  Clock,
  TrendingUp,
  TrendingDown,
  Radio,
  AlertTriangle,
  ExternalLink,
  ArrowRight,
  Flame,
  Zap,
  BarChart3,
  RefreshCw,
  Heart
} from 'lucide-react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Skeleton,
  Button,
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue
} from '@/components/ui'
import { intervals } from '@/hooks/useAutoRefresh'

function TrendIndicator({ value }) {
  if (!value || value === 0) return null

  const isPositive = value > 0
  const Icon = isPositive ? TrendingUp : TrendingDown
  const color = isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'

  return (
    <div className={`flex items-center gap-1 text-xs font-medium ${color}`}>
      <Icon className="w-3 h-3" />
      <span>{isPositive ? '+' : ''}{value}%</span>
    </div>
  )
}

function StatCard({ icon: Icon, label, value, color = 'blue', subtext, trend }) {
  const { settings } = useSettings()
  const colorConfig = {
    blue: {
      bg: 'bg-gradient-to-br from-blue-500 to-blue-600',
      light: 'bg-blue-50 dark:bg-blue-900/30',
      text: 'text-blue-600 dark:text-blue-400',
      shadow: 'shadow-blue-500/20'
    },
    green: {
      bg: 'bg-gradient-to-br from-emerald-500 to-emerald-600',
      light: 'bg-emerald-50 dark:bg-emerald-900/30',
      text: 'text-emerald-600 dark:text-emerald-400',
      shadow: 'shadow-emerald-500/20'
    },
    orange: {
      bg: 'bg-gradient-to-br from-orange-500 to-orange-600',
      light: 'bg-orange-50 dark:bg-orange-900/30',
      text: 'text-orange-600 dark:text-orange-400',
      shadow: 'shadow-orange-500/20'
    },
    purple: {
      bg: 'bg-gradient-to-br from-violet-500 to-violet-600',
      light: 'bg-violet-50 dark:bg-violet-900/30',
      text: 'text-violet-600 dark:text-violet-400',
      shadow: 'shadow-violet-500/20'
    },
  }

  const config = colorConfig[color]

  return (
    <Card className="relative overflow-hidden group card-hover">
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-[hsl(var(--muted-foreground))]">{label}</p>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-bold text-[hsl(var(--foreground))]">{value ?? '-'}</p>
              {settings.showTrendIndicators && trend !== undefined && (
                <TrendIndicator value={trend} />
              )}
            </div>
            {subtext && (
              <p className="text-xs text-[hsl(var(--muted-foreground))] flex items-center gap-1">
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
    green: { bg: 'bg-emerald-500', light: 'bg-emerald-50 dark:bg-emerald-900/30', ring: 'ring-emerald-500/20' },
    yellow: { bg: 'bg-amber-500', light: 'bg-amber-50 dark:bg-amber-900/30', ring: 'ring-amber-500/20' },
    blue: { bg: 'bg-sky-500', light: 'bg-sky-50 dark:bg-sky-900/30', ring: 'ring-sky-500/20' },
    pink: { bg: 'bg-pink-500', light: 'bg-pink-50 dark:bg-pink-900/30', ring: 'ring-pink-500/20' },
    red: { bg: 'bg-rose-500', light: 'bg-rose-50 dark:bg-rose-900/30', ring: 'ring-rose-500/20' },
    orange: { bg: 'bg-orange-500', light: 'bg-orange-50 dark:bg-orange-900/30', ring: 'ring-orange-500/20' },
  }

  const config = colorConfig[color] || colorConfig.blue

  return (
    <div className={`p-4 rounded-xl ${config.light} ring-1 ${config.ring} hover:ring-2 transition-all duration-200`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-semibold text-[hsl(var(--foreground))]">{category}</span>
        <span className="text-lg font-bold text-[hsl(var(--foreground))]">{count.toLocaleString()}</span>
      </div>
      <div className="h-2 bg-white/60 dark:bg-black/20 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${config.bg} transition-all duration-700 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <p className="text-xs text-[hsl(var(--muted-foreground))] mt-2">{percentage.toFixed(1)}% do total</p>
    </div>
  )
}

function RecentNewsItem({ news, onViewDetails }) {
  const categories = getCategories()
  const categoryData = categories.find(c => c.value === news.category)
  const categoryLabel = categoryData?.label || news.category
  const { isFavorite, toggleFavorite } = useFavorites()

  const getPriorityIcon = (score) => {
    if (score >= 3) return <Flame className="w-4 h-4 text-red-500" />
    if (score >= 1) return <Zap className="w-4 h-4 text-orange-500" />
    return null
  }

  return (
    <div className="p-4 hover:bg-[hsl(var(--muted))]/50 transition-all duration-200 border-b border-[hsl(var(--border))] last:border-0 group">
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <button
            onClick={() => onViewDetails(news)}
            className="text-left w-full"
          >
            <p className="text-sm font-medium text-[hsl(var(--foreground))] line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {news.title}
            </p>
          </button>
          <div className="flex items-center flex-wrap gap-2 mt-2">
            <Badge variant={news.category}>
              {categoryLabel}
            </Badge>
            <div className="flex items-center gap-1 text-xs text-[hsl(var(--muted-foreground))]">
              {getPriorityIcon(news.priority_score)}
              <span className="font-medium">
                {news.priority_score?.toFixed(1)}
              </span>
            </div>
            <span className="text-xs text-[hsl(var(--muted-foreground))]">
              {news.sources?.name}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => toggleFavorite(news)}
            className="p-1.5 rounded-lg hover:bg-[hsl(var(--muted))] transition-colors"
          >
            <Heart className={`w-4 h-4 ${isFavorite(news.id) ? 'fill-red-500 text-red-500' : 'text-[hsl(var(--muted-foreground))]'}`} />
          </button>
          <a
            href={news.link}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 rounded-lg hover:bg-[hsl(var(--muted))] transition-colors"
          >
            <ExternalLink className="w-4 h-4 text-[hsl(var(--muted-foreground))] hover:text-blue-500" />
          </a>
        </div>
      </div>
    </div>
  )
}

function RecentNewsSkeleton() {
  return (
    <div className="p-4 border-b border-[hsl(var(--border))] last:border-0">
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
  const [newsOverTime, setNewsOverTime] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedNews, setSelectedNews] = useState(null)
  const [showModal, setShowModal] = useState(false)

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true)
      const [statsData, newsData, chartData] = await Promise.all([
        fetchStatsWithTrends(),
        fetchNews({ perPage: 10, orderBy: 'priority_score', orderDir: 'desc' }),
        fetchNewsOverTime(7)
      ])
      setStats(statsData)
      setRecentNews(newsData.data || [])
      setNewsOverTime(chartData || [])
    } catch (err) {
      setError(err.message)
      console.error('Error loading dashboard:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const { interval, setInterval, countdown, isRefreshing, refresh, isEnabled } = useAutoRefresh(loadData)

  useKeyboardShortcuts({
    onRefresh: () => {
      refresh()
      toast({ title: 'Dados atualizados', variant: 'success' })
    },
    onShowShortcuts: () => {
      const event = new CustomEvent('show-keyboard-shortcuts')
      window.dispatchEvent(event)
    }
  })

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleViewDetails = (news) => {
    setSelectedNews(news)
    setShowModal(true)
  }

  if (error) {
    return (
      <Card className="p-6 bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 border-red-200 dark:border-red-800">
        <div className="flex items-center gap-4 text-red-700 dark:text-red-400">
          <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-xl">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">Erro ao carregar dados</h3>
            <p className="text-sm mt-1">{error}</p>
            <p className="text-xs mt-2 opacity-80">Verifique se as variaveis de ambiente do Supabase estao configuradas.</p>
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-400 bg-clip-text text-transparent">Dashboard</h2>
          <p className="text-[hsl(var(--muted-foreground))] mt-1">Visao geral das noticias agregadas</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={interval} onValueChange={setInterval}>
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(intervals).map(([value, { label }]) => (
                <SelectItem key={value} value={value}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="secondary"
            onClick={() => {
              refresh()
              toast({ title: 'Dados atualizados', variant: 'success' })
            }}
            disabled={isLoading || isRefreshing}
          >
            <RefreshCw className={`w-4 h-4 ${(isLoading || isRefreshing) ? 'animate-spin' : ''}`} />
            {isEnabled && countdown > 0 ? `${countdown}s` : 'Atualizar'}
          </Button>
        </div>
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
              trend={stats?.trends?.newsLast24h}
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

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Line Chart */}
        <Card className="p-6">
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-[300px] w-full rounded-lg" />
            </div>
          ) : (
            <LineChart
              data={newsOverTime}
              dataKey="count"
              xAxisKey="date"
              title="Noticias nos Ultimos 7 Dias"
              color="#3b82f6"
            />
          )}
        </Card>

        {/* Categories Distribution */}
        <Card className="overflow-hidden">
          <CardHeader className="p-5 border-b border-[hsl(var(--border))] bg-gradient-to-r from-[hsl(var(--muted))] to-[hsl(var(--background))]">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <BarChart3 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
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
              <div className="space-y-3 max-h-[360px] overflow-y-auto">
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

      {/* Recent High Priority News */}
      <Card className="overflow-hidden">
        <CardHeader className="p-5 border-b border-[hsl(var(--border))] flex-row items-center justify-between bg-gradient-to-r from-[hsl(var(--muted))] to-[hsl(var(--background))]">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <Flame className="w-4 h-4 text-orange-600 dark:text-orange-400" />
            </div>
            <CardTitle className="text-base">Noticias de Alta Prioridade</CardTitle>
          </div>
          <Link
            to="/news"
            className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1 font-medium hover:gap-2 transition-all"
          >
            Ver todas <ArrowRight className="w-4 h-4" />
          </Link>
        </CardHeader>
        <div className="divide-y divide-[hsl(var(--border))]">
          {isLoading ? (
            <>
              <RecentNewsSkeleton />
              <RecentNewsSkeleton />
              <RecentNewsSkeleton />
              <RecentNewsSkeleton />
            </>
          ) : recentNews.length > 0 ? (
            recentNews.map(news => (
              <RecentNewsItem key={news.id} news={news} onViewDetails={handleViewDetails} />
            ))
          ) : (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-[hsl(var(--muted))] rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Newspaper className="w-8 h-8 text-[hsl(var(--muted-foreground))]" />
              </div>
              <p className="text-[hsl(var(--muted-foreground))] font-medium">Nenhuma noticia encontrada</p>
              <p className="text-[hsl(var(--muted-foreground))] text-sm mt-1 opacity-80">As noticias aparecerao aqui quando forem coletadas</p>
            </div>
          )}
        </div>
      </Card>

      <NewsDetailModal
        news={selectedNews}
        open={showModal}
        onOpenChange={setShowModal}
      />
    </div>
  )
}
