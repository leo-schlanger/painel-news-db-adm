import { useState, useEffect } from 'react'
import { fetchSourceAnalytics, fetchNewsOverTime, fetchLogsOverTime, fetchNewsByCategory } from '@/lib/supabase'
import { LineChart, BarChart, AreaChart } from '@/components/charts'
import { toast } from '@/hooks/useToast'
import {
  TrendingUp,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  Activity
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

function StatCardSkeleton() {
  return (
    <Card className="p-6">
      <Skeleton className="h-4 w-24 mb-2" />
      <Skeleton className="h-8 w-16" />
    </Card>
  )
}

function ChartSkeleton() {
  return (
    <Card className="p-6">
      <Skeleton className="h-4 w-32 mb-4" />
      <Skeleton className="h-[300px] w-full rounded-lg" />
    </Card>
  )
}

export default function Analytics() {
  const [sourceStats, setSourceStats] = useState([])
  const [newsOverTime, setNewsOverTime] = useState([])
  const [logsOverTime, setLogsOverTime] = useState([])
  const [categoryData, setCategoryData] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [period, setPeriod] = useState('7')

  useEffect(() => {
    loadData()
  }, [period])

  const loadData = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const days = parseInt(period)

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
  }

  const handleRefresh = () => {
    loadData()
    toast({
      title: 'Dados atualizados',
      variant: 'success'
    })
  }

  // Calculate summary metrics
  const totalFetches = logsOverTime.reduce((sum, d) => sum + d.fetches, 0)
  const totalErrors = logsOverTime.reduce((sum, d) => sum + d.errors, 0)
  const totalNewsCollected = logsOverTime.reduce((sum, d) => sum + d.news, 0)
  const avgSuccessRate = totalFetches > 0
    ? (((totalFetches - totalErrors) / totalFetches) * 100).toFixed(1)
    : 0

  if (error) {
    return (
      <Card className="p-6 bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 border-red-200 dark:border-red-800">
        <div className="flex items-center gap-4 text-red-700 dark:text-red-400">
          <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-xl">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">Erro ao carregar analytics</h3>
            <p className="text-sm mt-1">{error}</p>
          </div>
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
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Ultimos 7 dias</SelectItem>
              <SelectItem value="14">Ultimos 14 dias</SelectItem>
              <SelectItem value="30">Ultimos 30 dias</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="secondary"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
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
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[hsl(var(--muted-foreground))]">Total de Coletas</p>
                  <p className="text-2xl font-bold text-[hsl(var(--foreground))] mt-1">{totalFetches}</p>
                </div>
                <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-900/30">
                  <Activity className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[hsl(var(--muted-foreground))]">Noticias Coletadas</p>
                  <p className="text-2xl font-bold text-[hsl(var(--foreground))] mt-1">{totalNewsCollected.toLocaleString()}</p>
                </div>
                <div className="p-3 rounded-xl bg-green-100 dark:bg-green-900/30">
                  <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[hsl(var(--muted-foreground))]">Taxa de Sucesso</p>
                  <p className="text-2xl font-bold text-[hsl(var(--foreground))] mt-1">{avgSuccessRate}%</p>
                </div>
                <div className="p-3 rounded-xl bg-emerald-100 dark:bg-emerald-900/30">
                  <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[hsl(var(--muted-foreground))]">Erros no Periodo</p>
                  <p className="text-2xl font-bold text-[hsl(var(--foreground))] mt-1">{totalErrors}</p>
                </div>
                <div className="p-3 rounded-xl bg-red-100 dark:bg-red-900/30">
                  <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
              </div>
            </Card>
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
              <LineChart
                data={newsOverTime}
                dataKey="count"
                xAxisKey="date"
                title="Noticias ao Longo do Tempo"
                color="#3b82f6"
              />
            </Card>

            <Card className="p-6">
              <BarChart
                data={categoryData}
                dataKey="count"
                xAxisKey="category"
                title="Distribuicao por Categoria"
              />
            </Card>
          </>
        )}
      </div>

      {/* Fetch Activity Chart */}
      {isLoading ? (
        <ChartSkeleton />
      ) : (
        <Card className="p-6">
          <AreaChart
            data={logsOverTime}
            dataKey="fetches"
            xAxisKey="date"
            title="Atividade de Coleta"
            color="#10b981"
            gradientId="fetchGradient"
          />
        </Card>
      )}

      {/* Source Performance Table */}
      <Card className="overflow-hidden">
        <CardHeader className="p-5 border-b border-[hsl(var(--border))] bg-gradient-to-r from-[hsl(var(--muted))] to-[hsl(var(--background))]">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-violet-100 dark:bg-violet-900/30 rounded-lg">
              <Activity className="w-4 h-4 text-violet-600 dark:text-violet-400" />
            </div>
            <CardTitle className="text-base">Performance por Fonte</CardTitle>
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
                    <Activity className="w-8 h-8 text-[hsl(var(--muted-foreground))]" />
                    <p className="text-[hsl(var(--muted-foreground))] font-medium">Nenhum dado disponivel</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              sourceStats.map((source) => (
                <TableRow key={source.id}>
                  <TableCell className="font-medium text-[hsl(var(--foreground))]">
                    {source.name}
                  </TableCell>
                  <TableCell className="text-right text-[hsl(var(--muted-foreground))]">
                    {source.totalFetches}
                  </TableCell>
                  <TableCell className="text-right font-semibold text-[hsl(var(--foreground))]">
                    {source.totalNews.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge variant={parseFloat(source.successRate) >= 90 ? 'success' : parseFloat(source.successRate) >= 70 ? 'warning' : 'destructive'}>
                      {source.successRate}%
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right text-[hsl(var(--muted-foreground))]">
                    {source.avgDuration}ms
                  </TableCell>
                  <TableCell className="text-right">
                    {source.errors > 0 ? (
                      <span className="text-red-600 dark:text-red-400 font-medium">{source.errors}</span>
                    ) : (
                      <span className="text-green-600 dark:text-green-400">0</span>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}
