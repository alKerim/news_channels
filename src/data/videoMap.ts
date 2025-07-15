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

export function getAd2Source(pos: Position): string {
  const key = `${pos.horizontal}_${pos.vertical}`
  const map: Record<string, string> = {
    'collective_progressive': '/ads2/left_progressive_ad2.mp4',
    'collective_authoritative': '/ads2/left_conservative_ad2.mp4',
    'neutral_progressive': '/ads2/neutral_ad2.mp4',
    'neutral_authoritative': '/ads2/neutral_ad2.mp4',
    'neoliberal_progressive': '/ads2/right_progressive_ad2.mp4',
    'neoliberal_authoritative': '/ads2/right_conservative_ad2.mp4',
  }

  return map[key] ?? '/ads2/generic_ad2.mp4'
}