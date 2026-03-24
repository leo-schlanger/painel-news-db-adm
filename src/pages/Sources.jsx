import { useState, useEffect, useCallback } from 'react'
import { fetchSources, getCategories } from '../lib/supabase'
import { useDebounce } from '../hooks/useDebounce'
import { useAutoRefresh } from '@/hooks/useAutoRefresh'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
import { toast } from '@/hooks/useToast'
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
import { intervals } from '@/hooks/useAutoRefresh'

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

  const loadSources = useCallback(async () => {
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
  }, [])

  const { interval, setInterval, countdown, isRefreshing, refresh, isEnabled } = useAutoRefresh(loadSources)

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
  }, [loadSources])

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
          <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-400 bg-clip-text text-transparent">Fontes RSS</h2>
          <p className="text-[hsl(var(--muted-foreground))] mt-1">
            {activeSources} ativas de {sources.length} fontes configuradas
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
        <Card className="bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 border-red-200 dark:border-red-800">
          <CardContent className="p-4 text-red-700 dark:text-red-400">
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
            <Card key={source.id} className="p-5 group card-hover">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`p-2.5 rounded-xl shadow-sm ${source.is_active ? 'bg-gradient-to-br from-emerald-500 to-emerald-600' : 'bg-[hsl(var(--muted))]'}`}>
                    <Radio className={`w-5 h-5 ${source.is_active ? 'text-white' : 'text-[hsl(var(--muted-foreground))]'}`} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-[hsl(var(--foreground))] truncate">{source.name}</h3>
                    <Badge variant={source.category} className="mt-1.5">
                      {getCategoryLabel(source.category)}
                    </Badge>
                  </div>
                </div>
                {source.is_active ? (
                  <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-medium">
                    <CheckCircle className="w-3.5 h-3.5" />
                    Ativo
                  </div>
                ) : (
                  <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] text-xs font-medium">
                    <XCircle className="w-3.5 h-3.5" />
                    Inativo
                  </div>
                )}
              </div>

              <div className="mt-4 space-y-2.5 text-sm">
                <div className="flex items-center justify-between text-[hsl(var(--muted-foreground))]">
                  <div className="flex items-center gap-1.5">
                    <Globe className="w-4 h-4" />
                    <span>Pais / Idioma</span>
                  </div>
                  <span className="font-medium text-[hsl(var(--foreground))]">{source.country || '-'} / {source.language || 'en'}</span>
                </div>
                <div className="flex items-center justify-between text-[hsl(var(--muted-foreground))]">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4" />
                    <span>Ultimo fetch</span>
                  </div>
                  <span className="font-medium text-[hsl(var(--foreground))] text-xs">{formatDate(source.last_fetch)}</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-[hsl(var(--border))]">
                  <div className="text-center">
                    <p className="text-lg font-bold text-[hsl(var(--foreground))]">{source.fetch_count || 0}</p>
                    <p className="text-xs text-[hsl(var(--muted-foreground))]">Fetches</p>
                  </div>
                  <div className="text-center">
                    <p className={`text-lg font-bold ${source.error_count > 0 ? 'text-red-600 dark:text-red-400' : 'text-[hsl(var(--foreground))]'}`}>
                      {source.error_count || 0}
                    </p>
                    <p className="text-xs text-[hsl(var(--muted-foreground))]">Erros</p>
                  </div>
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
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
          <div className="w-16 h-16 bg-[hsl(var(--muted))] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Radio className="w-8 h-8 text-[hsl(var(--muted-foreground))]" />
          </div>
          <p className="text-[hsl(var(--muted-foreground))] font-medium">Nenhuma fonte encontrada</p>
          <p className="text-[hsl(var(--muted-foreground))] text-sm mt-1 opacity-80">Tente ajustar os filtros de busca</p>
        </Card>
      )}
    </div>
  )
}
