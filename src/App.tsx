import { useState, useRef } from 'react'
import VideoPlayer from './components/VideoPlayer'
// import SliderPanel (removed)
import { getVideoSource, getAdSource } from './data/videoMap'
import { usePicoSliders } from './hooks/useEspSliders'

const App = () => {
  const [position, setPosition] = useState({
    horizontal: 'collective' as 'collective' | 'neoliberal',
    vertical: 'progressive' as 'progressive' | 'authoritative',
  })

  const [targetPosition, setTargetPosition] = useState(position)
  const [timePercent, setTimePercent] = useState(0)
  const [isPlayingAd, setIsPlayingAd] = useState(false)
  const [adVersion, setAdVersion] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)

  const currentVideoTimeRef = useRef(0)

  const src = isPlayingAd
    ? getAdSource(position)
    : getVideoSource(position)

  const handleTimeUpdate = (percent: number) => {
    setTimePercent(percent)
    currentVideoTimeRef.current = percent * 100
  }

  const handlePositionChange = (newPos: typeof position) => {
    const changed =
      newPos.horizontal !== position.horizontal ||
      newPos.vertical !== position.vertical

    if (changed && !isTransitioning) {
      setIsTransitioning(true)

      setTargetPosition(newPos)
      setPosition(newPos)

      if (isPlayingAd) {
        setAdVersion((v) => v + 1)
      }

      // Show transition UI briefly
      setTimeout(() => {
        setIsTransitioning(false)
      }, 800)
    }
  }

  const handleVideoEnd = () => {
    setIsTransitioning(true)
    if (isPlayingAd) {
      setIsPlayingAd(false)
      setTimePercent(0)
      currentVideoTimeRef.current = 0
    } else {
      setIsPlayingAd(true)
      setAdVersion((v) => v + 1)
      setTimePercent(0)
      currentVideoTimeRef.current = 0
    }

    setTimeout(() => {
      setIsTransitioning(false)
    }, 800)
  }

  const percentageToHorizontal = (
    percentage: number
  ): 'collective' | 'neoliberal' => {
    return percentage >= 50 ? 'neoliberal' : 'collective'
  }

  const percentageToVertical = (
    percentage: number
  ): 'progressive' | 'authoritative' => {
    return percentage >= 50 ? 'authoritative' : 'progressive'
  }

  const handleHorizontalSlider = (percentage: number) => {
    const newHorizontal = percentageToHorizontal(percentage)
    handlePositionChange({
      horizontal: newHorizontal,
      vertical: position.vertical
    })
  }

  const handleVerticalSlider = (percentage: number) => {
    const newVertical = percentageToVertical(percentage)
    handlePositionChange({
      horizontal: position.horizontal,
      vertical: newVertical
    })
  }

  const { isConnected, sliderData, error, connectionStrength } = usePicoSliders({
    picoIP: '192.168.178.25',
    onSlider1A: handleHorizontalSlider,
    onSlider2A: handleVerticalSlider, 
    pollInterval: 150,
    threshold: 1
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
      <h2 style={{ fontSize: '2rem', marginBottom: '1rem', textAlign: 'center', color: '#FFFFFF' }}>
        Latent News
      </h2>

      <div
        style={{
          padding: '8px 12px',
          borderRadius: '4px',
          backgroundColor: isConnected ? '#d4edda' : '#f8d7da',
          color: isConnected ? '#155724' : '#721c24',
          fontSize: '14px',
          marginBottom: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        <span>
          {isConnected ? 'Sliders Connected' : 'Sliders Disconnected'}
        </span>
        {isConnected && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                style={{
                  width: '4px',
                  height: connectionStrength > i ? '12px' : '4px',
                  backgroundColor: connectionStrength > i ? '#28a745' : '#dee2e6',
                  borderRadius: '1px',
                  transition: 'all 0.3s ease',
                }}
              />
            ))}
          </div>
        )}
        {error && !isConnected && (
          <span style={{ fontSize: '12px', opacity: 0.8 }}>
            {error.includes('timeout') ? 'Connection timeout' : 'Connection failed'}
          </span>
        )}
      </div>

      {sliderData && (
        <div
          style={{
            padding: '8px 12px',
            borderRadius: '4px',
            backgroundColor: '#f8f9fa',
            color: '#495057',
            fontSize: '12px',
            marginBottom: '1rem',
            display: 'flex',
            gap: '1rem',
            flexWrap: 'wrap',
          }}
        >
          <span>H (S1A): {sliderData.slider1.channel_a.percentage}%</span>
          <span>V (S2A): {sliderData.slider2.channel_a.percentage}%</span>
          <span>Current: {position.horizontal}/{position.vertical}</span>
          <span>Expected: {percentageToHorizontal(sliderData.slider1.channel_a.percentage)}/{percentageToVertical(sliderData.slider2.channel_a.percentage)}</span>
        </div>
      )}

      <div
        style={{
          width: '100%',
          height: '400px',
          maxWidth: '800px',
          marginBottom: '2rem',
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <VideoPlayer
          key={
            isPlayingAd
              ? `ad-${adVersion}`
              : `news-${position.horizontal}-${position.vertical}`
          }
          src={src}
          timePercent={!isPlayingAd ? currentVideoTimeRef.current / 100 : 0}
          onTimeUpdate={handleTimeUpdate}
          onEnd={handleVideoEnd}
          isAd={isPlayingAd}
          position={position}
          hideUI={isTransitioning}
        />
      </div>
    </div>
  )
}

export default App
