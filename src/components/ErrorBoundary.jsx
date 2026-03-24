import { Component } from 'react'
import { Button, Card } from '@/components/ui'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    this.setState({ errorInfo })
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
  }

  handleGoHome = () => {
    window.location.href = '/'
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[hsl(var(--background))] flex items-center justify-center p-4">
          <Card className="max-w-lg w-full p-8 text-center">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            <h1 className="text-2xl font-bold text-[hsl(var(--foreground))] mb-2">
              Algo deu errado
            </h1>
            <p className="text-[hsl(var(--muted-foreground))] mb-6">
              Ocorreu um erro inesperado. Tente atualizar a pagina ou voltar para o inicio.
            </p>

            {this.state.error && (
              <div className="mb-6 p-4 bg-[hsl(var(--muted))] rounded-lg text-left">
                <p className="text-xs font-mono text-[hsl(var(--muted-foreground))] break-all">
                  {this.state.error.toString()}
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={this.handleRetry}>
                <RefreshCw className="w-4 h-4" />
                Tentar Novamente
              </Button>
              <Button variant="secondary" onClick={this.handleGoHome}>
                <Home className="w-4 h-4" />
                Voltar ao Inicio
              </Button>
            </div>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}
