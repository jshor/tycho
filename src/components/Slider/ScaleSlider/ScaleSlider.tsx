import Slider from '../Slider'

interface Props {
  /** The text shown above the slider. */
  label?: string
  /** The currently selected value. */
  value?: number
  /** Invoked with the newly selected value. */
  onChange?: (value: number) => void
  /** The lowest selectable value. */
  min?: number
  /** The highest selectable value. */
  max?: number
}

/**
 * A horizontal UX slider.
 */
export default function ScaleSlider({ label, value, onChange, min, max }: Props) {
  return (
    <div>
      <div className="slider slider--horizontal">
        <span className="slider__label">
          {label}
          {value || min}
        </span>
        <Slider
          orientation="horizontal"
          value={value}
          onChange={onChange}
          defaultValue={min}
          min={min}
          max={max}
        />
      </div>
    </div>
  )
}
