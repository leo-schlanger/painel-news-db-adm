import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Badge, Button } from '@/components/ui'
import { getCategoryInfo } from '@/lib/supabase'
import { useFavorites } from '@/context/FavoritesContext'
import {
  ExternalLink,
  Calendar,
  Clock,
  User,
  Radio,
  Flame,
  Zap,
  Heart,
  Copy,
  Tag
} from 'lucide-react'
import { toast } from '@/hooks/useToast'

export default function NewsDetailModal({ news, open, onOpenChange }) {
  const categoryInfo = getCategoryInfo(news?.category)
  const { isFavorite, toggleFavorite } = useFavorites()

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getPriorityInfo = (score) => {
    if (score >= 3) return { icon: Flame, color: 'text-red-500', label: 'Alta Prioridade' }
    if (score >= 1) return { icon: Zap, color: 'text-orange-500', label: 'Media Prioridade' }
    return { icon: null, color: 'text-[hsl(var(--muted-foreground))]', label: 'Baixa Prioridade' }
  }

  const handleCopyLink = () => {
    if (news?.link) {
      navigator.clipboard.writeText(news.link)
      toast({
        title: 'Link copiado',
        description: 'O link da noticia foi copiado para a area de transferencia.',
        variant: 'success'
      })
    }
  }

  const handleToggleFavorite = () => {
    if (news) {
      toggleFavorite(news)
      toast({
        title: isFavorite(news.id) ? 'Removido dos favoritos' : 'Adicionado aos favoritos',
        variant: 'success'
      })
    }
  }

  if (!news) return null

  const priority = getPriorityInfo(news.priority_score)
  const PriorityIcon = priority.icon

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4 pr-8">
            <DialogTitle className="text-xl font-bold leading-tight">
              {news.title}
            </DialogTitle>
          </div>
          <div className="flex flex-wrap items-center gap-2 pt-2">
            <Badge variant={categoryInfo?.value || 'default'}>
              {categoryInfo?.label || news.category}
            </Badge>
            <div className={`flex items-center gap-1.5 text-sm font-medium ${priority.color}`}>
              {PriorityIcon && <PriorityIcon className="w-4 h-4" />}
              <span>{news.priority_score?.toFixed(1)}</span>
              <span className="text-xs text-[hsl(var(--muted-foreground))]">({priority.label})</span>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Description */}
          {news.description && (
            <div>
              <h4 className="text-sm font-medium text-[hsl(var(--foreground))] mb-2">Descricao</h4>
              <p className="text-sm text-[hsl(var(--muted-foreground))] leading-relaxed">
                {news.description}
              </p>
            </div>
          )}

          {/* Metadata */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4 border-y border-[hsl(var(--border))]">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[hsl(var(--muted))]">
                <Radio className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
              </div>
              <div>
                <p className="text-xs text-[hsl(var(--muted-foreground))]">Fonte</p>
                <p className="text-sm font-medium text-[hsl(var(--foreground))]">
                  {news.sources?.name || 'Desconhecida'}
                </p>
              </div>
            </div>

            {news.author && (
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[hsl(var(--muted))]">
                  <User className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
                </div>
                <div>
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">Autor</p>
                  <p className="text-sm font-medium text-[hsl(var(--foreground))]">
                    {news.author}
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[hsl(var(--muted))]">
                <Calendar className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
              </div>
              <div>
                <p className="text-xs text-[hsl(var(--muted-foreground))]">Publicado em</p>
                <p className="text-sm font-medium text-[hsl(var(--foreground))]">
                  {formatDate(news.published_at)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[hsl(var(--muted))]">
                <Clock className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
              </div>
              <div>
                <p className="text-xs text-[hsl(var(--muted-foreground))]">Coletado em</p>
                <p className="text-sm font-medium text-[hsl(var(--foreground))]">
                  {formatDate(news.fetched_at)}
                </p>
              </div>
            </div>
          </div>

          {/* Keywords */}
          {news.matched_keywords && news.matched_keywords.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Tag className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
                <h4 className="text-sm font-medium text-[hsl(var(--foreground))]">Palavras-chave</h4>
              </div>
              <div className="flex flex-wrap gap-2">
                {news.matched_keywords.map((keyword, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 text-xs font-medium rounded-md bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap gap-2 pt-2">
            <Button
              variant="default"
              asChild
            >
              <a href={news.link} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4" />
                Abrir Noticia
              </a>
            </Button>
            <Button
              variant="secondary"
              onClick={handleCopyLink}
            >
              <Copy className="w-4 h-4" />
              Copiar Link
            </Button>
            <Button
              variant={isFavorite(news.id) ? 'destructive' : 'secondary'}
              onClick={handleToggleFavorite}
            >
              <Heart className={`w-4 h-4 ${isFavorite(news.id) ? 'fill-current' : ''}`} />
              {isFavorite(news.id) ? 'Remover' : 'Favoritar'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
