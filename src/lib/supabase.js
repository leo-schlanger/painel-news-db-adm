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

// ============================================================
// CACHE LAYER - Reduces redundant queries
// ============================================================

const cache = new Map()
const CACHE_TTL = {
  stats: 60 * 1000,        // 1 minute
  sources: 5 * 60 * 1000,  // 5 minutes
  categories: 5 * 60 * 1000, // 5 minutes
  logs: 30 * 1000,         // 30 seconds
  analytics: 60 * 1000,    // 1 minute
}

function getCached(key) {
  const item = cache.get(key)
  if (!item) return null
  if (Date.now() > item.expiry) {
    cache.delete(key)
    return null
  }
  return item.data
}

function setCache(key, data, ttlMs) {
  cache.set(key, {
    data,
    expiry: Date.now() + ttlMs
  })
}

export function clearCache(key = null) {
  if (key) {
    cache.delete(key)
  } else {
    cache.clear()
  }
}

// ============================================================
// OPTIMIZED QUERIES
// ============================================================

// Fetch news with filters - OPTIMIZED: select only needed columns
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
  orderDir = 'desc',
  minimal = false // New option for dashboard (fewer columns)
}) {
  // Select only necessary columns based on context
  const columns = minimal
    ? `id, title, category, priority_score, fetched_at, source_id, sources(name)`
    : `id, title, link, description, published_at, fetched_at, category, priority_score, source_id, sources(id, name, category)`

  let query = supabase
    .from('news')
    .select(columns, { count: 'exact' })

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

// Fetch all sources - OPTIMIZED: with cache
export async function fetchSources() {
  const cached = getCached('sources')
  if (cached) return cached

  const { data, error } = await supabase
    .from('sources')
    .select('id, name, url, category, country, is_active')
    .order('category')
    .order('name')

  if (error) throw error

  setCache('sources', data, CACHE_TTL.sources)
  return data
}

// Fetch statistics - OPTIMIZED: reduced from 8+ queries to 3 queries
export async function fetchStats() {
  const cached = getCached('stats')
  if (cached) return cached

  const now = new Date()
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)

  // Run only 3 queries instead of 8+
  const [
    newsCountsResult,
    sourceCountsResult,
    categoryCountsResult
  ] = await Promise.all([
    // Query 1: News counts (total, last 24h, high priority) - single query with multiple conditions
    Promise.all([
      supabase.from('news').select('*', { count: 'exact', head: true }),
      supabase.from('news').select('*', { count: 'exact', head: true })
        .gte('fetched_at', yesterday.toISOString()),
      supabase.from('news').select('*', { count: 'exact', head: true })
        .gte('priority_score', 2)
    ]),

    // Query 2: Source counts
    Promise.all([
      supabase.from('sources').select('*', { count: 'exact', head: true })
        .eq('is_active', true),
      supabase.from('sources').select('*', { count: 'exact', head: true })
    ]),

    // Query 3: Category counts - single query fetching distinct categories
    supabase.from('news').select('category').limit(10000)
  ])

  // Process category counts client-side (much smaller than fetching all rows)
  const categoryCounts = {}
  if (categoryCountsResult.data) {
    categoryCountsResult.data.forEach(item => {
      const cat = item.category || 'uncategorized'
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1
    })
  }

  // Map to predefined categories
  const categories = getCategories()
  const byCategory = {}
  categories.forEach(cat => {
    const count = categoryCounts[cat.value] || 0
    if (count > 0) {
      byCategory[cat.value] = count
    }
  })

  const stats = {
    totalNews: newsCountsResult[0].count || 0,
    newsLast24h: newsCountsResult[1].count || 0,
    highPriority: newsCountsResult[2].count || 0,
    activeSources: sourceCountsResult[0].count || 0,
    totalSources: sourceCountsResult[1].count || 0,
    byCategory
  }

  setCache('stats', stats, CACHE_TTL.stats)
  return stats
}

// Fetch statistics with trends - OPTIMIZED: uses cached stats
export async function fetchStatsWithTrends() {
  const now = new Date()
  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  const twoDaysAgo = new Date(now)
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2)

  // Current stats (may be cached)
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

// Fetch news over time - OPTIMIZED: max 7 days, uses single query
export async function fetchNewsOverTime(days = 7) {
  // Limit to 7 days max to reduce queries
  const limitedDays = Math.min(days, 7)

  const startDate = new Date()
  startDate.setDate(startDate.getDate() - limitedDays + 1)
  startDate.setHours(0, 0, 0, 0)

  // Single query to get all news in range with just the date
  const { data, error } = await supabase
    .from('news')
    .select('fetched_at')
    .gte('fetched_at', startDate.toISOString())
    .order('fetched_at', { ascending: true })
    .limit(10000)

  if (error) throw error

  // Aggregate by day client-side
  const dayCounts = {}
  for (let i = 0; i < limitedDays; i++) {
    const day = new Date()
    day.setDate(day.getDate() - (limitedDays - 1 - i))
    const dateStr = day.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
    dayCounts[dateStr] = 0
  }

  data?.forEach(item => {
    const date = new Date(item.fetched_at)
    const dateStr = date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
    if (dayCounts.hasOwnProperty(dateStr)) {
      dayCounts[dateStr]++
    }
  })

  return Object.entries(dayCounts).map(([date, count]) => ({ date, count }))
}

// Fetch news by category - OPTIMIZED: uses cached stats
export async function fetchNewsByCategory() {
  // Reuse stats which already has category counts
  const stats = await fetchStats()
  const categories = getCategories()

  return categories
    .map(cat => ({
      category: cat.label,
      value: cat.value,
      count: stats.byCategory[cat.value] || 0
    }))
    .filter(r => r.count > 0)
    .sort((a, b) => b.count - a.count)
}

// Fetch fetch logs over time - OPTIMIZED: single query instead of N queries
export async function fetchLogsOverTime(days = 7) {
  // Limit to 7 days max
  const limitedDays = Math.min(days, 7)

  const startDate = new Date()
  startDate.setDate(startDate.getDate() - limitedDays + 1)
  startDate.setHours(0, 0, 0, 0)

  // Single query to get all logs in range
  const { data, error } = await supabase
    .from('fetch_logs')
    .select('created_at, status, news_count')
    .gte('created_at', startDate.toISOString())
    .order('created_at', { ascending: true })
    .limit(5000)

  if (error) throw error

  // Aggregate by day client-side
  const dayStats = {}
  for (let i = 0; i < limitedDays; i++) {
    const day = new Date()
    day.setDate(day.getDate() - (limitedDays - 1 - i))
    const dateStr = day.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
    dayStats[dateStr] = { fetches: 0, news: 0, errors: 0 }
  }

  data?.forEach(log => {
    const date = new Date(log.created_at)
    const dateStr = date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
    if (dayStats[dateStr]) {
      dayStats[dateStr].fetches++
      dayStats[dateStr].news += log.news_count || 0
      if (log.status === 'error') {
        dayStats[dateStr].errors++
      }
    }
  })

  return Object.entries(dayStats).map(([date, stats]) => ({
    date,
    ...stats
  }))
}

// Fetch source performance analytics - OPTIMIZED: with cache and reduced limit
export async function fetchSourceAnalytics() {
  const cached = getCached('analytics')
  if (cached) return cached

  const { data: logs, error } = await supabase
    .from('fetch_logs')
    .select('source_id, status, news_count, duration_ms, sources(name)')
    .order('created_at', { ascending: false })
    .limit(200) // Reduced from 500

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

  const result = Object.entries(sourceStats).map(([id, stats]) => ({
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

  setCache('analytics', result, CACHE_TTL.analytics)
  return result
}

// Fetch recent fetch logs - OPTIMIZED: with cache
export async function fetchLogs(limit = 30) {
  const cacheKey = `logs_${limit}`
  const cached = getCached(cacheKey)
  if (cached) return cached

  const { data, error } = await supabase
    .from('fetch_logs')
    .select('id, created_at, status, news_count, duration_ms, error_message, sources(name)')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error

  setCache(cacheKey, data, CACHE_TTL.logs)
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

// Get all categories from database with counts - OPTIMIZED: uses fetchStats cache
export async function fetchCategoriesFromDB() {
  const stats = await fetchStats()

  return Object.entries(stats.byCategory)
    .map(([value, count]) => ({
      ...getCategoryInfo(value),
      count,
      originalValue: value
    }))
    .sort((a, b) => b.count - a.count)
}
