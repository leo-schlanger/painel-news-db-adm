import { useState, useEffect } from 'react'
import { fetchStats, fetchLogs, getCategories } from '../lib/supabase'
import {
  BarChart3,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
  Newspaper
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
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    orange: 'bg-orange-50 text-orange-600',
    red: 'bg-red-50 text-red-600',
  }

  return (
    <Card className="p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{label}</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{value ?? '-'}</p>
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </Card>
  )
}

function StatCardSkeleton() {
  return (
    <Card className="p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <Skeleton className="h-4 w-24 mb-2" />
          <Skeleton className="h-8 w-16" />
        </div>
        <Skeleton className="w-12 h-12 rounded-lg" />
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
          <h2 className="text-2xl font-bold text-gray-900">Estatisticas</h2>
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
        <Card className="bg-red-50 border-red-200">
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
      <Card>
        <CardHeader className="p-4 border-b border-gray-200">
          <CardTitle className="text-base">Noticias por Categoria</CardTitle>
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
                    <TableCell className="text-right font-medium">
                      {count.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right text-gray-500">
                      {percentage}%
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Recent Fetch Logs */}
      <Card>
        <CardHeader className="p-4 border-b border-gray-200">
          <CardTitle className="text-base">Logs de Fetch Recentes</CardTitle>
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
                <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                  Nenhum log encontrado
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
                  <TableCell className="text-right text-sm">
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
