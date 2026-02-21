import { useState, useEffect, useCallback } from 'react'
import { fetchNews, fetchSources, getCategories } from '../lib/supabase'
import {
  Search,
  Filter,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Calendar,
  SortAsc,
  SortDesc,
  X,
  RefreshCw
} from 'lucide-react'

function NewsRow({ news }) {
  const getPriorityClass = (score) => {
    if (score >= 3) return 'priority-high'
    if (score >= 1) return 'priority-medium'
    return 'priority-low'
  }

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <tr className="table-row">
      <td className="px-4 py-3">
        <div className="max-w-md">
          <a
            href={news.link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-gray-900 hover:text-blue-600 line-clamp-2 flex items-start gap-2"
          >
            <span className="flex-1">{news.title}</span>
            <ExternalLink className="w-4 h-4 flex-shrink-0 mt-0.5 text-gray-400" />
          </a>
          {news.description && (
            <p className="text-xs text-gray-500 mt-1 line-clamp-1">
              {news.description}
            </p>
          )}
        </div>
      </td>
      <td className="px-4 py-3">
        <span className={`badge badge-${news.category}`}>
          {news.category}
        </span>
      </td>
      <td className="px-4 py-3 text-sm text-gray-600">
        {news.sources?.name || '-'}
      </td>
      <td className="px-4 py-3 text-sm whitespace-nowrap">
        <span className={getPriorityClass(news.priority_score)}>
          {news.priority_score?.toFixed(1) || '0.0'}
        </span>
      </td>
      <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
        {formatDate(news.fetched_at)}
      </td>
    </tr>
  )
}

export default function NewsList() {
  const [news, setNews] = useState([])
  const [sources, setSources] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [totalCount, setTotalCount] = useState(0)
  const [showFilters, setShowFilters] = useState(false)

  // Filters
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    sourceId: '',
    startDate: '',
    endDate: '',
    minScore: '',
    page: 1,
    perPage: 50,
    orderBy: 'fetched_at',
    orderDir: 'desc'
  })

  const categories = getCategories()

  const loadNews = useCallback(async () => {
    try {
      setIsLoading(true)
      const result = await fetchNews({
        ...filters,
        sourceId: filters.sourceId || null,
        minScore: filters.minScore ? parseFloat(filters.minScore) : null,
        startDate: filters.startDate || null,
        endDate: filters.endDate || null
      })
      setNews(result.data || [])
      setTotalCount(result.count || 0)
    } catch (err) {
      setError(err.message)
      console.error('Error loading news:', err)
    } finally {
      setIsLoading(false)
    }
  }, [filters])

  const loadSources = async () => {
    try {
      const data = await fetchSources()
      setSources(data || [])
    } catch (err) {
      console.error('Error loading sources:', err)
    }
  }

  useEffect(() => {
    loadSources()
  }, [])

  useEffect(() => {
    loadNews()
  }, [loadNews])

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: key === 'page' ? value : 1
    }))
  }

  const clearFilters = () => {
    setFilters({
      search: '',
      category: '',
      sourceId: '',
      startDate: '',
      endDate: '',
      minScore: '',
      page: 1,
      perPage: 50,
      orderBy: 'fetched_at',
      orderDir: 'desc'
    })
  }

  const toggleSort = (field) => {
    if (filters.orderBy === field) {
      handleFilterChange('orderDir', filters.orderDir === 'asc' ? 'desc' : 'asc')
    } else {
      setFilters(prev => ({ ...prev, orderBy: field, orderDir: 'desc' }))
    }
  }

  const totalPages = Math.ceil(totalCount / filters.perPage)
  const hasActiveFilters = filters.category || filters.sourceId || filters.startDate || filters.endDate || filters.minScore

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Noticias</h2>
          <p className="text-gray-500 mt-1">
            {totalCount.toLocaleString()} noticias encontradas
          </p>
        </div>
        <button
          onClick={loadNews}
          className="btn-secondary flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Atualizar
        </button>
      </div>

      {/* Search and Filter Bar */}
      <div className="card p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              placeholder="Buscar por titulo ou descricao..."
              className="input pl-10"
            />
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`btn-secondary flex items-center gap-2 ${hasActiveFilters ? 'ring-2 ring-blue-500' : ''}`}
          >
            <Filter className="w-4 h-4" />
            Filtros
            {hasActiveFilters && (
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            )}
          </button>
        </div>

        {/* Expanded Filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Categoria
                </label>
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="select"
                >
                  <option value="">Todas</option>
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>

              {/* Source */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fonte
                </label>
                <select
                  value={filters.sourceId}
                  onChange={(e) => handleFilterChange('sourceId', e.target.value)}
                  className="select"
                >
                  <option value="">Todas</option>
                  {sources.map(source => (
                    <option key={source.id} value={source.id}>{source.name}</option>
                  ))}
                </select>
              </div>

              {/* Min Score */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Score Minimo
                </label>
                <input
                  type="number"
                  value={filters.minScore}
                  onChange={(e) => handleFilterChange('minScore', e.target.value)}
                  placeholder="Ex: 2"
                  className="input"
                  min="0"
                  step="0.5"
                />
              </div>

              {/* Date Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data Inicial
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="date"
                    value={filters.startDate}
                    onChange={(e) => handleFilterChange('startDate', e.target.value)}
                    className="input pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data Final
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="date"
                    value={filters.endDate}
                    onChange={(e) => handleFilterChange('endDate', e.target.value)}
                    className="input pl-10"
                  />
                </div>
              </div>
            </div>

            {hasActiveFilters && (
              <div className="mt-4 flex justify-end">
                <button
                  onClick={clearFilters}
                  className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
                >
                  <X className="w-4 h-4" />
                  Limpar filtros
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Error State */}
      {error && (
        <div className="card p-4 bg-red-50 border-red-200 text-red-700">
          Erro ao carregar noticias: {error}
        </div>
      )}

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Titulo
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Categoria
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Fonte
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => toggleSort('priority_score')}
                >
                  <div className="flex items-center gap-1">
                    Score
                    {filters.orderBy === 'priority_score' && (
                      filters.orderDir === 'desc' ? <SortDesc className="w-4 h-4" /> : <SortAsc className="w-4 h-4" />
                    )}
                  </div>
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => toggleSort('fetched_at')}
                >
                  <div className="flex items-center gap-1">
                    Data
                    {filters.orderBy === 'fetched_at' && (
                      filters.orderDir === 'desc' ? <SortDesc className="w-4 h-4" /> : <SortAsc className="w-4 h-4" />
                    )}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center">
                    <div className="flex items-center justify-center gap-2 text-gray-500">
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      Carregando...
                    </div>
                  </td>
                </tr>
              ) : news.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-gray-500">
                    Nenhuma noticia encontrada
                  </td>
                </tr>
              ) : (
                news.map(item => (
                  <NewsRow key={item.id} news={item} />
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Mostrando {((filters.page - 1) * filters.perPage) + 1} - {Math.min(filters.page * filters.perPage, totalCount)} de {totalCount}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleFilterChange('page', filters.page - 1)}
                disabled={filters.page === 1}
                className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-sm text-gray-600">
                Pagina {filters.page} de {totalPages}
              </span>
              <button
                onClick={() => handleFilterChange('page', filters.page + 1)}
                disabled={filters.page === totalPages}
                className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
