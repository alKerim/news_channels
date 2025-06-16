import { useEffect, useRef } from 'react'

type Props = {
  src: string
  timePercent: number
  onTimeUpdate: (percent: number) => void
}

const VideoPlayer = ({ src, timePercent, onTimeUpdate }: Props) => {
  const videoRef = useRef<HTMLVideoElement | null>(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handleLoaded = () => {
      const newTime = video.duration * timePercent
      video.currentTime = newTime
      video.play()
    }

    const handleTimeUpdate = () => {
      if (!video || video.duration === 0) return
      onTimeUpdate(video.currentTime / video.duration)
    }

    video.addEventListener('loadedmetadata', handleLoaded)
    video.addEventListener('timeupdate', handleTimeUpdate)

    return () => {
      video.removeEventListener('loadedmetadata', handleLoaded)
      video.removeEventListener('timeupdate', handleTimeUpdate)
    }
  }, [src, timePercent])

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
