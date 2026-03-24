import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const FavoritesContext = createContext(null)

const FAVORITES_KEY = 'news_admin_favorites'

export function FavoritesProvider({ children }) {
  const [favorites, setFavorites] = useState([])

  useEffect(() => {
    const saved = localStorage.getItem(FAVORITES_KEY)
    if (saved) {
      try {
        setFavorites(JSON.parse(saved))
      } catch (e) {
        console.error('Error loading favorites:', e)
      }
    }
  }, [])

  const saveFavorites = useCallback((newFavorites) => {
    setFavorites(newFavorites)
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(newFavorites))
  }, [])

  const addToFavorites = useCallback((news) => {
    if (!favorites.find(f => f.id === news.id)) {
      saveFavorites([...favorites, { ...news, favoritedAt: new Date().toISOString() }])
    }
  }, [favorites, saveFavorites])

  const addMultipleToFavorites = useCallback((newsArray) => {
    const newFavorites = [...favorites]
    newsArray.forEach(news => {
      if (!newFavorites.find(f => f.id === news.id)) {
        newFavorites.push({ ...news, favoritedAt: new Date().toISOString() })
      }
    })
    saveFavorites(newFavorites)
  }, [favorites, saveFavorites])

  const removeFromFavorites = useCallback((newsId) => {
    saveFavorites(favorites.filter(f => f.id !== newsId))
  }, [favorites, saveFavorites])

  const toggleFavorite = useCallback((news) => {
    if (favorites.find(f => f.id === news.id)) {
      removeFromFavorites(news.id)
    } else {
      addToFavorites(news)
    }
  }, [favorites, addToFavorites, removeFromFavorites])

  const isFavorite = useCallback((newsId) => {
    return favorites.some(f => f.id === newsId)
  }, [favorites])

  const clearFavorites = useCallback(() => {
    saveFavorites([])
  }, [saveFavorites])

  return (
    <FavoritesContext.Provider value={{
      favorites,
      addToFavorites,
      addMultipleToFavorites,
      removeFromFavorites,
      toggleFavorite,
      isFavorite,
      clearFavorites,
      count: favorites.length
    }}>
      {children}
    </FavoritesContext.Provider>
  )
}

export function useFavorites() {
  const context = useContext(FavoritesContext)
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider')
  }
  return context
}
