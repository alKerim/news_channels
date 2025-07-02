export type Position = {
  horizontal: 'left' | 'neutral' | 'right'
  vertical: 'conservative' | 'progressive'
}

export function getVideoSource(pos: Position): string {
  const key = `${pos.horizontal}_${pos.vertical}`

  const map: Record<string, string> = {
    'left_conservative': '/videos/left_conservative.mp4',
    'left_progressive': '/videos/left_progressive.mp4',
    'neutral_conservative': '/videos/neutral.mp4',
    'neutral_progressive': '/videos/neutral.mp4',
    'right_conservative': '/videos/right_conservative.mp4',
    'right_progressive': '/videos/right_progressive.mp4',
  }

  return map[key] ?? '/videos/placeholder.mp4'
}

export function getAdSource(pos: Position): string {
  const key = `${pos.horizontal}_${pos.vertical}`
  const map: Record<string, string> = {
    'left_conservative': '/ads/left_conservative_ad.mp4',
    'left_progressive': '/ads/left_progressive_ad.mp4',
    'neutral_conservative': '/ads/neutral_ad.mp4',
    'neutral_progressive': '/ads/neutral_ad.mp4',
    'right_conservative': '/ads/right_conservative_ad.mp4',
    'right_progressive': '/ads/right_progressive_ad.mp4',
  }

  return map[key] ?? '/ads/generic_ad.mp4'
}
