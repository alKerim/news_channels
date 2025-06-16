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
    'right_conservative': '/videos/placeholder.mp4',
    'right_progressive': '/videos/placeholder.mp4',
  }

  return map[key] ?? '/videos/placeholder.mp4'
}
