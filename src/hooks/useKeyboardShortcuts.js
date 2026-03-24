import { useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

export function useKeyboardShortcuts({ onRefresh, onShowShortcuts }) {
  const navigate = useNavigate()

  const handleKeyDown = useCallback((e) => {
    // Ignore if user is typing in an input, textarea, or contenteditable
    if (
      e.target.tagName === 'INPUT' ||
      e.target.tagName === 'TEXTAREA' ||
      e.target.isContentEditable
    ) {
      return
    }

    // Cmd/Ctrl + K is handled by CommandPalette
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      return
    }

    switch (e.key.toLowerCase()) {
      case 'r':
        if (!e.metaKey && !e.ctrlKey) {
          e.preventDefault()
          onRefresh?.()
        }
        break

      case '/':
        e.preventDefault()
        // Focus search input if available
        const searchInput = document.querySelector('input[type="text"][placeholder*="Buscar"]')
        if (searchInput) {
          searchInput.focus()
        }
        break

      case '?':
        e.preventDefault()
        onShowShortcuts?.()
        break

      case 'g':
        // Wait for next key
        break

      case 'h':
        if (e.key === 'h' && !e.metaKey && !e.ctrlKey) {
          e.preventDefault()
          navigate('/')
        }
        break

      case 'n':
        if (!e.metaKey && !e.ctrlKey) {
          e.preventDefault()
          navigate('/news')
        }
        break

      case 's':
        if (!e.metaKey && !e.ctrlKey) {
          e.preventDefault()
          navigate('/sources')
        }
        break

      case 'a':
        if (!e.metaKey && !e.ctrlKey) {
          e.preventDefault()
          navigate('/analytics')
        }
        break

      case 'f':
        if (!e.metaKey && !e.ctrlKey) {
          e.preventDefault()
          navigate('/favorites')
        }
        break

      case 'escape':
        // Clear selection, close dialogs, etc.
        document.activeElement?.blur()
        break

      default:
        break
    }
  }, [navigate, onRefresh, onShowShortcuts])

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])
}

export const shortcuts = [
  { keys: ['Cmd', 'K'], description: 'Abrir command palette' },
  { keys: ['R'], description: 'Atualizar dados' },
  { keys: ['/'], description: 'Focar na busca' },
  { keys: ['?'], description: 'Mostrar atalhos' },
  { keys: ['H'], description: 'Ir para Dashboard' },
  { keys: ['N'], description: 'Ir para Noticias' },
  { keys: ['S'], description: 'Ir para Fontes' },
  { keys: ['A'], description: 'Ir para Analytics' },
  { keys: ['F'], description: 'Ir para Favoritos' },
  { keys: ['Esc'], description: 'Fechar/Cancelar' },
]
