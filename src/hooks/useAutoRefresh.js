import { useState, useEffect, useCallback, useRef } from 'react'

const REFRESH_KEY = 'news_admin_auto_refresh'

const intervals = {
  '0': { label: 'Desligado', ms: 0 },
  '30000': { label: '30 segundos', ms: 30000 },
  '60000': { label: '1 minuto', ms: 60000 },
  '300000': { label: '5 minutos', ms: 300000 },
}

export function useAutoRefresh(onRefresh) {
  const [interval, setIntervalValue] = useState(() => {
    const saved = localStorage.getItem(REFRESH_KEY)
    return saved || '0'
  })
  const [countdown, setCountdown] = useState(0)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const countdownRef = useRef(null)
  const refreshRef = useRef(null)

  const clearTimers = useCallback(() => {
    if (countdownRef.current) {
      clearInterval(countdownRef.current)
      countdownRef.current = null
    }
    if (refreshRef.current) {
      clearTimeout(refreshRef.current)
      refreshRef.current = null
    }
  }, [])

  const doRefresh = useCallback(async () => {
    if (onRefresh) {
      setIsRefreshing(true)
      try {
        await onRefresh()
      } finally {
        setIsRefreshing(false)
      }
    }
  }, [onRefresh])

  const startTimer = useCallback(() => {
    const ms = parseInt(interval)
    if (ms === 0) {
      setCountdown(0)
      return
    }

    setCountdown(Math.floor(ms / 1000))

    // Countdown timer
    countdownRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          return Math.floor(ms / 1000)
        }
        return prev - 1
      })
    }, 1000)

    // Refresh timer
    refreshRef.current = setInterval(() => {
      doRefresh()
    }, ms)
  }, [interval, doRefresh])

  useEffect(() => {
    localStorage.setItem(REFRESH_KEY, interval)
    clearTimers()
    startTimer()

    return clearTimers
  }, [interval, startTimer, clearTimers])

  const setInterval = useCallback((value) => {
    setIntervalValue(value)
  }, [])

  const refresh = useCallback(() => {
    doRefresh()
    // Reset countdown
    const ms = parseInt(interval)
    if (ms > 0) {
      setCountdown(Math.floor(ms / 1000))
    }
  }, [doRefresh, interval])

  return {
    interval,
    setInterval,
    countdown,
    isRefreshing,
    refresh,
    intervals,
    isEnabled: interval !== '0'
  }
}

export { intervals }
