import { useState, useEffect, useCallback } from 'react'

const PRESETS_KEY = 'news_admin_filter_presets'

export function useFilterPresets() {
  const [presets, setPresets] = useState([])

  useEffect(() => {
    const saved = localStorage.getItem(PRESETS_KEY)
    if (saved) {
      try {
        setPresets(JSON.parse(saved))
      } catch (e) {
        console.error('Error loading filter presets:', e)
      }
    }
  }, [])

  const savePresets = useCallback((newPresets) => {
    setPresets(newPresets)
    localStorage.setItem(PRESETS_KEY, JSON.stringify(newPresets))
  }, [])

  const addPreset = useCallback((name, filters) => {
    const newPreset = {
      id: Date.now().toString(),
      name,
      filters: { ...filters },
      createdAt: new Date().toISOString()
    }
    savePresets([...presets, newPreset])
    return newPreset
  }, [presets, savePresets])

  const removePreset = useCallback((id) => {
    savePresets(presets.filter(p => p.id !== id))
  }, [presets, savePresets])

  const updatePreset = useCallback((id, updates) => {
    savePresets(presets.map(p =>
      p.id === id ? { ...p, ...updates } : p
    ))
  }, [presets, savePresets])

  const getPreset = useCallback((id) => {
    return presets.find(p => p.id === id)
  }, [presets])

  return {
    presets,
    addPreset,
    removePreset,
    updatePreset,
    getPreset
  }
}
