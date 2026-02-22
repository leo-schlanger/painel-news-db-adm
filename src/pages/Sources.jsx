import { useState, useEffect } from 'react'
import { fetchSources, getCategories } from '../lib/supabase'
import { useDebounce } from '../hooks/useDebounce'
import {
  Radio,
  ExternalLink,
  CheckCircle,
  XCircle,
  Search,
  RefreshCw
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
    <Card className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <Skeleton className="w-9 h-9 rounded-lg" />
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
                value={categoryFilter}
                onValueChange={setCategoryFilter}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todas categorias" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todas categorias</SelectItem>
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
        <Card className="bg-red-50 border-red-200">
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
            <Card key={source.id} className="p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`p-2 rounded-lg ${source.is_active ? 'bg-green-100' : 'bg-gray-100'}`}>
                    <Radio className={`w-5 h-5 ${source.is_active ? 'text-green-600' : 'text-gray-400'}`} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">{source.name}</h3>
                    <Badge variant={source.category} className="mt-1">
                      {source.category}
                    </Badge>
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
            </Card>
          ))}
        </div>
      )}

      {!isLoading && filteredSources.length === 0 && (
        <Card className="p-12 text-center">
          <Radio className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="text-gray-500">Nenhuma fonte encontrada</p>
        </Card>
      )}
    </div>
  )
}
