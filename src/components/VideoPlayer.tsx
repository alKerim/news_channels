import { useEffect, useRef } from 'react'

type Props = {
  src: string
  timePercent: number
  onTimeUpdate: (percent: number) => void
}

const VideoPlayer = ({ src, timePercent, onTimeUpdate }: Props) => {
  const videoRef = useRef<HTMLVideoElement | null>(null)

  // when src changes, seek + autoplay
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handleLoaded = () => {
      const targetTime = video.duration * timePercent
      video.currentTime = targetTime

      // delay play until seeking is stable
      setTimeout(() => {
        video.play().catch((err) => {
          console.warn('Playback failed:', err)
        })
      }, 100) // tiny delay helps with browser seeking quirks
    }

    video.addEventListener('loadedmetadata', handleLoaded)

    return () => {
      video.removeEventListener('loadedmetadata', handleLoaded)
    }
  }, [src])

  // keep tracking progress
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handleTimeUpdate = () => {
      if (!video.duration) return
      onTimeUpdate(video.currentTime / video.duration)
    }

    video.addEventListener('timeupdate', handleTimeUpdate)
    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate)
    }
  }, [onTimeUpdate])

  return (
    <video
      ref={videoRef}
      src={src}
      controls
      style={{ width: '100%', maxHeight: '60vh' }}
    />
  )
}

export default VideoPlayer
