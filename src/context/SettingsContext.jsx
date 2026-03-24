import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const SettingsContext = createContext(null)

const SETTINGS_KEY = 'news_admin_settings'

const defaultSettings = {
  theme: 'system',
  autoRefreshInterval: '0',
  itemsPerPage: 50,
  defaultSort: 'fetched_at',
  defaultSortDir: 'desc',
  compactMode: false,
  showTrendIndicators: true
}

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(defaultSettings)

  useEffect(() => {
    const saved = localStorage.getItem(SETTINGS_KEY)
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setSettings({ ...defaultSettings, ...parsed })
      } catch (e) {
        console.error('Error loading settings:', e)
      }
    }
  }, [])

  const saveSettings = useCallback((newSettings) => {
    setSettings(newSettings)
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings))
  }, [])

  const updateSetting = useCallback((key, value) => {
    const newSettings = { ...settings, [key]: value }
    saveSettings(newSettings)
  }, [settings, saveSettings])

  const resetSettings = useCallback(() => {
    saveSettings(defaultSettings)
  }, [saveSettings])

  return (
    <SettingsContext.Provider value={{
      settings,
      updateSetting,
      resetSettings,
      defaultSettings
    }}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const context = useContext(SettingsContext)
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider')
  }
  return context
}
