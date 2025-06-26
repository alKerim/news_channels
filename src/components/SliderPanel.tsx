type Axis = 'horizontal' | 'vertical'
type Direction = 'left' | 'neutral' | 'right' | 'conservative' | 'progressive'

type Props = {
  value: { horizontal: 'left' | 'neutral' | 'right'; vertical: 'conservative' | 'progressive' }
  onChange: (newValue: { horizontal: 'left' | 'neutral' | 'right'; vertical: 'conservative' | 'progressive' }) => void
}

const SliderPanel = ({ value, onChange }: Props) => {
  const handleAxisChange = (axis: Axis, direction: Direction) => {
    onChange({
      ...value,
      [axis]: direction,
    } as any)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', marginTop: '2rem' }}>
      <div>
        <label>Economic Axis (Left - Neutral - Right):</label>
        <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
          {['left', 'neutral', 'right'].map((dir) => (
            <button
              key={dir}
              onClick={() => handleAxisChange('horizontal', dir as any)}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: value.horizontal === dir ? '#222' : '#ccc',
                color: value.horizontal === dir ? '#fff' : '#000',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              {dir}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label>Social Axis (Progressive - Conservative):</label>
        <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
          {['progressive', 'conservative'].map((dir) => (
            <button
              key={dir}
              onClick={() => handleAxisChange('vertical', dir as any)}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: value.vertical === dir ? '#222' : '#ccc',
                color: value.vertical === dir ? '#fff' : '#000',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              {dir}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default SliderPanel
