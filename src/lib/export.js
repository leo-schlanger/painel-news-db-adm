// CSV Export utility

function escapeCSV(value) {
  if (value === null || value === undefined) return ''
  const str = String(value)
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

function formatDate(dateString) {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleString('pt-BR')
}

export function exportToCSV(data, filename = 'export.csv') {
  if (!data || data.length === 0) {
    throw new Error('No data to export')
  }

  const headers = [
    'ID',
    'Titulo',
    'Descricao',
    'Link',
    'Categoria',
    'Fonte',
    'Autor',
    'Score',
    'Keywords',
    'Publicado em',
    'Coletado em'
  ]

  const rows = data.map(item => [
    escapeCSV(item.id),
    escapeCSV(item.title),
    escapeCSV(item.description),
    escapeCSV(item.link),
    escapeCSV(item.category),
    escapeCSV(item.sources?.name || ''),
    escapeCSV(item.author),
    escapeCSV(item.priority_score),
    escapeCSV(item.matched_keywords?.join(', ')),
    escapeCSV(formatDate(item.published_at)),
    escapeCSV(formatDate(item.fetched_at))
  ])

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n')

  // Add BOM for Excel compatibility with UTF-8
  const BOM = '\uFEFF'
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export function exportSelectedToCSV(data, selectedIds, filename = 'selected_news.csv') {
  const selectedData = data.filter(item => selectedIds.includes(item.id))
  exportToCSV(selectedData, filename)
}

export function generateExportFilename(prefix = 'noticias') {
  const now = new Date()
  const dateStr = now.toISOString().split('T')[0]
  const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-')
  return `${prefix}_${dateStr}_${timeStr}.csv`
}
