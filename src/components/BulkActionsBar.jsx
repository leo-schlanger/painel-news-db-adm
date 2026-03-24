import { Button } from '@/components/ui'
import { X, Download, Copy, Heart, Trash2 } from 'lucide-react'
import { exportSelectedToCSV, generateExportFilename } from '@/lib/export'
import { toast } from '@/hooks/useToast'
import { useFavorites } from '@/context/FavoritesContext'
import { cn } from '@/lib/utils'

export default function BulkActionsBar({ selectedItems, allItems, onClearSelection, className }) {
  const { addMultipleToFavorites } = useFavorites()
  const selectedCount = selectedItems.length

  if (selectedCount === 0) return null

  const selectedData = allItems.filter(item => selectedItems.includes(item.id))

  const handleExport = () => {
    try {
      exportSelectedToCSV(allItems, selectedItems, generateExportFilename('selecionadas'))
      toast({
        title: 'Exportacao concluida',
        description: `${selectedCount} noticias exportadas para CSV.`,
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

  const handleCopyLinks = async () => {
    const links = selectedData.map(item => item.link).join('\n')
    try {
      await navigator.clipboard.writeText(links)
      toast({
        title: 'Links copiados',
        description: `${selectedCount} links copiados para a area de transferencia.`,
        variant: 'success'
      })
    } catch (error) {
      toast({
        title: 'Erro ao copiar',
        description: 'Nao foi possivel copiar os links.',
        variant: 'destructive'
      })
    }
  }

  const handleAddToFavorites = () => {
    addMultipleToFavorites(selectedData)
    toast({
      title: 'Favoritos atualizados',
      description: `${selectedCount} noticias adicionadas aos favoritos.`,
      variant: 'success'
    })
  }

  return (
    <div
      className={cn(
        'fixed bottom-6 left-1/2 -translate-x-1/2 z-30',
        'bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl shadow-xl',
        'flex items-center gap-3 px-4 py-3 animate-slide-in',
        className
      )}
    >
      <div className="flex items-center gap-2 pr-3 border-r border-[hsl(var(--border))]">
        <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">
          {selectedCount}
        </span>
        <span className="text-sm font-medium text-[hsl(var(--foreground))]">
          selecionada{selectedCount !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleExport}
          className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
        >
          <Download className="w-4 h-4" />
          <span className="hidden sm:inline">Exportar</span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopyLinks}
          className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
        >
          <Copy className="w-4 h-4" />
          <span className="hidden sm:inline">Copiar Links</span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleAddToFavorites}
          className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
        >
          <Heart className="w-4 h-4" />
          <span className="hidden sm:inline">Favoritar</span>
        </Button>
      </div>

      <Button
        variant="ghost"
        size="icon"
        onClick={onClearSelection}
        className="ml-2 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
      >
        <X className="w-4 h-4" />
      </Button>
    </div>
  )
}
