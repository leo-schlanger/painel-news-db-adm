import { useState, useEffect } from 'react'
import { fetchSources, getCategories } from '../lib/supabase'
import {
  Radio,
  ExternalLink,
  CheckCircle,
  XCircle,
  Search,
  RefreshCw
} from 'lucide-react'

export default function Sources() {
  const [sources, setSources] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')

  const categories = getCategories()

  useEffect(() => {
    loadSources()
  }, [])

  const loadSources = async () => {
    try {
      setIsLoading(true)
      const data = await fetchSources()
      setSources(data || [])
    } catch (err) {
      setError(err.message)
      console.error('Error loading sources:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredSources = sources.filter(source => {
    const matchesSearch = !search ||
      source.name.toLowerCase().includes(search.toLowerCase()) ||
      source.url.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = !categoryFilter || source.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  const formatDate = (dateString) => {
    if (!dateString) return 'Nunca'
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Fontes RSS</h2>
          <p className="text-gray-500 mt-1">
            {sources.length} fontes configuradas
          </p>
        </div>
        <button
          onClick={loadSources}
          className="btn-secondary flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Atualizar
        </button>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar fonte..."
              className="input pl-10"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="select w-full sm:w-48"
          >
            <option value="">Todas categorias</option>
            {categories.map(cat => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="card p-4 bg-red-50 border-red-200 text-red-700">
          Erro ao carregar fontes: {error}
        </div>
      )}

      {/* Sources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSources.map(source => (
          <div key={source.id} className="card p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className={`p-2 rounded-lg ${source.is_active ? 'bg-green-100' : 'bg-gray-100'}`}>
                  <Radio className={`w-5 h-5 ${source.is_active ? 'text-green-600' : 'text-gray-400'}`} />
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">{source.name}</h3>
                  <span className={`badge badge-${source.category} mt-1`}>
                    {source.category}
                  </span>
                </div>
              </div>
              {source.is_active ? (
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
              ) : (
                <XCircle className="w-5 h-5 text-gray-400 flex-shrink-0" />
              )}
            </div>

            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Pais:</span>
                <span className="font-medium">{source.country || '-'}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Idioma:</span>
                <span className="font-medium">{source.language || 'en'}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Ultimo fetch:</span>
                <span className="font-medium text-xs">{formatDate(source.last_fetch)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Total fetches:</span>
                <span className="font-medium">{source.fetch_count || 0}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Erros:</span>
                <span className={`font-medium ${source.error_count > 0 ? 'text-red-600' : 'text-gray-600'}`}>
                  {source.error_count || 0}
                </span>
              </div>
            </div>

            <a
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
            >
              <ExternalLink className="w-4 h-4" />
              Ver feed RSS
            </a>
          </div>
        ))}
      </div>

      {filteredSources.length === 0 && (
        <div className="card p-12 text-center text-gray-500">
          <Radio className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>Nenhuma fonte encontrada</p>
        </div>
      )}
    </div>
  )
}
