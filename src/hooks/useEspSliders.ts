import { useState, useEffect, useRef } from 'react'

// Type definitions for slider data
interface SliderChannel {
  raw: number
  percentage: number
}

interface SliderData {
  slider1: {
    channel_a: SliderChannel
    channel_b: SliderChannel
  }
  slider2: {
    channel_a: SliderChannel
    channel_b: SliderChannel
  }
}

interface UsePicoSlidersProps {
  picoIP: string
  onSlider1A?: (percentage: number) => void
  onSlider1B?: (percentage: number) => void
  onSlider2A?: (percentage: number) => void
  onSlider2B?: (percentage: number) => void
  pollInterval?: number
  threshold?: number
}

export const usePicoSliders = ({
  picoIP,
  onSlider1A,
  onSlider1B,
  onSlider2A,
  onSlider2B,
  pollInterval = 150,
  threshold = 2
}: UsePicoSlidersProps) => {
  const [isConnected, setIsConnected] = useState(false)
  const [sliderData, setSliderData] = useState<SliderData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [connectionStrength, setConnectionStrength] = useState(0)
  
  const lastValuesRef = useRef<{
    slider1A: number | null
    slider1B: number | null
    slider2A: number | null
    slider2B: number | null
  }>({
    slider1A: null,
    slider1B: null,
    slider2A: null,
    slider2B: null
  })

  // Connection stability tracking
  const connectionStatsRef = useRef({
    successCount: 0,
    failureCount: 0,
    consecutiveFailures: 0,
    lastSuccessTime: Date.now(),
    responseTimeHistory: [] as number[]
  })

  const abortControllerRef = useRef<AbortController | null>(null)

  const calculateConnectionStrength = () => {
    const stats = connectionStatsRef.current
    const total = stats.successCount + stats.failureCount
    if (total === 0) return 0

    const successRate = stats.successCount / total
    const timeSinceLastSuccess = Date.now() - stats.lastSuccessTime
    const avgResponseTime = stats.responseTimeHistory.length > 0 
      ? stats.responseTimeHistory.reduce((a, b) => a + b, 0) / stats.responseTimeHistory.length
      : 1000

    // Calculate strength based on multiple factors
    let strength = successRate * 5 // Base strength from success rate
    
    // Penalty for consecutive failures
    if (stats.consecutiveFailures > 0) {
      strength -= Math.min(stats.consecutiveFailures * 0.5, 2)
    }
    
    // Penalty for slow responses
    if (avgResponseTime > 500) {
      strength -= 1
    }
    
    // Penalty for time since last success
    if (timeSinceLastSuccess > 5000) {
      strength -= 2
    }

    return Math.max(0, Math.min(5, Math.round(strength)))
  }

  const fetchSliderData = async () => {
    if (!picoIP) return

    // Cancel previous request if still pending
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    abortControllerRef.current = new AbortController()
    const requestStartTime = Date.now()

    try {
      // Create a combined signal that handles both manual abort and timeout
      const combinedController = new AbortController()
      const timeoutId = setTimeout(() => {
        combinedController.abort()
      }, 3000)

      // If the manual controller is aborted, abort the combined one too
      abortControllerRef.current.signal.addEventListener('abort', () => {
        combinedController.abort()
      })

      const response = await fetch(`http://${picoIP}:8080/sliders`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        signal: combinedController.signal
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      // Clean up timeout
      clearTimeout(timeoutId)

      const data: SliderData = await response.json()
      const responseTime = Date.now() - requestStartTime

      // Update connection stats
      const stats = connectionStatsRef.current
      stats.successCount++
      stats.consecutiveFailures = 0
      stats.lastSuccessTime = Date.now()
      stats.responseTimeHistory.push(responseTime)
      
      // Keep only last 10 response times
      if (stats.responseTimeHistory.length > 10) {
        stats.responseTimeHistory.shift()
      }

      setSliderData(data)
      setIsConnected(true)
      setError(null)
      setConnectionStrength(calculateConnectionStrength())

      // Check for significant changes and trigger callbacks
      const current = {
        slider1A: data.slider1.channel_a.percentage,
        slider1B: data.slider1.channel_b.percentage,
        slider2A: data.slider2.channel_a.percentage,
        slider2B: data.slider2.channel_b.percentage
      }

      const last = lastValuesRef.current

      // For first run or significant changes
      if (last.slider1A === null || Math.abs(current.slider1A - last.slider1A) >= threshold) {
        onSlider1A?.(current.slider1A)
        last.slider1A = current.slider1A
      }

      if (last.slider1B === null || Math.abs(current.slider1B - last.slider1B) >= threshold) {
        onSlider1B?.(current.slider1B)
        last.slider1B = current.slider1B
      }

      if (last.slider2A === null || Math.abs(current.slider2A - last.slider2A) >= threshold) {
        onSlider2A?.(current.slider2A)
        last.slider2A = current.slider2A
      }

      if (last.slider2B === null || Math.abs(current.slider2B - last.slider2B) >= threshold) {
        onSlider2B?.(current.slider2B)
        last.slider2B = current.slider2B
      }

    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        return // Request was cancelled, ignore
      }

      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch slider data'
      
      // Update connection stats
      const stats = connectionStatsRef.current
      stats.failureCount++
      stats.consecutiveFailures++
      
      setError(errorMessage)
      setConnectionStrength(calculateConnectionStrength())

      // Only set disconnected after multiple consecutive failures
      if (stats.consecutiveFailures >= 3) {
        setIsConnected(false)
      }

      // Exponential backoff for consecutive failures
      const backoffDelay = Math.min(stats.consecutiveFailures * 500, 3000)
      if (backoffDelay > 0) {
        setTimeout(() => {
          // This timeout will be cleared if the component unmounts or IP changes
        }, backoffDelay)
      }
    }
  }

  useEffect(() => {
    if (!picoIP) return

    // Reset connection stats when IP changes
    connectionStatsRef.current = {
      successCount: 0,
      failureCount: 0,
      consecutiveFailures: 0,
      lastSuccessTime: Date.now(),
      responseTimeHistory: []
    }

    // Reset last values when IP changes
    lastValuesRef.current = {
      slider1A: null,
      slider1B: null,
      slider2A: null,
      slider2B: null
    }

    // Initial fetch
    fetchSliderData()

    // Set up polling with adaptive interval
    const interval = setInterval(() => {
      const stats = connectionStatsRef.current
      
      // Use longer interval if connection is poor
      const adaptiveInterval = stats.consecutiveFailures > 0 
        ? pollInterval * (1 + stats.consecutiveFailures * 0.5)
        : pollInterval
      
      // Only fetch if enough time has passed
      if (Date.now() - stats.lastSuccessTime > adaptiveInterval) {
        fetchSliderData()
      }
    }, pollInterval)

    return () => {
      clearInterval(interval)
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [picoIP, pollInterval, threshold, onSlider1A, onSlider1B, onSlider2A, onSlider2B])

  return {
    isConnected,
    sliderData,
    error,
    connectionStrength,
    // Helper functions to get current values
    getSlider1A: () => sliderData?.slider1.channel_a.percentage || 0,
    getSlider1B: () => sliderData?.slider1.channel_b.percentage || 0,
    getSlider2A: () => sliderData?.slider2.channel_a.percentage || 0,
    getSlider2B: () => sliderData?.slider2.channel_b.percentage || 0,
  }
}