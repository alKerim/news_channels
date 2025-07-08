import { useState } from 'react'
import VideoPlayer from './components/VideoPlayer'
import SliderPanel from './components/SliderPanel'
import { getVideoSource, getAdSource } from './data/videoMap'
import { usePicoSwitches } from './hooks/usePicoSwitches'

const App = () => {
  const [position, setPosition] = useState({
    horizontal: 'collective' as 'collective' | 'neoliberal',
    vertical: 'progressive' as 'progressive' | 'authoritative',
  })

  const [targetPosition, setTargetPosition] = useState(position)
  const [timePercent, setTimePercent] = useState(0)
  const [isPlayingAd, setIsPlayingAd] = useState(false)
  const [adVersion, setAdVersion] = useState(0)
  const [adTimePercent, setAdTimePercent] = useState(0)

  // Choose source based on whether we're in ad mode
  const src = isPlayingAd
    ? getAdSource(targetPosition)
    : getVideoSource(targetPosition)

  const handleTimeUpdate = (percent: number) => {
    if (isPlayingAd) {
      setAdTimePercent(percent)
    } else {
      setTimePercent(percent)
    }
  }

  const handlePositionChange = (newPos: typeof position) => {
    const changed =
      newPos.horizontal !== targetPosition.horizontal ||
      newPos.vertical !== targetPosition.vertical

    if (changed) {
      setTargetPosition(newPos)
      if (isPlayingAd) {
        // Restart ad with new source
        setAdVersion((v) => v + 1)
      } else {
        setIsPlayingAd(true)
      }
    }
  }

  const handleVideoEnd = () => {
    if (isPlayingAd) {
      setIsPlayingAd(false)
      setAdTimePercent(0)
      setPosition(targetPosition)
    }
  }

  const handleSwitch1 = (state: number) => {
    const newHorizontal: 'collective' | 'neoliberal' = state === 0 ? 'collective' : 'neoliberal'
    const newPos: typeof position = {
      horizontal: newHorizontal,
      vertical: targetPosition.vertical,
    }
    handlePositionChange(newPos)
  }

  const handleSwitch2 = (state: number) => {
    const newVertical: 'progressive' | 'authoritative' = state === 0 ? 'progressive' : 'authoritative'
    const newPos: typeof position = {
      horizontal: targetPosition.horizontal,
      vertical: newVertical,
    }
    handlePositionChange(newPos)
  }

  const { isConnected } = usePicoSwitches({
    picoIP: 'IP ADDRESS', 
    onSwitch1: handleSwitch1,
    onSwitch2: handleSwitch2,
    pollInterval: 3000
  })

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h2>Latent News</h2>
      
      {/* Connection status indicator */}
      <div style={{ 
        padding: '8px 12px', 
        borderRadius: '4px', 
        backgroundColor: isConnected ? '#d4edda' : '#f8d7da',
        color: isConnected ? '#155724' : '#721c24',
        fontSize: '14px',
        marginBottom: '1rem',
        display: 'inline-block'
      }}>
        Pico W: {isConnected ? 'Connected' : 'Disconnected'}
      </div>

      <VideoPlayer
        key={isPlayingAd ? `ad-${adVersion}` : 'main'}
        src={src}
        timePercent={isPlayingAd ? adTimePercent : timePercent}
        onTimeUpdate={handleTimeUpdate}
        onEnd={handleVideoEnd}
      />
      
      <SliderPanel value={targetPosition} onChange={handlePositionChange} />
      
      {/* Instructions for physical switches */}
      <div style={{ 
        marginTop: '1rem', 
        padding: '12px', 
        backgroundColor: '#f8f9fa', 
        borderRadius: '4px',
        fontSize: '14px'
      }}>
        <strong>Physical Controls:</strong><br/>
        Switch 1: Horizontal position (Collective ↔ Neoliberal)<br/>
        Switch 2: Vertical position (Progressive ↔ Authoritative)
      </div>
    </div>
  )
}

export default App