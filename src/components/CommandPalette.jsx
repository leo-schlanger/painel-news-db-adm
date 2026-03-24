import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Command } from 'cmdk'
import { useTheme } from '@/context/ThemeContext'
import { toast } from '@/hooks/useToast'
import {
  LayoutDashboard,
  List,
  Radio,
  BarChart3,
  Settings,
  Heart,
  TrendingUp,
  Moon,
  Sun,
  RefreshCw,
  Download,
  Search,
  Keyboard
} from 'lucide-react'

const pages = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard, keywords: ['home', 'inicio', 'painel'] },
  { name: 'Noticias', path: '/news', icon: List, keywords: ['news', 'lista', 'artigos'] },
  { name: 'Fontes', path: '/sources', icon: Radio, keywords: ['sources', 'rss', 'feeds'] },
  { name: 'Estatisticas', path: '/stats', icon: BarChart3, keywords: ['stats', 'metricas', 'dados'] },
  { name: 'Analytics', path: '/analytics', icon: TrendingUp, keywords: ['analytics', 'performance', 'graficos'] },
  { name: 'Favoritos', path: '/favorites', icon: Heart, keywords: ['favorites', 'salvos', 'marcados'] },
  { name: 'Configuracoes', path: '/settings', icon: Settings, keywords: ['settings', 'preferencias', 'opcoes'] },
]

export default function CommandPalette({ onRefresh }) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const navigate = useNavigate()
  const { theme, toggleTheme } = useTheme()

  // Listen for Cmd+K or Ctrl+K
  useEffect(() => {
    const down = (e) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  const runCommand = useCallback((command) => {
    setOpen(false)
    setSearch('')
    command()
  }, [])

  const handleNavigate = (path) => {
    runCommand(() => navigate(path))
  }

  const handleToggleTheme = () => {
    runCommand(() => {
      toggleTheme()
      toast({
        title: theme === 'dark' ? 'Modo Claro ativado' : 'Modo Escuro ativado',
        variant: 'success'
      })
    })
  }

  const handleRefresh = () => {
    runCommand(() => {
      if (onRefresh) {
        onRefresh()
        toast({
          title: 'Dados atualizados',
          description: 'Os dados foram recarregados com sucesso.',
          variant: 'success'
        })
      }
    })
  }

  const handleShowShortcuts = () => {
    runCommand(() => {
      const event = new CustomEvent('show-keyboard-shortcuts')
      window.dispatchEvent(event)
    })
  }

  return (
    <Command.Dialog
      open={open}
      onOpenChange={setOpen}
      label="Command Palette"
      className="fixed inset-0 z-50"
    >
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setOpen(false)} />
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg z-50">
        <div className="bg-[hsl(var(--background))] border border-[hsl(var(--border))] rounded-xl shadow-2xl overflow-hidden animate-scale-in">
          <div className="flex items-center gap-3 px-4 border-b border-[hsl(var(--border))]">
            <Search className="w-5 h-5 text-[hsl(var(--muted-foreground))]" />
            <Command.Input
              value={search}
              onValueChange={setSearch}
              placeholder="Digite um comando ou busque..."
              className="flex-1 h-14 bg-transparent text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] outline-none"
            />
            <kbd className="hidden sm:inline-flex h-6 items-center gap-1 rounded border border-[hsl(var(--border))] bg-[hsl(var(--muted))] px-2 text-xs text-[hsl(var(--muted-foreground))]">
              ESC
            </kbd>
          </div>

          <Command.List className="max-h-80 overflow-y-auto p-2">
            <Command.Empty className="py-6 text-center text-sm text-[hsl(var(--muted-foreground))]">
              Nenhum resultado encontrado.
            </Command.Empty>

            <Command.Group heading="Navegacao" className="px-2 py-1.5 text-xs font-semibold text-[hsl(var(--muted-foreground))]">
              {pages.map((page) => (
                <Command.Item
                  key={page.path}
                  value={`${page.name} ${page.keywords.join(' ')}`}
                  onSelect={() => handleNavigate(page.path)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer text-[hsl(var(--foreground))] aria-selected:bg-[hsl(var(--accent))] aria-selected:text-[hsl(var(--accent-foreground))]"
                >
                  <page.icon className="w-4 h-4" />
                  <span className="flex-1">{page.name}</span>
                  <span className="text-xs text-[hsl(var(--muted-foreground))]">Ir para</span>
                </Command.Item>
              ))}
            </Command.Group>

            <Command.Separator className="my-2 h-px bg-[hsl(var(--border))]" />

            <Command.Group heading="Acoes" className="px-2 py-1.5 text-xs font-semibold text-[hsl(var(--muted-foreground))]">
              <Command.Item
                value="toggle theme dark light modo escuro claro"
                onSelect={handleToggleTheme}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer text-[hsl(var(--foreground))] aria-selected:bg-[hsl(var(--accent))] aria-selected:text-[hsl(var(--accent-foreground))]"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                <span className="flex-1">{theme === 'dark' ? 'Modo Claro' : 'Modo Escuro'}</span>
              </Command.Item>

              <Command.Item
                value="refresh atualizar recarregar"
                onSelect={handleRefresh}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer text-[hsl(var(--foreground))] aria-selected:bg-[hsl(var(--accent))] aria-selected:text-[hsl(var(--accent-foreground))]"
              >
                <RefreshCw className="w-4 h-4" />
                <span className="flex-1">Atualizar Dados</span>
                <kbd className="text-xs text-[hsl(var(--muted-foreground))] bg-[hsl(var(--muted))] px-1.5 py-0.5 rounded">R</kbd>
              </Command.Item>

              <Command.Item
                value="keyboard shortcuts atalhos teclado ajuda"
                onSelect={handleShowShortcuts}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer text-[hsl(var(--foreground))] aria-selected:bg-[hsl(var(--accent))] aria-selected:text-[hsl(var(--accent-foreground))]"
              >
                <Keyboard className="w-4 h-4" />
                <span className="flex-1">Atalhos de Teclado</span>
                <kbd className="text-xs text-[hsl(var(--muted-foreground))] bg-[hsl(var(--muted))] px-1.5 py-0.5 rounded">?</kbd>
              </Command.Item>
            </Command.Group>
          </Command.List>

          <div className="flex items-center justify-between px-4 py-3 border-t border-[hsl(var(--border))] bg-[hsl(var(--muted))]">
            <div className="flex items-center gap-4 text-xs text-[hsl(var(--muted-foreground))]">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded bg-[hsl(var(--background))] border border-[hsl(var(--border))]">Enter</kbd>
                para selecionar
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded bg-[hsl(var(--background))] border border-[hsl(var(--border))]">↑↓</kbd>
                para navegar
              </span>
            </div>
          </div>
        </div>
      </div>
    </Command.Dialog>
  )
}
