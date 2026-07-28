import ReactSlider from 'react-slider'

interface Props {
  /** The axis the slider travels along. */
  orientation: 'horizontal' | 'vertical'
  /** The increment between selectable values. */
  step?: number
  /** The lowest selectable value. */
  min?: number
  /** The highest selectable value. */
  max?: number
  /** The currently selected value. */
  value?: number
  /** Invoked with the newly selected value. */
  onChange?: (value: number) => void
  /** Whether the track runs from `max` to `min` instead. */
  invert?: boolean
  /** The value to fall back to before one is selected. */
  defaultValue?: number
}

/**
 * A thin wrapper around `ReactSlider` that applies the app's slider styling.
 */
export default function Slider({ orientation, step, min, max, value, onChange, invert }: Props) {
  /**
   * Returns the BEM class name for the given slider part, in the slider's orientation.
   */
  const getClassName = (subName?: string): string => {
    let baseName = 'slider'

    if (subName) {
      baseName += `__${subName}`
    }
    return `${baseName} ${baseName}--${orientation}`
  }

  return (
    <ReactSlider
      orientation={orientation}
      className={getClassName('container')}
      thumbClassName={getClassName('handle')}
      trackClassName={getClassName('bar')}
      pearling={true}
      invert={invert}
      step={step}
      min={min}
      max={max}
      value={value}
      onChange={onChange}
    />
  )
}
