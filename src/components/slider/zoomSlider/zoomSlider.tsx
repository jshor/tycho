import Slider from '../slider'
import Constants from '../../../constants'

interface Props {
  /** The current zoom level. */
  value?: number
  /** Invoked with the newly selected zoom level. */
  onChange?: (value: number) => void
}

/**
 * The vertical slider that zooms the camera toward and away from an active orbital.
 */
export default function ZoomSlider({ value, onChange }: Props) {
  return (
    <div className="slider slider--vertical">
      <Slider
        orientation="vertical"
        invert={true}
        step={Constants.WebGL.Zoom.STEP}
        min={Constants.WebGL.Zoom.MIN}
        max={Constants.WebGL.Zoom.MAX}
        value={value || Constants.WebGL.Zoom.MAX}
        onChange={onChange}
      />
    </div>
  )
}
