import { useState } from 'react'
import { useFavorites } from '@/context/FavoritesContext'
import { getCategoryInfo } from '@/lib/supabase'
import { exportToCSV, generateExportFilename } from '@/lib/export'
import { toast } from '@/hooks/useToast'
import NewsDetailModal from '@/components/NewsDetailModal'
import {
  Heart,
  ExternalLink,
  Trash2,
  Download,
  Search,
  Flame,
  Zap
} from 'lucide-react'
import {
  Button,
  Card,
  CardContent,
  Badge,
  InputWithIcon,
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell
} from '@/components/ui'

export default function Favorites() {
  const { favorites, removeFromFavorites, clearFavorites } = useFavorites()
  const [search, setSearch] = useState('')
  const [selectedNews, setSelectedNews] = useState(null)
  const [showModal, setShowModal] = useState(false)

  const filteredFavorites = favorites.filter(news =>
    !search ||
    news.title.toLowerCase().includes(search.toLowerCase()) ||
    news.description?.toLowerCase().includes(search.toLowerCase())
  )

  const handleExport = () => {
    if (favorites.length === 0) {
      toast({
        title: 'Nada para exportar',
        description: 'Adicione noticias aos favoritos primeiro.',
        variant: 'warning'
      })
      return
    }

    try {
      exportToCSV(favorites, generateExportFilename('favoritos'))
      toast({
        title: 'Exportacao concluida',
        description: `${favorites.length} favoritos exportados para CSV.`,
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

  const handleClearAll = () => {
    if (window.confirm('Tem certeza que deseja remover todos os favoritos?')) {
      clearFavorites()
      toast({
        title: 'Favoritos limpos',
        description: 'Todos os favoritos foram removidos.',
        variant: 'success'
      })
    }
  }

  const handleRemove = (newsId, newsTitle) => {
    removeFromFavorites(newsId)
    toast({
      title: 'Removido dos favoritos',
      description: `"${newsTitle.substring(0, 50)}..." foi removido.`,
      variant: 'success'
    })
  }

  const handleViewDetails = (news) => {
    setSelectedNews(news)
    setShowModal(true)
  }

  const getCategoryLabel = (value) => {
    const info = getCategoryInfo(value)
    return info?.label || value
  }

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-400 bg-clip-text text-transparent">
            Favoritos
          </h2>
          <p className="text-[hsl(var(--muted-foreground))] mt-1">
            {favorites.length} noticia{favorites.length !== 1 ? 's' : ''} salva{favorites.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            onClick={handleExport}
            disabled={favorites.length === 0}
          >
            <Download className="w-4 h-4" />
            Exportar
          </Button>
          {favorites.length > 0 && (
            <Button
              variant="destructive"
              onClick={handleClearAll}
            >
              <Trash2 className="w-4 h-4" />
              Limpar Tudo
            </Button>
          )}
        </div>
      </div>

      {/* Search */}
      {favorites.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <InputWithIcon
              icon={Search}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar nos favoritos..."
            />
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {favorites.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="w-16 h-16 bg-[hsl(var(--muted))] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Heart className="w-8 h-8 text-[hsl(var(--muted-foreground))]" />
          </div>
          <h3 className="text-lg font-semibold text-[hsl(var(--foreground))] mb-2">
            Nenhum favorito
          </h3>
          <p className="text-[hsl(var(--muted-foreground))] max-w-sm mx-auto">
            Clique no icone de coracao nas noticias para salva-las aqui e acessar rapidamente depois.
          </p>
        </Card>
      ) : filteredFavorites.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="w-16 h-16 bg-[hsl(var(--muted))] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-[hsl(var(--muted-foreground))]" />
          </div>
          <h3 className="text-lg font-semibold text-[hsl(var(--foreground))] mb-2">
            Nenhum resultado
          </h3>
          <p className="text-[hsl(var(--muted-foreground))]">
            Nenhum favorito corresponde a sua busca.
          </p>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Titulo</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Fonte</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Salvo em</TableHead>
                <TableHead className="w-24"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredFavorites.map(news => (
                <TableRow key={news.id} className="group">
                  <TableCell>
                    <button
                      onClick={() => handleViewDetails(news)}
                      className="text-left max-w-md"
                    >
                      <span className="text-sm font-medium text-[hsl(var(--foreground))] hover:text-blue-600 line-clamp-2 transition-colors">
                        {news.title}
                      </span>
                    </button>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getCategoryInfo(news.category)?.value || 'default'}>
                      {getCategoryLabel(news.category)}
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
                    {formatDate(news.favoritedAt)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        asChild
                      >
                        <a href={news.link} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemove(news.id, news.title)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      <NewsDetailModal
        news={selectedNews}
        open={showModal}
        onOpenChange={setShowModal}
      />
    </div>
  )
}
