import { useState } from 'react'
import VideoPlayer from './components/VideoPlayer'
import SliderPanel from './components/SliderPanel'
import { getVideoSource, getAdSource } from './data/videoMap'

const App = () => {
  const [position, setPosition] = useState({
    horizontal: 'neutral' as 'left' | 'neutral' | 'right',
    vertical: 'conservative' as 'conservative' | 'progressive',
  })

  const [targetPosition, setTargetPosition] = useState(position)
  const [timePercent, setTimePercent] = useState(0)
  const [isPlayingAd, setIsPlayingAd] = useState(false)

  // Choose source based on whether we're in ad mode
  const src = isPlayingAd
    ? getAdSource(targetPosition)
    : getVideoSource(targetPosition)

  const handleTimeUpdate = (percent: number) => {
    if (!isPlayingAd) {
      setTimePercent(percent)
    }
  }

  // Handle when direction changes via SliderPanel
  const handlePositionChange = (newPos: typeof position) => {
    if (
      newPos.horizontal !== position.horizontal ||
      newPos.vertical !== position.vertical
    ) {
      // Only play ad if there's actually a change
      setTargetPosition(newPos)
      setIsPlayingAd(true)
    }
  }

  // Called when video (ad or news) ends
  const handleVideoEnd = () => {
    if (isPlayingAd) {
      // Ad just finished — now update direction + play main video at same time
      setIsPlayingAd(false)
      setPosition(targetPosition)
    }
  }

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h2>Latent News</h2>
      <VideoPlayer
        src={src}
        timePercent={isPlayingAd ? 0 : timePercent}
        onTimeUpdate={handleTimeUpdate}
        onEnd={handleVideoEnd}
      />
      <SliderPanel value={position} onChange={handlePositionChange} />
    </div>
  )
}

export default App
