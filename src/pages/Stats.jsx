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

function StatCard({ icon: Icon, label, value, color = 'blue' }) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    orange: 'bg-orange-50 text-orange-600',
    red: 'bg-red-50 text-red-600',
  }

  return (
    <div className="card p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{label}</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{value ?? '-'}</p>
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Estatisticas</h2>
          <p className="text-gray-500 mt-1">Metricas e logs do sistema</p>
        </div>
        <button
          onClick={loadData}
          className="btn-secondary flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Atualizar
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="card p-4 bg-red-50 border-red-200 text-red-700">
          Erro ao carregar estatisticas: {error}
        </div>
      )}

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
        />
        <StatCard
          icon={BarChart3}
          label="Fontes Ativas"
          value={`${stats?.activeSources || 0}/${stats?.totalSources || 0}`}
          color="blue"
        />
      </div>

      {/* Categories Table */}
      <div className="card">
        <div className="p-4 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">Noticias por Categoria</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  Categoria
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">
                  Quantidade
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">
                  Porcentagem
                </th>
              </tr>
            </thead>
            <tbody>
              {categories.map(cat => {
                const count = stats?.byCategory?.[cat.value] || 0
                const total = stats?.totalNews || 1
                const percentage = ((count / total) * 100).toFixed(1)
                return (
                  <tr key={cat.value} className="table-row">
                    <td className="px-4 py-3">
                      <span className={`badge badge-${cat.value}`}>{cat.label}</span>
                    </td>
                    <td className="px-4 py-3 text-right font-medium">
                      {count.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-500">
                      {percentage}%
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Fetch Logs */}
      <div className="card">
        <div className="p-4 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">Logs de Fetch Recentes</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  Fonte
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  Status
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">
                  Noticias
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">
                  Duracao
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  Data
                </th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                    Nenhum log encontrado
                  </td>
                </tr>
              ) : (
                logs.map(log => (
                  <tr key={log.id} className="table-row">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {log.sources?.name || `Source #${log.source_id}`}
                    </td>
                    <td className="px-4 py-3">
                      {log.status === 'success' ? (
                        <span className="inline-flex items-center gap-1 text-green-600 text-sm">
                          <CheckCircle className="w-4 h-4" />
                          Sucesso
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-red-600 text-sm" title={log.error_message}>
                          <XCircle className="w-4 h-4" />
                          Erro
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right text-sm">
                      {log.news_count || 0}
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-gray-500">
                      {log.duration_ms ? `${log.duration_ms}ms` : '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {formatDate(log.created_at)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
