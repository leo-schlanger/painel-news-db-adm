import { useState } from 'react'
import { useFilterPresets } from '@/hooks/useFilterPresets'
import { Button, Input } from '@/components/ui'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog'
import { toast } from '@/hooks/useToast'
import { BookmarkPlus, ChevronDown, X, Save, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function FilterPresets({ currentFilters, onApplyPreset, className }) {
  const { presets, addPreset, removePreset } = useFilterPresets()
  const [isOpen, setIsOpen] = useState(false)
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [presetName, setPresetName] = useState('')

  const handleSavePreset = () => {
    if (!presetName.trim()) {
      toast({
        title: 'Nome obrigatorio',
        description: 'Digite um nome para o preset.',
        variant: 'warning'
      })
      return
    }

    addPreset(presetName.trim(), currentFilters)
    setPresetName('')
    setShowSaveDialog(false)
    toast({
      title: 'Preset salvo',
      description: `O preset "${presetName}" foi salvo com sucesso.`,
      variant: 'success'
    })
  }

  const handleApplyPreset = (preset) => {
    onApplyPreset(preset.filters)
    setIsOpen(false)
    toast({
      title: 'Preset aplicado',
      description: `Filtros do preset "${preset.name}" aplicados.`,
      variant: 'success'
    })
  }

  const handleDeletePreset = (e, preset) => {
    e.stopPropagation()
    removePreset(preset.id)
    toast({
      title: 'Preset removido',
      description: `O preset "${preset.name}" foi removido.`,
      variant: 'success'
    })
  }

  const hasActiveFilters = currentFilters.category || currentFilters.sourceId || currentFilters.startDate || currentFilters.endDate || currentFilters.minScore

  return (
    <div className={cn('relative', className)}>
      <div className="flex items-center gap-2">
        <div className="relative">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsOpen(!isOpen)}
            className="gap-2"
          >
            <BookmarkPlus className="w-4 h-4" />
            Presets
            <ChevronDown className={cn('w-4 h-4 transition-transform', isOpen && 'rotate-180')} />
          </Button>

          {isOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setIsOpen(false)}
              />
              <div className="absolute top-full left-0 mt-1 w-64 bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-lg shadow-lg z-20 overflow-hidden">
                {presets.length > 0 ? (
                  <div className="max-h-64 overflow-y-auto">
                    {presets.map(preset => (
                      <button
                        key={preset.id}
                        onClick={() => handleApplyPreset(preset)}
                        className="w-full flex items-center justify-between px-3 py-2.5 text-left text-sm hover:bg-[hsl(var(--muted))] transition-colors group"
                      >
                        <span className="text-[hsl(var(--foreground))] font-medium truncate">
                          {preset.name}
                        </span>
                        <button
                          onClick={(e) => handleDeletePreset(e, preset)}
                          className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="px-3 py-4 text-center text-sm text-[hsl(var(--muted-foreground))]">
                    Nenhum preset salvo
                  </div>
                )}

                <div className="border-t border-[hsl(var(--border))] p-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setIsOpen(false)
                      setShowSaveDialog(true)
                    }}
                    disabled={!hasActiveFilters}
                    className="w-full justify-start gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Salvar filtros atuais
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Salvar Preset de Filtros</DialogTitle>
            <DialogDescription>
              De um nome para este conjunto de filtros para usar novamente depois.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              value={presetName}
              onChange={(e) => setPresetName(e.target.value)}
              placeholder="Ex: Noticias de alta prioridade"
              onKeyDown={(e) => e.key === 'Enter' && handleSavePreset()}
            />
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setShowSaveDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSavePreset}>
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
