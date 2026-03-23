import { useState, useEffect } from 'react'
import { fetchSources, getCategories } from '../lib/supabase'
import { useDebounce } from '../hooks/useDebounce'
import {
  Radio,
  ExternalLink,
  CheckCircle,
  XCircle,
  Search,
  RefreshCw,
  Globe,
  Clock
} from 'lucide-react'
import {
  Button,
  Card,
  CardContent,
  Badge,
  InputWithIcon,
  Skeleton,
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue
} from '@/components/ui'

function SourceCardSkeleton() {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <Skeleton className="w-11 h-11 rounded-xl" />
          <div>
            <Skeleton className="h-5 w-32 mb-2" />
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
        </div>
        <Skeleton className="w-5 h-5 rounded-full" />
      </div>
      <div className="mt-4 space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </Card>
  )
}

export default function Sources() {
  const [sources, setSources] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')

  const debouncedSearch = useDebounce(search, 300)
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

  const getCategoryLabel = (value) => {
    return categories.find(c => c.value === value)?.label || value
  }

  const filteredSources = sources.filter(source => {
    const matchesSearch = !debouncedSearch ||
      source.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      source.url.toLowerCase().includes(debouncedSearch.toLowerCase())
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

  const activeSources = sources.filter(s => s.is_active).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">Fontes RSS</h2>
          <p className="text-gray-500 mt-1">
            {activeSources} ativas de {sources.length} fontes configuradas
          </p>
        </div>
        <Button
          variant="secondary"
          onClick={loadSources}
          disabled={isLoading}
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <InputWithIcon
                icon={Search}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar fonte..."
              />
            </div>
            <div className="w-full sm:w-48">
              <Select
                value={categoryFilter || '__all__'}
                onValueChange={(value) => setCategoryFilter(value === '__all__' ? '' : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todas categorias" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">Todas categorias</SelectItem>
                  {categories.map(cat => (
                    <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error */}
      {error && (
        <Card className="bg-gradient-to-r from-red-50 to-rose-50 border-red-200">
          <CardContent className="p-4 text-red-700">
            Erro ao carregar fontes: {error}
          </CardContent>
        </Card>
      )}

      {/* Sources Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <SourceCardSkeleton />
          <SourceCardSkeleton />
          <SourceCardSkeleton />
          <SourceCardSkeleton />
          <SourceCardSkeleton />
          <SourceCardSkeleton />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSources.map(source => (
            <Card key={source.id} className="p-5 group">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`p-2.5 rounded-xl shadow-sm ${source.is_active ? 'bg-gradient-to-br from-emerald-500 to-emerald-600' : 'bg-gray-200'}`}>
                    <Radio className={`w-5 h-5 ${source.is_active ? 'text-white' : 'text-gray-400'}`} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">{source.name}</h3>
                    <Badge variant={source.category} className="mt-1.5">
                      {getCategoryLabel(source.category)}
                    </Badge>
                  </div>
                </div>
                {source.is_active ? (
                  <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium">
                    <CheckCircle className="w-3.5 h-3.5" />
                    Ativo
                  </div>
                ) : (
                  <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-gray-100 text-gray-500 text-xs font-medium">
                    <XCircle className="w-3.5 h-3.5" />
                    Inativo
                  </div>
                )}
              </div>

              <div className="mt-4 space-y-2.5 text-sm">
                <div className="flex items-center justify-between text-gray-600">
                  <div className="flex items-center gap-1.5">
                    <Globe className="w-4 h-4 text-gray-400" />
                    <span>Pais / Idioma</span>
                  </div>
                  <span className="font-medium text-gray-900">{source.country || '-'} / {source.language || 'en'}</span>
                </div>
                <div className="flex items-center justify-between text-gray-600">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span>Ultimo fetch</span>
                  </div>
                  <span className="font-medium text-gray-900 text-xs">{formatDate(source.last_fetch)}</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  <div className="text-center">
                    <p className="text-lg font-bold text-gray-900">{source.fetch_count || 0}</p>
                    <p className="text-xs text-gray-500">Fetches</p>
                  </div>
                  <div className="text-center">
                    <p className={`text-lg font-bold ${source.error_count > 0 ? 'text-red-600' : 'text-gray-900'}`}>
                      {source.error_count || 0}
                    </p>
                    <p className="text-xs text-gray-500">Erros</p>
                  </div>
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Feed
                  </a>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {!isLoading && filteredSources.length === 0 && (
        <Card className="p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Radio className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-500 font-medium">Nenhuma fonte encontrada</p>
          <p className="text-gray-400 text-sm mt-1">Tente ajustar os filtros de busca</p>
        </Card>
      )}
    </div>
  )
}
