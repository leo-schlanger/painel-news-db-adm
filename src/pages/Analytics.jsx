import { useState, useEffect, useCallback } from 'react'
import { fetchSourceAnalytics, fetchNewsOverTime, fetchLogsOverTime, fetchNewsByCategory } from '@/lib/supabase'
import { LineChart, BarChart, AreaChart } from '@/components/charts'
import { useAutoRefresh } from '@/hooks/useAutoRefresh'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
import { toast } from '@/hooks/useToast'
import {
  TrendingUp,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Activity,
  Newspaper,
  BarChart3,
  Zap
} from 'lucide-react'
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
  Skeleton,
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue
} from '@/components/ui'
import { intervals } from '@/hooks/useAutoRefresh'

function StatCard({ icon: Icon, label, value, subtext, color = 'blue' }) {
  const colorConfig = {
    blue: {
      bg: 'bg-gradient-to-br from-blue-500 to-blue-600',
      light: 'bg-blue-100 dark:bg-blue-900/30',
      text: 'text-blue-600 dark:text-blue-400',
      shadow: 'shadow-blue-500/20'
    },
    green: {
      bg: 'bg-gradient-to-br from-emerald-500 to-emerald-600',
      light: 'bg-emerald-100 dark:bg-emerald-900/30',
      text: 'text-emerald-600 dark:text-emerald-400',
      shadow: 'shadow-emerald-500/20'
    },
    orange: {
      bg: 'bg-gradient-to-br from-orange-500 to-orange-600',
      light: 'bg-orange-100 dark:bg-orange-900/30',
      text: 'text-orange-600 dark:text-orange-400',
      shadow: 'shadow-orange-500/20'
    },
    red: {
      bg: 'bg-gradient-to-br from-red-500 to-red-600',
      light: 'bg-red-100 dark:bg-red-900/30',
      text: 'text-red-600 dark:text-red-400',
      shadow: 'shadow-red-500/20'
    },
    violet: {
      bg: 'bg-gradient-to-br from-violet-500 to-violet-600',
      light: 'bg-violet-100 dark:bg-violet-900/30',
      text: 'text-violet-600 dark:text-violet-400',
      shadow: 'shadow-violet-500/20'
    },
  }

  const config = colorConfig[color]

  return (
    <Card className="relative overflow-hidden group card-hover">
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-[hsl(var(--muted-foreground))]">{label}</p>
            <p className="text-2xl font-bold text-[hsl(var(--foreground))]">{value}</p>
            {subtext && (
              <p className="text-xs text-[hsl(var(--muted-foreground))]">{subtext}</p>
            )}
          </div>
          <div className={`p-3 rounded-xl ${config.bg} shadow-lg ${config.shadow}`}>
            <Icon className="w-5 h-5 text-white" />
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
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-7 w-16" />
        </div>
        <Skeleton className="w-11 h-11 rounded-xl" />
      </div>
    </Card>
  )
}

function ChartSkeleton() {
  return (
    <Card className="p-6">
      <Skeleton className="h-4 w-40 mb-4" />
      <Skeleton className="h-[300px] w-full rounded-lg" />
    </Card>
  )
}

function EmptyChartState({ title, message }) {
  return (
    <div className="h-[300px] flex flex-col items-center justify-center text-center">
      <div className="w-12 h-12 bg-[hsl(var(--muted))] rounded-xl flex items-center justify-center mb-3">
        <BarChart3 className="w-6 h-6 text-[hsl(var(--muted-foreground))]" />
      </div>
      <p className="text-sm font-medium text-[hsl(var(--foreground))]">{title}</p>
      <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">{message}</p>
    </div>
  )
}

export default function Analytics() {
  const [sourceStats, setSourceStats] = useState([])
  const [newsOverTime, setNewsOverTime] = useState([])
  const [logsOverTime, setLogsOverTime] = useState([])
  const [categoryData, setCategoryData] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const period = 7 // Fixed at 7 days for egress optimization

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const days = period

      const [sources, news, logs, categories] = await Promise.all([
        fetchSourceAnalytics(),
        fetchNewsOverTime(days),
        fetchLogsOverTime(days),
        fetchNewsByCategory()
      ])

      setSourceStats(sources || [])
      setNewsOverTime(news || [])
      setLogsOverTime(logs || [])
      setCategoryData(categories || [])
    } catch (err) {
      setError(err.message)
      console.error('Error loading analytics:', err)
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

  // Calculate summary metrics
  const totalFetches = logsOverTime.reduce((sum, d) => sum + (d.fetches || 0), 0)
  const totalErrors = logsOverTime.reduce((sum, d) => sum + (d.errors || 0), 0)
  const totalNewsCollected = logsOverTime.reduce((sum, d) => sum + (d.news || 0), 0)
  const successfulFetches = totalFetches - totalErrors
  const avgSuccessRate = totalFetches > 0
    ? ((successfulFetches / totalFetches) * 100).toFixed(1)
    : '0.0'
  const avgNewsPerFetch = successfulFetches > 0
    ? (totalNewsCollected / successfulFetches).toFixed(1)
    : '0.0'

  // Check if charts have data
  const hasNewsData = newsOverTime.some(d => d.count > 0)
  const hasCategoryData = categoryData.some(d => d.count > 0)
  const hasLogsData = logsOverTime.some(d => d.fetches > 0)

  if (error) {
    return (
      <Card className="p-6 bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 border-red-200 dark:border-red-800">
        <div className="flex items-center gap-4 text-red-700 dark:text-red-400">
          <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-xl">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-lg">Erro ao carregar analytics</h3>
            <p className="text-sm mt-1">{error}</p>
          </div>
          <Button variant="secondary" onClick={() => loadData()}>
            <RefreshCw className="w-4 h-4" />
            Tentar novamente
          </Button>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-400 bg-clip-text text-transparent">
            Analytics
          </h2>
          <p className="text-[hsl(var(--muted-foreground))] mt-1">
            Performance e metricas do sistema
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Period selector removed - fixed at 7 days for egress optimization */}
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

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {isLoading ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : (
          <>
            <StatCard
              icon={Activity}
              label="Total de Coletas"
              value={totalFetches.toLocaleString()}
              subtext={`no periodo de ${period} dias`}
              color="blue"
            />
            <StatCard
              icon={Newspaper}
              label="Noticias Coletadas"
              value={totalNewsCollected.toLocaleString()}
              subtext={`${avgNewsPerFetch} por coleta`}
              color="green"
            />
            <StatCard
              icon={CheckCircle}
              label="Taxa de Sucesso"
              value={`${avgSuccessRate}%`}
              subtext={`${successfulFetches} de ${totalFetches} coletas`}
              color="green"
            />
            <StatCard
              icon={Zap}
              label="Media por Coleta"
              value={avgNewsPerFetch}
              subtext="noticias por coleta"
              color="violet"
            />
            <StatCard
              icon={AlertTriangle}
              label="Erros no Periodo"
              value={totalErrors.toLocaleString()}
              subtext={totalErrors > 0 ? 'verificar fontes' : 'sistema estavel'}
              color={totalErrors > 0 ? 'red' : 'green'}
            />
          </>
        )}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {isLoading ? (
          <>
            <ChartSkeleton />
            <ChartSkeleton />
          </>
        ) : (
          <>
            <Card className="p-6">
              {hasNewsData ? (
                <LineChart
                  data={newsOverTime}
                  dataKey="count"
                  xAxisKey="date"
                  title="Noticias ao Longo do Tempo"
                  color="#3b82f6"
                />
              ) : (
                <>
                  <h3 className="text-sm font-medium text-[hsl(var(--foreground))] mb-4">
                    Noticias ao Longo do Tempo
                  </h3>
                  <EmptyChartState
                    title="Sem dados no periodo"
                    message={`Nenhuma noticia coletada nos ultimos ${period} dias`}
                  />
                </>
              )}
            </Card>

            <Card className="p-6">
              {hasCategoryData ? (
                <BarChart
                  data={categoryData}
                  dataKey="count"
                  xAxisKey="category"
                  title="Distribuicao por Categoria"
                />
              ) : (
                <>
                  <h3 className="text-sm font-medium text-[hsl(var(--foreground))] mb-4">
                    Distribuicao por Categoria
                  </h3>
                  <EmptyChartState
                    title="Sem dados de categorias"
                    message="Nenhuma noticia categorizada encontrada"
                  />
                </>
              )}
            </Card>
          </>
        )}
      </div>

      {/* Fetch Activity Chart */}
      {isLoading ? (
        <ChartSkeleton />
      ) : (
        <Card className="p-6">
          {hasLogsData ? (
            <AreaChart
              data={logsOverTime}
              dataKey="fetches"
              xAxisKey="date"
              title="Atividade de Coleta"
              color="#10b981"
              gradientId="fetchGradient"
            />
          ) : (
            <>
              <h3 className="text-sm font-medium text-[hsl(var(--foreground))] mb-4">
                Atividade de Coleta
              </h3>
              <EmptyChartState
                title="Sem atividade registrada"
                message={`Nenhuma coleta realizada nos ultimos ${period} dias`}
              />
            </>
          )}
        </Card>
      )}

      {/* Source Performance Table */}
      <Card className="overflow-hidden">
        <CardHeader className="p-5 border-b border-[hsl(var(--border))] bg-gradient-to-r from-[hsl(var(--muted))] to-[hsl(var(--background))]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-violet-100 dark:bg-violet-900/30 rounded-lg">
                <Activity className="w-4 h-4 text-violet-600 dark:text-violet-400" />
              </div>
              <CardTitle className="text-base">Performance por Fonte</CardTitle>
            </div>
            {sourceStats.length > 0 && (
              <Badge variant="secondary">
                {sourceStats.length} fonte{sourceStats.length !== 1 ? 's' : ''}
              </Badge>
            )}
          </div>
        </CardHeader>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fonte</TableHead>
              <TableHead className="text-right">Coletas</TableHead>
              <TableHead className="text-right">Noticias</TableHead>
              <TableHead className="text-right">Taxa Sucesso</TableHead>
              <TableHead className="text-right">Tempo Medio</TableHead>
              <TableHead className="text-right">Erros</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-12 ml-auto" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-12 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : sourceStats.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 bg-[hsl(var(--muted))] rounded-xl flex items-center justify-center">
                      <Activity className="w-6 h-6 text-[hsl(var(--muted-foreground))]" />
                    </div>
                    <p className="text-[hsl(var(--foreground))] font-medium">Nenhum dado disponivel</p>
                    <p className="text-sm text-[hsl(var(--muted-foreground))]">
                      Os dados aparecerao quando houver coletas registradas
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              sourceStats.map((source) => {
                const successRate = parseFloat(source.successRate)
                return (
                  <TableRow key={source.id} className="group">
                    <TableCell className="font-medium text-[hsl(var(--foreground))]">
                      {source.name}
                    </TableCell>
                    <TableCell className="text-right text-[hsl(var(--muted-foreground))]">
                      {source.totalFetches.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right font-semibold text-[hsl(var(--foreground))]">
                      {source.totalNews.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge
                        variant={successRate >= 90 ? 'success' : successRate >= 70 ? 'warning' : 'destructive'}
                        className="font-mono"
                      >
                        {source.successRate}%
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right text-[hsl(var(--muted-foreground))] font-mono">
                      {source.avgDuration > 1000
                        ? `${(source.avgDuration / 1000).toFixed(1)}s`
                        : `${source.avgDuration}ms`
                      }
                    </TableCell>
                    <TableCell className="text-right">
                      {source.errors > 0 ? (
                        <span className="inline-flex items-center gap-1 text-red-600 dark:text-red-400 font-medium">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          {source.errors}
                        </span>
                      ) : (
                        <span className="text-green-600 dark:text-green-400 font-medium">0</span>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}
