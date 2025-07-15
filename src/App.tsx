import { useState, useRef } from 'react'
import VideoPlayer from './components/VideoPlayer'
import SliderPanel from './components/SliderPanel'
import { getVideoSource, getAdSource } from './data/videoMap'
import { usePicoSliders } from './hooks/useEspSliders'

const App = () => {
  const [position, setPosition] = useState({
    horizontal: 'collective' as 'collective' | 'neutral' | 'neoliberal',
    vertical: 'progressive' as 'progressive' | 'authoritative',
  })

  const [sliderPosition, setSliderPosition] = useState({
    horizontal: 'collective' as 'collective' | 'neutral' | 'neoliberal',
    vertical: 'progressive' as 'progressive' | 'authoritative',
  })

  const [targetPosition, setTargetPosition] = useState(position)
  const [newsTimePercent, setNewsTimePercent] = useState(0)
  const [adTimePercent, setAdTimePercent] = useState(0)
  const [isPlayingAd, setIsPlayingAd] = useState(false)
  const [adVersion, setAdVersion] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [isShowingBanner, setIsShowingBanner] = useState(false)
  const [pendingPosition, setPendingPosition] = useState<typeof position | null>(null)

  const currentVideoTimeRef = useRef(0)

  const src = isShowingBanner 
    ? '/channel_banner/banner_neutral.mp4'
    : isPlayingAd
    ? getAdSource(position)
    : getVideoSource(position)

  const handleTimeUpdate = (percent: number) => {
    if (isPlayingAd) {
      setAdTimePercent(percent)
    } else if (!isShowingBanner) {
      setNewsTimePercent(percent)
    }
    currentVideoTimeRef.current = percent * 100
  }

  const handleSliderChange = (newPos: typeof position) => {
    // Update slider position immediately for visual feedback
    setSliderPosition(newPos)
  }

  const handleSliderCommit = (newPos: typeof position) => {
    const changed =
      newPos.horizontal !== position.horizontal ||
      newPos.vertical !== position.vertical

    // Only show banner when switching between news videos, not when ad is playing
    if (changed && !isTransitioning && !isShowingBanner && !isPlayingAd) {
      setIsTransitioning(true)
      setIsShowingBanner(true)
      setPendingPosition(newPos)

      // Show transition UI briefly
      setTimeout(() => {
        setIsTransitioning(false)
      }, 800)
    } else if (changed && !isTransitioning && !isShowingBanner && isPlayingAd) {
      // If ad is playing, switch position immediately without banner
      setPosition(newPos)
      setTargetPosition(newPos)
    }
  }

  const handlePositionChange = (newPos: typeof position) => {
    const changed =
      newPos.horizontal !== position.horizontal ||
      newPos.vertical !== position.vertical

    // Only show banner when switching between news videos, not when ad is playing
    if (changed && !isTransitioning && !isShowingBanner && !isPlayingAd) {
      setIsTransitioning(true)
      setIsShowingBanner(true)
      setPendingPosition(newPos)

      // Show transition UI briefly
      setTimeout(() => {
        setIsTransitioning(false)
      }, 800)
    } else if (changed && !isTransitioning && !isShowingBanner && isPlayingAd) {
      // If ad is playing, switch position immediately without banner
      setPosition(newPos)
      setTargetPosition(newPos)
    }
  }

  const handleVideoEnd = () => {
    setIsTransitioning(true)
    
    if (isShowingBanner) {
      // Banner finished, now show the pending position
      if (pendingPosition) {
        setPosition(pendingPosition)
        setTargetPosition(pendingPosition)
        setPendingPosition(null)
      }
      setIsShowingBanner(false)
      // Don't reset newsTimePercent here - let it continue from where it was
    } else if (isPlayingAd) {
      setIsPlayingAd(false)
      setAdTimePercent(0) // Reset ad time when ad ends
    } else {
      // News video ended, reset its time and switch to ad
      setNewsTimePercent(0)
      setIsPlayingAd(true)
      setAdVersion((v: number) => v + 1)
      // Don't reset adTimePercent here - let it continue from where it was
    }

    setTimeout(() => {
      setIsTransitioning(false)
    }, 800)
  }

  const percentageToHorizontal = (
    percentage: number
  ): 'collective' | 'neutral' | 'neoliberal' => {
    if (percentage < 33) return 'collective'
    if (percentage < 66) return 'neutral'
    return 'neoliberal'
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

  // Get the appropriate starting time for the video
  const getVideoStartTime = () => {
    if (isShowingBanner) return 0
    if (isPlayingAd) return adTimePercent
    return newsTimePercent
  }

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
          <span>News: {Math.round(newsTimePercent * 100)}% | Ad: {Math.round(adTimePercent * 100)}%</span>
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
          timePercent={getVideoStartTime()}
          onTimeUpdate={handleTimeUpdate}
          onEnd={handleVideoEnd}
          isAd={isPlayingAd}
          position={position}
          hideUI={isTransitioning}
        />
      </div>

      <SliderPanel
        value={sliderPosition}
        onChange={handleSliderChange}
        onCommit={handleSliderCommit}
      />
    </div>
  )
}

export default App