import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import { FavoritesProvider } from './context/FavoritesContext'
import { SettingsProvider } from './context/SettingsContext'
import { Toaster } from './components/ui/toaster'
import { TooltipProvider } from './components/ui/tooltip'
import ErrorBoundary from './components/ErrorBoundary'
import CommandPalette from './components/CommandPalette'
import KeyboardShortcutsHelp from './components/KeyboardShortcutsHelp'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import NewsList from './pages/NewsList'
import Sources from './pages/Sources'
import Stats from './pages/Stats'
import Analytics from './pages/Analytics'
import Favorites from './pages/Favorites'
import Settings from './pages/Settings'
import Layout from './components/Layout'

function PrivateRoute({ children }) {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? children : <Navigate to="/login" />
}

function AppContent() {
  return (
    <>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Layout />
            </PrivateRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="news" element={<NewsList />} />
          <Route path="sources" element={<Sources />} />
          <Route path="stats" element={<Stats />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="favorites" element={<Favorites />} />
          <Route path="settings" element={<Settings />} />
        </Route>
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      <CommandPalette />
      <KeyboardShortcutsHelp />
      <Toaster />
    </>
  )
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <TooltipProvider>
          <SettingsProvider>
            <FavoritesProvider>
              <AuthProvider>
                <AppContent />
              </AuthProvider>
            </FavoritesProvider>
          </SettingsProvider>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  )
}

export default App
