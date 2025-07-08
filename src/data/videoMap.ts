export type Position = {
  horizontal: 'collective' | 'neutral' | 'neoliberal'
  vertical: 'progressive' | 'authoritative'
}

export function getVideoSource(pos: Position): string {
  const key = `${pos.horizontal}_${pos.vertical}`

  const map: Record<string, string> = {
    'collective_progressive': '/videos/left_progressive.mp4',
    'collective_authoritative': '/videos/left_conservative.mp4',
    'neutral_progressive': '/videos/neutral.mp4',
    'neutral_authoritative': '/videos/neutral.mp4',
    'neoliberal_progressive': '/videos/right_progressive.mp4',
    'neoliberal_authoritative': '/videos/right_conservative.mp4',
  }

  return map[key] ?? '/videos/placeholder.mp4'
}

export function getAdSource(pos: Position): string {
  const key = `${pos.horizontal}_${pos.vertical}`
  const map: Record<string, string> = {
    'collective_progressive': '/ads/left_progressive_ad.mp4',
    'collective_authoritative': '/ads/left_conservative_ad.mp4',
    'neutral_progressive': '/ads/neutral_ad.mp4',
    'neutral_authoritative': '/ads/neutral_ad.mp4',
    'neoliberal_progressive': '/ads/right_progressive_ad.mp4',
    'neoliberal_authoritative': '/ads/right_conservative_ad.mp4',
  }

  return map[key] ?? '/ads/generic_ad.mp4'
}