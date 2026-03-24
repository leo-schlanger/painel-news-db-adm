import { useState, useEffect, useCallback } from 'react'
import { fetchNews, fetchSources, getCategories } from '../lib/supabase'
import { useDebounce } from '../hooks/useDebounce'
import { useAutoRefresh } from '@/hooks/useAutoRefresh'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
import { useFavorites } from '@/context/FavoritesContext'
import { exportToCSV, generateExportFilename } from '@/lib/export'
import { toast } from '@/hooks/useToast'
import NewsDetailModal from '@/components/NewsDetailModal'
import BulkActionsBar from '@/components/BulkActionsBar'
import FilterPresets from '@/components/FilterPresets'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Search,
  Filter,
  ExternalLink,
  Calendar,
  SortAsc,
  SortDesc,
  X,
  RefreshCw,
  Flame,
  Zap,
  Download,
  Heart
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
import { intervals } from '@/hooks/useAutoRefresh'

function NewsRowSkeleton() {
  return (
    <TableRow>
      <TableCell><Skeleton className="h-4 w-4" /></TableCell>
      <TableCell><Skeleton className="h-4 w-full max-w-md" /></TableCell>
      <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
      <TableCell><Skeleton className="h-4 w-12" /></TableCell>
      <TableCell><Skeleton className="h-4 w-28" /></TableCell>
    </TableRow>
  )
}

function NewsRow({ news, isSelected, onSelect, onViewDetails }) {
  const categories = getCategories()
  const categoryLabel = categories.find(c => c.value === news.category)?.label || news.category
  const { isFavorite, toggleFavorite } = useFavorites()

  const getPriorityIcon = (score) => {
    if (score >= 3) return <Flame className="w-4 h-4 text-red-500" />
    if (score >= 1) return <Zap className="w-4 h-4 text-orange-500" />
    return null
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
    <TableRow className="group">
      <TableCell className="w-10">
        <Checkbox
          checked={isSelected}
          onCheckedChange={() => onSelect(news.id)}
        />
      </TableCell>
      <TableCell>
        <div className="max-w-md">
          <button
            onClick={() => onViewDetails(news)}
            className="text-left w-full"
          >
            <span className="text-sm font-medium text-[hsl(var(--foreground))] hover:text-blue-600 dark:hover:text-blue-400 line-clamp-2 transition-colors">
              {news.title}
            </span>
          </button>
          {news.description && (
            <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1 line-clamp-1">
              {news.description}
            </p>
          )}
        </div>
      </TableCell>
      <TableCell>
        <Badge variant={news.category}>
          {categoryLabel}
        </Badge>
      </TableCell>
      <TableCell className="text-sm text-[hsl(var(--muted-foreground))]">
        {news.sources?.name || '-'}
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1.5">
          {getPriorityIcon(news.priority_score)}
          <span className="text-sm font-medium text-[hsl(var(--foreground))]">
            {news.priority_score?.toFixed(1) || '0.0'}
          </span>
        </div>
      </TableCell>
      <TableCell className="text-sm text-[hsl(var(--muted-foreground))] whitespace-nowrap">
        {formatDate(news.fetched_at)}
      </TableCell>
      <TableCell>
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
  const [selectedItems, setSelectedItems] = useState([])
  const [selectedNews, setSelectedNews] = useState(null)
  const [showModal, setShowModal] = useState(false)

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

  const { interval, setInterval, countdown, isRefreshing, refresh, isEnabled } = useAutoRefresh(loadNews)

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

  const handleSelectItem = (id) => {
    setSelectedItems(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const handleSelectAll = () => {
    if (selectedItems.length === news.length) {
      setSelectedItems([])
    } else {
      setSelectedItems(news.map(n => n.id))
    }
  }

  const handleViewDetails = (newsItem) => {
    setSelectedNews(newsItem)
    setShowModal(true)
  }

  const handleExportAll = () => {
    if (news.length === 0) {
      toast({
        title: 'Nada para exportar',
        description: 'Nao ha noticias para exportar.',
        variant: 'warning'
      })
      return
    }

    try {
      exportToCSV(news, generateExportFilename('noticias'))
      toast({
        title: 'Exportacao concluida',
        description: `${news.length} noticias exportadas para CSV.`,
        variant: 'success'
      })
    } catch (error) {
      toast({
        title: 'Erro na exportacao',
        description: error.message,
        variant: 'destructive'
      })
    }
  }

  const handleApplyPreset = (presetFilters) => {
    setFilters(prev => ({
      ...prev,
      ...presetFilters,
      page: 1
    }))
  }

  const totalPages = Math.ceil(totalCount / filters.perPage)
  const hasActiveFilters = filters.category || filters.sourceId || filters.startDate || filters.endDate || filters.minScore
  const allSelected = news.length > 0 && selectedItems.length === news.length
  const someSelected = selectedItems.length > 0 && selectedItems.length < news.length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-400 bg-clip-text text-transparent">Noticias</h2>
          <p className="text-[hsl(var(--muted-foreground))] mt-1">
            {totalCount.toLocaleString()} noticias encontradas
          </p>
        </div>
        <div className="flex items-center gap-2">
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
            onClick={handleExportAll}
            disabled={news.length === 0}
          >
            <Download className="w-4 h-4" />
            Exportar
          </Button>
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
            <div className="flex items-center gap-2">
              <FilterPresets
                currentFilters={filters}
                onApplyPreset={handleApplyPreset}
              />
              <Button
                variant={hasActiveFilters ? "default" : "secondary"}
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="w-4 h-4" />
                Filtros
                {hasActiveFilters && (
                  <span className="w-2 h-2 rounded-full bg-white dark:bg-blue-200 animate-pulse"></span>
                )}
              </Button>
            </div>
          </div>

          {/* Expanded Filters */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-[hsl(var(--border))]">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1.5">
                    Categoria
                  </label>
                  <Select
                    value={filters.category || '__all__'}
                    onValueChange={(value) => handleFilterChange('category', value === '__all__' ? '' : value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todas" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__all__">Todas</SelectItem>
                      {categories.map(cat => (
                        <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Source */}
                <div>
                  <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1.5">
                    Fonte
                  </label>
                  <Select
                    value={filters.sourceId || '__all__'}
                    onValueChange={(value) => handleFilterChange('sourceId', value === '__all__' ? '' : value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todas" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__all__">Todas</SelectItem>
                      {sources.map(source => (
                        <SelectItem key={source.id} value={source.id}>{source.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Min Score */}
                <div>
                  <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1.5">
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
                  <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1.5">
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
                  <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1.5">
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
                    className="text-[hsl(var(--muted-foreground))] hover:text-red-600"
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
        <Card className="bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 border-red-200 dark:border-red-800">
          <CardContent className="p-4 text-red-700 dark:text-red-400">
            Erro ao carregar noticias: {error}
          </CardContent>
        </Card>
      )}

      {/* Table */}
      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <Checkbox
                  checked={allSelected}
                  indeterminate={someSelected}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead>Titulo</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Fonte</TableHead>
              <TableHead
                className="cursor-pointer hover:bg-[hsl(var(--muted))] transition-colors rounded-lg"
                onClick={() => toggleSort('priority_score')}
              >
                <div className="flex items-center gap-1">
                  Score
                  {filters.orderBy === 'priority_score' && (
                    filters.orderDir === 'desc' ? <SortDesc className="w-4 h-4 text-blue-600" /> : <SortAsc className="w-4 h-4 text-blue-600" />
                  )}
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer hover:bg-[hsl(var(--muted))] transition-colors rounded-lg"
                onClick={() => toggleSort('fetched_at')}
              >
                <div className="flex items-center gap-1">
                  Data
                  {filters.orderBy === 'fetched_at' && (
                    filters.orderDir === 'desc' ? <SortDesc className="w-4 h-4 text-blue-600" /> : <SortAsc className="w-4 h-4 text-blue-600" />
                  )}
                </div>
              </TableHead>
              <TableHead className="w-20"></TableHead>
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
                <TableCell colSpan={7} className="text-center py-12 text-[hsl(var(--muted-foreground))]">
                  <div className="flex flex-col items-center gap-2">
                    <Search className="w-8 h-8 text-[hsl(var(--muted-foreground))]" />
                    <p className="font-medium">Nenhuma noticia encontrada</p>
                    <p className="text-sm opacity-80">Tente ajustar os filtros de busca</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              news.map(item => (
                <NewsRow
                  key={item.id}
                  news={item}
                  isSelected={selectedItems.includes(item.id)}
                  onSelect={handleSelectItem}
                  onViewDetails={handleViewDetails}
                />
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

      {/* Bulk Actions Bar */}
      <BulkActionsBar
        selectedItems={selectedItems}
        allItems={news}
        onClearSelection={() => setSelectedItems([])}
      />

      {/* News Detail Modal */}
      <NewsDetailModal
        news={selectedNews}
        open={showModal}
        onOpenChange={setShowModal}
      />
    </div>
  )
}
