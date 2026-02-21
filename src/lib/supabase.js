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

  // News by category
  const { data: categoryData } = await supabase
    .from('news')
    .select('category')

  const byCategory = {}
  categoryData?.forEach(item => {
    byCategory[item.category] = (byCategory[item.category] || 0) + 1
  })

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

// Get categories list
export function getCategories() {
  return [
    { value: 'politics_pt', label: 'Politica PT', color: 'green' },
    { value: 'politics_br', label: 'Politica BR', color: 'yellow' },
    { value: 'politics_world', label: 'Politica Mundial', color: 'blue' },
    { value: 'controversies', label: 'Controversias', color: 'pink' },
    { value: 'conflicts', label: 'Conflitos', color: 'red' },
    { value: 'disasters', label: 'Desastres', color: 'orange' }
  ]
}
