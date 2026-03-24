import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { shortcuts } from '@/hooks/useKeyboardShortcuts'
import { Keyboard } from 'lucide-react'

export default function KeyboardShortcutsHelp() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const handleShowShortcuts = () => {
      setOpen(true)
    }

    window.addEventListener('show-keyboard-shortcuts', handleShowShortcuts)
    return () => window.removeEventListener('show-keyboard-shortcuts', handleShowShortcuts)
  }, [])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="w-5 h-5" />
            Atalhos de Teclado
          </DialogTitle>
          <DialogDescription>
            Use estes atalhos para navegar mais rapidamente
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-1 py-4">
          {shortcuts.map((shortcut, index) => (
            <div
              key={index}
              className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-[hsl(var(--muted))] transition-colors"
            >
              <span className="text-sm text-[hsl(var(--foreground))]">
                {shortcut.description}
              </span>
              <div className="flex items-center gap-1">
                {shortcut.keys.map((key, i) => (
                  <span key={i}>
                    <kbd className="px-2 py-1 text-xs font-semibold bg-[hsl(var(--muted))] border border-[hsl(var(--border))] rounded-md text-[hsl(var(--foreground))]">
                      {key}
                    </kbd>
                    {i < shortcut.keys.length - 1 && (
                      <span className="mx-1 text-[hsl(var(--muted-foreground))]">+</span>
                    )}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="text-xs text-center text-[hsl(var(--muted-foreground))]">
          Pressione <kbd className="px-1.5 py-0.5 bg-[hsl(var(--muted))] border border-[hsl(var(--border))] rounded text-[hsl(var(--foreground))]">?</kbd> a qualquer momento para ver esta ajuda
        </div>
      </DialogContent>
    </Dialog>
  )
}
