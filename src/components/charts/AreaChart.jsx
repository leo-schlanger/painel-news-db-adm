import {
  AreaChart as RechartsAreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts'
import { useTheme } from '@/context/ThemeContext'

export default function AreaChart({ data, dataKey = 'value', xAxisKey = 'date', title, color = '#3b82f6', gradientId = 'colorArea' }) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const gridColor = isDark ? '#374151' : '#e5e7eb'
  const textColor = isDark ? '#9ca3af' : '#6b7280'

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[hsl(var(--popover))] border border-[hsl(var(--border))] rounded-lg shadow-lg p-3">
          <p className="text-sm font-medium text-[hsl(var(--foreground))]">{label}</p>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            {payload[0].name}: <span className="font-semibold text-[hsl(var(--foreground))]">{payload[0].value}</span>
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="w-full h-full">
      {title && (
        <h3 className="text-sm font-medium text-[hsl(var(--foreground))] mb-4">{title}</h3>
      )}
      <ResponsiveContainer width="100%" height={300}>
        <RechartsAreaChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.3} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
          <XAxis
            dataKey={xAxisKey}
            tick={{ fill: textColor, fontSize: 12 }}
            tickLine={{ stroke: gridColor }}
            axisLine={{ stroke: gridColor }}
          />
          <YAxis
            tick={{ fill: textColor, fontSize: 12 }}
            tickLine={{ stroke: gridColor }}
            axisLine={{ stroke: gridColor }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ paddingTop: '10px' }}
            formatter={(value) => <span style={{ color: textColor }}>{value}</span>}
          />
          <Area
            type="monotone"
            dataKey={dataKey}
            name="Coletas"
            stroke={color}
            strokeWidth={2}
            fillOpacity={1}
            fill={`url(#${gradientId})`}
          />
        </RechartsAreaChart>
      </ResponsiveContainer>
    </div>
  )
}
