import { useEffect, useRef, useState } from 'react'

type Props = {
  src: string
  timePercent: number
  onTimeUpdate: (percent: number) => void
  onEnd?: () => void
  isAd?: boolean
  position?: {
    horizontal: "collective" | "neutral" | "neoliberal";
    vertical: "progressive" | "authoritative";
  }
  hideUI?: boolean
}

const VideoPlayer = ({ src, timePercent, onTimeUpdate, onEnd, isAd = false, position, hideUI = false }: Props) => {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    setIsLoading(true)

    const handleLoaded = () => {
      const targetTime = video.duration * timePercent
      video.currentTime = targetTime
      setDuration(video.duration)
      setIsLoading(false)

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
        controls={!hideUI}
        style={{
          width: '100%',
          height: '100%',
          maxWidth: '100%',
          display: 'block',
          backgroundColor: '#000',
        }}
      />
    </div>
  )
}

export default VideoPlayer
