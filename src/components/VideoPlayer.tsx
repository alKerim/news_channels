import { useEffect, useRef, useState } from 'react'

type Props = {
  src: string
  timePercent: number
  onTimeUpdate: (percent: number) => void
  onEnd?: () => void
  isAd?: boolean
  position?: {
    horizontal: "collective" | "neoliberal";
    vertical: "progressive" | "authoritative";
  }
}

const VideoPlayer = ({ src, timePercent, onTimeUpdate, onEnd, isAd = false, position }: Props) => {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)

  // when src changes, seek + autoplay
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    setIsLoading(true)

    const handleLoaded = () => {
      const targetTime = video.duration * timePercent
      video.currentTime = targetTime
      setDuration(video.duration)
      setIsLoading(false)

      // delay play until seeking is stable
      setTimeout(() => {
        video.play().catch((err) => {
          console.warn('Playback failed:', err)
        })
      }, 100)
    }

    const handleCanPlay = () => {
      setIsLoading(false)
    }

    const handleError = () => {
      setIsLoading(false)
      console.error('Video failed to load')
    }

    video.addEventListener('loadedmetadata', handleLoaded)
    video.addEventListener('canplay', handleCanPlay)
    video.addEventListener('error', handleError)

    return () => {
      video.removeEventListener('loadedmetadata', handleLoaded)
      video.removeEventListener('canplay', handleCanPlay)
      video.removeEventListener('error', handleError)
    }
  }, [src, timePercent])

  // keep tracking progress
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handleTimeUpdate = () => {
      if (!video.duration) return
      const percent = video.currentTime / video.duration
      setCurrentTime(video.currentTime)
      onTimeUpdate(percent)
    }

    video.addEventListener('timeupdate', handleTimeUpdate)
    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate)
    }
  }, [onTimeUpdate])

  useEffect(() => {
    const video = videoRef.current
    if (!video || !onEnd) return

    video.addEventListener('ended', onEnd)
    return () => {
      video.removeEventListener('ended', onEnd)
    }
  }, [onEnd])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getPositionColor = () => {
    if (!position) return '#6b7280'
    
    const { horizontal, vertical } = position
    
    if (horizontal === 'collective' && vertical === 'progressive') return '#10b981' // green
    if (horizontal === 'neoliberal' && vertical === 'progressive') return '#3b82f6' // blue  
    if (horizontal === 'collective' && vertical === 'authoritative') return '#dc2626' // red
    if (horizontal === 'neoliberal' && vertical === 'authoritative') return '#7c3aed' // purple
    
    return '#6b7280'
  }

  return (
    <div style={{
      position: 'relative',
      backgroundColor: '#000',
      borderRadius: '12px',
      overflow: 'hidden',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
    }}>
    <video
      ref={videoRef}
      src={src}
      controls
      style={{
        width: '100%',
        height: '100%',
        maxWidth: '100%',
        display: 'block',
        backgroundColor: '#f9fafb',
      }}
    />
    </div>
  )
}

export default VideoPlayer