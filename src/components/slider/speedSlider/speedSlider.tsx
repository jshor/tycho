import { Slider } from '../slider/slider'
import { Constants } from '../../../constants'

interface Props {
  /** The power of ten the simulation clock runs at. */
  value?: number
  /** Invoked with the newly selected power of ten. */
  onChange?: (value: number) => void
}

/**
 * The horizontal slider that runs the simulation clock through its speeds.
 */
export function SpeedSlider({ value, onChange }: Props) {
  const { MIN, MAX, STEP } = Constants.UI.Speed

  return (
    <div className="slider slider--horizontal">
      <Slider
        orientation="horizontal"
        step={STEP}
        min={MIN}
        max={MAX}
        value={value ?? MIN}
        onChange={onChange}
      />
    </div>
  )
}
