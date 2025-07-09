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

  const src = isPlayingAd
    ? getAdSource(position)
    : getVideoSource(position)

  const handleTimeUpdate = (percent: number) => {
    setTimePercent(percent)
  }

  const handlePositionChange = (newPos: typeof position) => {
    const changed =
      newPos.horizontal !== targetPosition.horizontal ||
      newPos.vertical !== targetPosition.vertical

    if (changed) {
      setTargetPosition(newPos)
      setPosition(newPos)
      
      if (isPlayingAd) {
        setAdVersion((v) => v + 1)
      }
    }
  }

  const handleVideoEnd = () => {
    if (isPlayingAd) {
      setIsPlayingAd(false)
      setTimePercent(0)
    } else {
      setIsPlayingAd(true)
      setAdVersion((v) => v + 1)
      setTimePercent(0)
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
    picoIP: '192.168.178.25', 
    onSwitch1: handleSwitch1,
    onSwitch2: handleSwitch2,
    pollInterval: 3000
  })

  return (
  <div
    style={{
      padding: '2rem',
      fontFamily: 'sans-serif',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      width: '100%',
    }}
  >
    {/* Centered Heading */}
    <h2 style={{ fontSize: '2rem', marginBottom: '1rem', textAlign: 'center', color: '#FFFFFF' }}>
      Latent News
    </h2>

    {/* Connection Status */}
    <div
      style={{
        padding: '8px 12px',
        borderRadius: '4px',
        backgroundColor: isConnected ? '#d4edda' : '#f8d7da',
        color: isConnected ? '#155724' : '#721c24',
        fontSize: '14px',
        marginBottom: '1rem',
        display: 'inline-block',
      }}
    >
      {isConnected ? 'Connected' : 'Disconnected'}
    </div>

    {/* Responsive Video Wrapper */}
    <div
    style={{
      width: '100%',
      height: '400px',
      maxWidth: '800px',
      marginBottom: '2rem',
      display: 'flex',
      justifyContent: 'center', // CENTER the video
    }}
  >
      <VideoPlayer
        key={
          isPlayingAd
            ? `ad-${adVersion}`
            : `news-${position.horizontal}-${position.vertical}`
        }
        src={src}
        timePercent={timePercent}
        onTimeUpdate={handleTimeUpdate}
        onEnd={handleVideoEnd}
      />
    </div>

    <SliderPanel value={targetPosition} onChange={handlePositionChange} />
  </div>
);


}

export default App