import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

const VALID_USER = import.meta.env.VITE_ADMIN_USER
const VALID_PASS = import.meta.env.VITE_ADMIN_PASS
const AUTH_KEY = 'news_admin_auth'

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const savedAuth = sessionStorage.getItem(AUTH_KEY)
    if (savedAuth === 'true') {
      setIsAuthenticated(true)
    }
    setIsLoading(false)
  }, [])

  const login = (username, password) => {
    if (username === VALID_USER && password === VALID_PASS) {
      setIsAuthenticated(true)
      sessionStorage.setItem(AUTH_KEY, 'true')
      return { success: true }
    }
    return { success: false, error: 'Credenciais invalidas' }
  }

  const logout = () => {
    setIsAuthenticated(false)
    sessionStorage.removeItem(AUTH_KEY)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
