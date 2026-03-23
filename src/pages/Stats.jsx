import { useState, useEffect } from 'react'
import { fetchStats, fetchLogs, getCategories } from '../lib/supabase'
import {
  BarChart3,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
  Newspaper,
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
  Skeleton
} from '@/components/ui'

function StatCard({ icon: Icon, label, value, color = 'blue' }) {
  const colorConfig = {
    blue: {
      bg: 'bg-gradient-to-br from-blue-500 to-blue-600',
      shadow: 'shadow-blue-500/20'
    },
    green: {
      bg: 'bg-gradient-to-br from-emerald-500 to-emerald-600',
      shadow: 'shadow-emerald-500/20'
    },
    orange: {
      bg: 'bg-gradient-to-br from-orange-500 to-orange-600',
      shadow: 'shadow-orange-500/20'
    },
    red: {
      bg: 'bg-gradient-to-br from-red-500 to-red-600',
      shadow: 'shadow-red-500/20'
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
          <Skeleton className="h-8 w-16" />
        </div>
        <Skeleton className="w-12 h-12 rounded-xl" />
      </div>
    </Card>
  )
}

function TableRowSkeleton({ cols = 5 }) {
  return (
    <TableRow>
      {Array.from({ length: cols }).map((_, i) => (
        <TableCell key={i}>
          <Skeleton className="h-4 w-full" />
        </TableCell>
      ))}
    </TableRow>
  )
}

export default function Stats() {
  const [stats, setStats] = useState(null)
  const [logs, setLogs] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  const categories = getCategories()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setIsLoading(true)
      const [statsData, logsData] = await Promise.all([
        fetchStats(),
        fetchLogs(30)
      ])
      setStats(statsData)
      setLogs(logsData || [])
    } catch (err) {
      setError(err.message)
      console.error('Error loading stats:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">Estatisticas</h2>
          <p className="text-gray-500 mt-1">Metricas e logs do sistema</p>
        </div>
        <Button
          variant="secondary"
          onClick={loadData}
          disabled={isLoading}
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>

      {/* Error */}
      {error && (
        <Card className="bg-gradient-to-r from-red-50 to-rose-50 border-red-200">
          <CardContent className="p-4 text-red-700">
            Erro ao carregar estatisticas: {error}
          </CardContent>
        </Card>
      )}

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
            />
            <StatCard
              icon={BarChart3}
              label="Fontes Ativas"
              value={`${stats?.activeSources || 0}/${stats?.totalSources || 0}`}
              color="blue"
            />
          </>
        )}
      </div>

      {/* Categories Table */}
      <Card className="overflow-hidden">
        <CardHeader className="p-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BarChart3 className="w-4 h-4 text-blue-600" />
            </div>
            <CardTitle className="text-base">Noticias por Categoria</CardTitle>
          </div>
        </CardHeader>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Categoria</TableHead>
              <TableHead className="text-right">Quantidade</TableHead>
              <TableHead className="text-right">Porcentagem</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <>
                <TableRowSkeleton cols={3} />
                <TableRowSkeleton cols={3} />
                <TableRowSkeleton cols={3} />
              </>
            ) : (
              categories.map(cat => {
                const count = stats?.byCategory?.[cat.value] || 0
                const total = stats?.totalNews || 1
                const percentage = ((count / total) * 100).toFixed(1)
                return (
                  <TableRow key={cat.value}>
                    <TableCell>
                      <Badge variant={cat.value}>{cat.label}</Badge>
                    </TableCell>
                    <TableCell className="text-right font-semibold text-gray-900">
                      {count.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="text-gray-500">{percentage}%</span>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Recent Fetch Logs */}
      <Card className="overflow-hidden">
        <CardHeader className="p-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-violet-100 rounded-lg">
              <Activity className="w-4 h-4 text-violet-600" />
            </div>
            <CardTitle className="text-base">Logs de Fetch Recentes</CardTitle>
          </div>
        </CardHeader>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fonte</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Noticias</TableHead>
              <TableHead className="text-right">Duracao</TableHead>
              <TableHead>Data</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <>
                <TableRowSkeleton cols={5} />
                <TableRowSkeleton cols={5} />
                <TableRowSkeleton cols={5} />
              </>
            ) : logs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12">
                  <div className="flex flex-col items-center gap-2">
                    <Activity className="w-8 h-8 text-gray-300" />
                    <p className="text-gray-500 font-medium">Nenhum log encontrado</p>
                    <p className="text-gray-400 text-sm">Os logs aparecerao aqui quando houver coletas</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              logs.map(log => (
                <TableRow key={log.id}>
                  <TableCell className="text-sm font-medium text-gray-900">
                    {log.sources?.name || `Source #${log.source_id}`}
                  </TableCell>
                  <TableCell>
                    {log.status === 'success' ? (
                      <Badge variant="success" className="gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Sucesso
                      </Badge>
                    ) : (
                      <Badge variant="destructive" className="gap-1" title={log.error_message}>
                        <XCircle className="w-3 h-3" />
                        Erro
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right text-sm font-medium text-gray-700">
                    {log.news_count || 0}
                  </TableCell>
                  <TableCell className="text-right text-sm text-gray-500">
                    {log.duration_ms ? `${log.duration_ms}ms` : '-'}
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {formatDate(log.created_at)}
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
