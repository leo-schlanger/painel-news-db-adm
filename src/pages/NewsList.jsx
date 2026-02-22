import { useState, useEffect, useCallback } from 'react'
import { fetchNews, fetchSources, getCategories } from '../lib/supabase'
import { useDebounce } from '../hooks/useDebounce'
import {
  Search,
  Filter,
  ExternalLink,
  Calendar,
  SortAsc,
  SortDesc,
  X,
  RefreshCw,
  Loader2
} from 'lucide-react'
import {
  Button,
  Card,
  CardContent,
  Badge,
  InputWithIcon,
  Input,
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
  Skeleton,
  SimplePagination,
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue
} from '@/components/ui'

function NewsRowSkeleton() {
  return (
    <TableRow>
      <TableCell><Skeleton className="h-4 w-full max-w-md" /></TableCell>
      <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
      <TableCell><Skeleton className="h-4 w-12" /></TableCell>
      <TableCell><Skeleton className="h-4 w-28" /></TableCell>
    </TableRow>
  )
}

function NewsRow({ news }) {
  const getPriorityClass = (score) => {
    if (score >= 3) return 'text-red-600 font-semibold'
    if (score >= 1) return 'text-orange-500 font-medium'
    return 'text-gray-500'
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
    <TableRow>
      <TableCell>
        <div className="max-w-md">
          <a
            href={news.link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-gray-900 hover:text-blue-600 line-clamp-2 flex items-start gap-2 group"
          >
            <span className="flex-1">{news.title}</span>
            <ExternalLink className="w-4 h-4 flex-shrink-0 mt-0.5 text-gray-400 group-hover:text-blue-500" />
          </a>
          {news.description && (
            <p className="text-xs text-gray-500 mt-1 line-clamp-1">
              {news.description}
            </p>
          )}
        </div>
      </TableCell>
      <TableCell>
        <Badge variant={news.category}>
          {news.category}
        </Badge>
      </TableCell>
      <TableCell className="text-sm text-gray-600">
        {news.sources?.name || '-'}
      </TableCell>
      <TableCell className="text-sm whitespace-nowrap">
        <span className={getPriorityClass(news.priority_score)}>
          {news.priority_score?.toFixed(1) || '0.0'}
        </span>
      </TableCell>
      <TableCell className="text-sm text-gray-500 whitespace-nowrap">
        {formatDate(news.fetched_at)}
      </TableCell>
    </TableRow>
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

  // Debounce search for better performance
  const debouncedSearch = useDebounce(filters.search, 300)

  const categories = getCategories()

  const loadNews = useCallback(async () => {
    try {
      setIsLoading(true)
      const result = await fetchNews({
        ...filters,
        search: debouncedSearch,
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
  }, [filters.category, filters.sourceId, filters.startDate, filters.endDate, filters.minScore, filters.page, filters.perPage, filters.orderBy, filters.orderDir, debouncedSearch])

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
        <Button
          variant="secondary"
          onClick={loadNews}
          disabled={isLoading}
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>

      {/* Search and Filter Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <InputWithIcon
                icon={Search}
                type="text"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                placeholder="Buscar por titulo ou descricao..."
              />
            </div>

            {/* Filter Toggle */}
            <Button
              variant={hasActiveFilters ? "default" : "secondary"}
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="w-4 h-4" />
              Filtros
              {hasActiveFilters && (
                <span className="w-2 h-2 rounded-full bg-white"></span>
              )}
            </Button>
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
                  <Select
                    value={filters.category}
                    onValueChange={(value) => handleFilterChange('category', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todas" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todas</SelectItem>
                      {categories.map(cat => (
                        <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Source */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fonte
                  </label>
                  <Select
                    value={filters.sourceId}
                    onValueChange={(value) => handleFilterChange('sourceId', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todas" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todas</SelectItem>
                      {sources.map(source => (
                        <SelectItem key={source.id} value={source.id}>{source.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Min Score */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Score Minimo
                  </label>
                  <Input
                    type="number"
                    value={filters.minScore}
                    onChange={(e) => handleFilterChange('minScore', e.target.value)}
                    placeholder="Ex: 2"
                    min="0"
                    step="0.5"
                  />
                </div>

                {/* Date Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data Inicial
                  </label>
                  <InputWithIcon
                    icon={Calendar}
                    type="date"
                    value={filters.startDate}
                    onChange={(e) => handleFilterChange('startDate', e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data Final
                  </label>
                  <InputWithIcon
                    icon={Calendar}
                    type="date"
                    value={filters.endDate}
                    onChange={(e) => handleFilterChange('endDate', e.target.value)}
                  />
                </div>
              </div>

              {hasActiveFilters && (
                <div className="mt-4 flex justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                  >
                    <X className="w-4 h-4" />
                    Limpar filtros
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Error State */}
      {error && (
        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-4 text-red-700">
            Erro ao carregar noticias: {error}
          </CardContent>
        </Card>
      )}

      {/* Table */}
      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Titulo</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Fonte</TableHead>
              <TableHead
                className="cursor-pointer hover:bg-gray-100"
                onClick={() => toggleSort('priority_score')}
              >
                <div className="flex items-center gap-1">
                  Score
                  {filters.orderBy === 'priority_score' && (
                    filters.orderDir === 'desc' ? <SortDesc className="w-4 h-4" /> : <SortAsc className="w-4 h-4" />
                  )}
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer hover:bg-gray-100"
                onClick={() => toggleSort('fetched_at')}
              >
                <div className="flex items-center gap-1">
                  Data
                  {filters.orderBy === 'fetched_at' && (
                    filters.orderDir === 'desc' ? <SortDesc className="w-4 h-4" /> : <SortAsc className="w-4 h-4" />
                  )}
                </div>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <>
                <NewsRowSkeleton />
                <NewsRowSkeleton />
                <NewsRowSkeleton />
                <NewsRowSkeleton />
                <NewsRowSkeleton />
              </>
            ) : news.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12 text-gray-500">
                  Nenhuma noticia encontrada
                </TableCell>
              </TableRow>
            ) : (
              news.map(item => (
                <NewsRow key={item.id} news={item} />
              ))
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        <SimplePagination
          currentPage={filters.page}
          totalPages={totalPages}
          totalCount={totalCount}
          perPage={filters.perPage}
          onPageChange={(page) => handleFilterChange('page', page)}
        />
      </Card>
    </div>
  )
}
