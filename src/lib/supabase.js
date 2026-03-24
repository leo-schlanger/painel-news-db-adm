import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY')
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder'
)

// Fetch news with filters
export async function fetchNews({
  category = null,
  sourceId = null,
  search = '',
  startDate = null,
  endDate = null,
  minScore = null,
  page = 1,
  perPage = 50,
  orderBy = 'fetched_at',
  orderDir = 'desc'
}) {
  let query = supabase
    .from('news')
    .select(`
      id,
      title,
      link,
      description,
      author,
      published_at,
      fetched_at,
      category,
      priority_score,
      matched_keywords,
      source_id,
      sources (
        id,
        name,
        url,
        category,
        country
      )
    `, { count: 'exact' })

  if (category) {
    query = query.eq('category', category)
  }

  if (sourceId) {
    query = query.eq('source_id', sourceId)
  }

  if (search) {
    query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
  }

  if (startDate) {
    query = query.gte('fetched_at', startDate)
  }

  if (endDate) {
    query = query.lte('fetched_at', endDate)
  }

  if (minScore !== null) {
    query = query.gte('priority_score', minScore)
  }

  const from = (page - 1) * perPage
  const to = from + perPage - 1

  query = query
    .order(orderBy, { ascending: orderDir === 'asc' })
    .range(from, to)

  const { data, error, count } = await query

  if (error) throw error

  return { data, count, page, perPage }
}

// Fetch all sources
export async function fetchSources() {
  const { data, error } = await supabase
    .from('sources')
    .select('*')
    .order('category')
    .order('name')

  if (error) throw error
  return data
}

// Fetch statistics
export async function fetchStats() {
  // Total news count
  const { count: totalNews } = await supabase
    .from('news')
    .select('*', { count: 'exact', head: true })

  // News last 24h
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const { count: newsLast24h } = await supabase
    .from('news')
    .select('*', { count: 'exact', head: true })
    .gte('fetched_at', yesterday.toISOString())

  // News by category - get actual categories from DB
  const { data: categoryData, error: categoryError } = await supabase
    .from('news')
    .select('category')

  if (categoryError) {
    console.error('Error fetching categories:', categoryError)
  }

  const byCategory = {}
  const predefinedCategories = getCategories().map(c => c.value)

  categoryData?.forEach(item => {
    const cat = item.category
    if (cat) {
      // Normalize category (lowercase, trim)
      const normalizedCat = cat.toString().toLowerCase().trim()
      byCategory[normalizedCat] = (byCategory[normalizedCat] || 0) + 1
    } else {
      // Count null/empty categories as 'uncategorized'
      byCategory['uncategorized'] = (byCategory['uncategorized'] || 0) + 1
    }
  })

  // Debug: log actual categories found
  console.log('Categories found in database:', Object.keys(byCategory))
  console.log('Category counts:', byCategory)

  // High priority news (score >= 2)
  const { count: highPriority } = await supabase
    .from('news')
    .select('*', { count: 'exact', head: true })
    .gte('priority_score', 2)

  // Active sources
  const { count: activeSources } = await supabase
    .from('sources')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true)

  // Total sources
  const { count: totalSources } = await supabase
    .from('sources')
    .select('*', { count: 'exact', head: true })

  return {
    totalNews,
    newsLast24h,
    byCategory,
    highPriority,
    activeSources,
    totalSources
  }
}

// Fetch statistics with trends (comparison with previous period)
export async function fetchStatsWithTrends() {
  const now = new Date()
  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  const twoDaysAgo = new Date(now)
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2)

  // Current stats
  const stats = await fetchStats()

  // News 24-48h ago for comparison
  const { count: newsYesterday } = await supabase
    .from('news')
    .select('*', { count: 'exact', head: true })
    .gte('fetched_at', twoDaysAgo.toISOString())
    .lt('fetched_at', yesterday.toISOString())

  // Calculate trends
  const news24hTrend = newsYesterday > 0
    ? ((stats.newsLast24h - newsYesterday) / newsYesterday * 100).toFixed(1)
    : 0

  return {
    ...stats,
    trends: {
      newsLast24h: parseFloat(news24hTrend)
    }
  }
}

// Fetch news over time (for line chart)
export async function fetchNewsOverTime(days = 7) {
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)
  startDate.setHours(0, 0, 0, 0)

  const { data, error } = await supabase
    .from('news')
    .select('fetched_at')
    .gte('fetched_at', startDate.toISOString())
    .order('fetched_at', { ascending: true })

  if (error) throw error

  // Group by day
  const grouped = {}
  const categories = getCategories()

  for (let i = 0; i < days; i++) {
    const date = new Date(startDate)
    date.setDate(date.getDate() + i)
    const dateStr = date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
    grouped[dateStr] = 0
  }

  data?.forEach(item => {
    const date = new Date(item.fetched_at)
    const dateStr = date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
    if (grouped[dateStr] !== undefined) {
      grouped[dateStr]++
    }
  })

  return Object.entries(grouped).map(([date, count]) => ({
    date,
    count
  }))
}

// Fetch news by category (for bar chart)
export async function fetchNewsByCategory() {
  const { data, error } = await supabase
    .from('news')
    .select('category')

  if (error) throw error

  const categories = getCategories()
  const grouped = {}

  categories.forEach(cat => {
    grouped[cat.value] = 0
  })

  data?.forEach(item => {
    if (grouped[item.category] !== undefined) {
      grouped[item.category]++
    }
  })

  return categories.map(cat => ({
    category: cat.label,
    value: cat.value,
    count: grouped[cat.value] || 0
  }))
}

// Fetch fetch logs over time (for area chart)
export async function fetchLogsOverTime(days = 7) {
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)
  startDate.setHours(0, 0, 0, 0)

  const { data, error } = await supabase
    .from('fetch_logs')
    .select('created_at, status, news_count')
    .gte('created_at', startDate.toISOString())
    .order('created_at', { ascending: true })

  if (error) throw error

  // Group by day
  const grouped = {}

  for (let i = 0; i < days; i++) {
    const date = new Date(startDate)
    date.setDate(date.getDate() + i)
    const dateStr = date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
    grouped[dateStr] = { fetches: 0, news: 0, errors: 0 }
  }

  data?.forEach(item => {
    const date = new Date(item.created_at)
    const dateStr = date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
    if (grouped[dateStr]) {
      grouped[dateStr].fetches++
      grouped[dateStr].news += item.news_count || 0
      if (item.status === 'error') {
        grouped[dateStr].errors++
      }
    }
  })

  return Object.entries(grouped).map(([date, data]) => ({
    date,
    ...data
  }))
}

// Fetch source performance analytics
export async function fetchSourceAnalytics() {
  const { data: logs, error } = await supabase
    .from('fetch_logs')
    .select(`
      source_id,
      status,
      news_count,
      duration_ms,
      sources (
        name
      )
    `)
    .order('created_at', { ascending: false })
    .limit(500)

  if (error) throw error

  // Group by source
  const sourceStats = {}

  logs?.forEach(log => {
    const sourceId = log.source_id
    if (!sourceStats[sourceId]) {
      sourceStats[sourceId] = {
        name: log.sources?.name || `Source #${sourceId}`,
        totalFetches: 0,
        successfulFetches: 0,
        totalNews: 0,
        totalDuration: 0,
        errors: 0
      }
    }

    sourceStats[sourceId].totalFetches++
    sourceStats[sourceId].totalNews += log.news_count || 0
    sourceStats[sourceId].totalDuration += log.duration_ms || 0

    if (log.status === 'success') {
      sourceStats[sourceId].successfulFetches++
    } else {
      sourceStats[sourceId].errors++
    }
  })

  return Object.entries(sourceStats).map(([id, stats]) => ({
    id,
    name: stats.name,
    successRate: stats.totalFetches > 0
      ? ((stats.successfulFetches / stats.totalFetches) * 100).toFixed(1)
      : 0,
    avgDuration: stats.totalFetches > 0
      ? Math.round(stats.totalDuration / stats.totalFetches)
      : 0,
    totalNews: stats.totalNews,
    totalFetches: stats.totalFetches,
    errors: stats.errors
  })).sort((a, b) => b.totalNews - a.totalNews)
}

// Fetch recent fetch logs
export async function fetchLogs(limit = 50) {
  const { data, error } = await supabase
    .from('fetch_logs')
    .select(`
      *,
      sources (
        name
      )
    `)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data
}

// Get categories list with multiple possible values
export function getCategories() {
  return [
    { value: 'politics_pt', label: 'Politica PT', color: 'green', aliases: ['politica_pt', 'politica pt', 'politics pt'] },
    { value: 'politics_br', label: 'Politica BR', color: 'yellow', aliases: ['politica_br', 'politica br', 'politics br', 'brazil', 'brasil'] },
    { value: 'politics_world', label: 'Politica Mundial', color: 'blue', aliases: ['politica_world', 'politica mundial', 'world', 'internacional', 'international'] },
    { value: 'controversies', label: 'Controversias', color: 'pink', aliases: ['controversia', 'controversy', 'polemicas', 'polemica'] },
    { value: 'conflicts', label: 'Conflitos', color: 'red', aliases: ['conflict', 'conflito', 'guerra', 'war'] },
    { value: 'disasters', label: 'Desastres', color: 'orange', aliases: ['disaster', 'desastre', 'catastrofe', 'catastrophe'] }
  ]
}

// Get category info by value (checks aliases too)
export function getCategoryInfo(categoryValue) {
  if (!categoryValue) return null

  const normalizedValue = categoryValue.toString().toLowerCase().trim()
  const categories = getCategories()

  // First try exact match
  let found = categories.find(c => c.value === normalizedValue)
  if (found) return found

  // Then try aliases
  found = categories.find(c =>
    c.aliases?.some(alias => alias.toLowerCase() === normalizedValue)
  )
  if (found) return found

  // Return a default for unknown categories
  return {
    value: normalizedValue,
    label: categoryValue,
    color: 'gray',
    isUnknown: true
  }
}

// Get all categories from database with counts
export async function fetchCategoriesFromDB() {
  const { data, error } = await supabase
    .from('news')
    .select('category')

  if (error) {
    console.error('Error fetching categories:', error)
    return []
  }

  // Count categories
  const counts = {}
  data?.forEach(item => {
    const cat = item.category || 'uncategorized'
    counts[cat] = (counts[cat] || 0) + 1
  })

  // Convert to array with category info
  return Object.entries(counts)
    .map(([value, count]) => ({
      ...getCategoryInfo(value),
      count,
      originalValue: value
    }))
    .sort((a, b) => b.count - a.count)
}
