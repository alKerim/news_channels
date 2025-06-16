import { useState } from 'react'
import VideoPlayer from './components/VideoPlayer'
import SliderPanel from './components/SliderPanel'
import { getVideoSource } from './data/videoMap'

const App = () => {
  const [position, setPosition] = useState({
    horizontal: 'neutral' as 'left' | 'neutral' | 'right',
    vertical: 'conservative' as 'conservative' | 'progressive',
  })

  const [timePercent, setTimePercent] = useState(0)

  const src = getVideoSource(position)

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h2>Political Media Stream</h2>
      <VideoPlayer src={src} timePercent={timePercent} onTimeUpdate={setTimePercent} />
      <SliderPanel value={position} onChange={setPosition} />
    </div>
  )
}

export default App
