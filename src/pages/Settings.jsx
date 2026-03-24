import { useSettings } from '@/context/SettingsContext'
import { useTheme } from '@/context/ThemeContext'
import { toast } from '@/hooks/useToast'
import { intervals } from '@/hooks/useAutoRefresh'
import {
  Settings as SettingsIcon,
  Moon,
  Sun,
  Monitor,
  RefreshCw,
  RotateCcw,
  TrendingUp,
  LayoutGrid
} from 'lucide-react'
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue
} from '@/components/ui'
import { Checkbox } from '@/components/ui/checkbox'

const themeOptions = [
  { value: 'light', label: 'Claro', icon: Sun },
  { value: 'dark', label: 'Escuro', icon: Moon },
  { value: 'system', label: 'Sistema', icon: Monitor }
]

const itemsPerPageOptions = [
  { value: 25, label: '25 itens' },
  { value: 50, label: '50 itens' },
  { value: 100, label: '100 itens' }
]

const sortOptions = [
  { value: 'fetched_at', label: 'Data de coleta' },
  { value: 'published_at', label: 'Data de publicacao' },
  { value: 'priority_score', label: 'Score de prioridade' }
]

export default function Settings() {
  const { settings, updateSetting, resetSettings } = useSettings()
  const { theme, setThemeMode } = useTheme()

  const handleThemeChange = (value) => {
    updateSetting('theme', value)
    setThemeMode(value)
  }

  const handleReset = () => {
    if (window.confirm('Tem certeza que deseja restaurar as configuracoes padrao?')) {
      resetSettings()
      setThemeMode('system')
      toast({
        title: 'Configuracoes restauradas',
        description: 'Todas as configuracoes foram restauradas para o padrao.',
        variant: 'success'
      })
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-400 bg-clip-text text-transparent">
          Configuracoes
        </h2>
        <p className="text-[hsl(var(--muted-foreground))] mt-1">
          Personalize sua experiencia no painel
        </p>
      </div>

      {/* Appearance */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base flex items-center gap-2">
            <Sun className="w-5 h-5" />
            Aparencia
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[hsl(var(--foreground))]">Tema</p>
              <p className="text-xs text-[hsl(var(--muted-foreground))]">
                Escolha entre claro, escuro ou siga o sistema
              </p>
            </div>
            <div className="flex items-center gap-1 p-1 bg-[hsl(var(--muted))] rounded-lg">
              {themeOptions.map((option) => {
                const Icon = option.icon
                const isActive = (settings.theme === option.value) ||
                  (settings.theme === 'system' && option.value === 'system')
                return (
                  <button
                    key={option.value}
                    onClick={() => handleThemeChange(option.value)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-[hsl(var(--background))] text-[hsl(var(--foreground))] shadow-sm'
                        : 'text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{option.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[hsl(var(--foreground))]">Modo compacto</p>
              <p className="text-xs text-[hsl(var(--muted-foreground))]">
                Reduz espacamentos para mostrar mais conteudo
              </p>
            </div>
            <Checkbox
              checked={settings.compactMode}
              onCheckedChange={(checked) => updateSetting('compactMode', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Data */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base flex items-center gap-2">
            <LayoutGrid className="w-5 h-5" />
            Dados
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[hsl(var(--foreground))]">Itens por pagina</p>
              <p className="text-xs text-[hsl(var(--muted-foreground))]">
                Quantidade padrao de itens nas listagens
              </p>
            </div>
            <Select
              value={settings.itemsPerPage.toString()}
              onValueChange={(value) => updateSetting('itemsPerPage', parseInt(value))}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {itemsPerPageOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value.toString()}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[hsl(var(--foreground))]">Ordenacao padrao</p>
              <p className="text-xs text-[hsl(var(--muted-foreground))]">
                Como as noticias sao ordenadas por padrao
              </p>
            </div>
            <Select
              value={settings.defaultSort}
              onValueChange={(value) => updateSetting('defaultSort', value)}
            >
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[hsl(var(--foreground))]">Indicadores de tendencia</p>
              <p className="text-xs text-[hsl(var(--muted-foreground))]">
                Mostrar variacao percentual nos cards de estatisticas
              </p>
            </div>
            <Checkbox
              checked={settings.showTrendIndicators}
              onCheckedChange={(checked) => updateSetting('showTrendIndicators', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Auto Refresh */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base flex items-center gap-2">
            <RefreshCw className="w-5 h-5" />
            Atualizacao Automatica
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[hsl(var(--foreground))]">Intervalo</p>
              <p className="text-xs text-[hsl(var(--muted-foreground))]">
                Frequencia de atualizacao automatica dos dados
              </p>
            </div>
            <Select
              value={settings.autoRefreshInterval}
              onValueChange={(value) => updateSetting('autoRefreshInterval', value)}
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(intervals).map(([value, { label }]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Reset */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base flex items-center gap-2 text-red-600">
            <RotateCcw className="w-5 h-5" />
            Restaurar Padrao
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[hsl(var(--foreground))]">Restaurar configuracoes</p>
              <p className="text-xs text-[hsl(var(--muted-foreground))]">
                Volta todas as configuracoes para os valores padrao
              </p>
            </div>
            <Button variant="destructive" onClick={handleReset}>
              <RotateCcw className="w-4 h-4" />
              Restaurar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
