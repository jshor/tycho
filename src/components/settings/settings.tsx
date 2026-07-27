import cx from 'classnames'
import ScaleSlider from '../slider/scaleSlider'
import Constants from '../../constants'
import { PageText } from '../../types'

interface Props {
  /** Whether or not the settings panel is expanded. */
  settingsActive?: boolean
  /** The speed at which time passes in the simulation. */
  speed?: number
  /** The scale applied to the size of each body. */
  scale?: number
  /** The translated page text for the app. */
  pageText?: PageText
  /** Expands and collapses the settings panel. */
  toggleSetting?: () => void
  /** Applies a new simulation speed. */
  changeSpeed?: (speed: number) => void
  /** Applies a new body scale. */
  changeScale?: (scale: number) => void
}

/**
 * The collapsible panel holding the scene's speed and scale controls.
 */
export default function Settings({
  settingsActive,
  speed,
  scale,
  pageText,
  toggleSetting,
  changeSpeed,
  changeScale
}: Props) {
  return (
    <div
      className={cx({
        'settings-panel': true,
        'settings-panel--open': settingsActive
      })}
    >
      <div className="settings-panel__header">
        <div className="settings-panel__title">{pageText && pageText.settings}</div>
        <div
          className={cx({
            'settings-panel__hamburger': true,
            'settings-panel__hamburger--open': settingsActive
          })}
          onClick={toggleSetting}
        >
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>

      <div
        className={cx({
          'settings-panel__content': true,
          'settings-panel__content--open': settingsActive
        })}
      >
        <ScaleSlider
          value={speed}
          label={pageText && pageText.speedScale}
          onChange={changeSpeed}
          min={Constants.UI.Sliders.Speed.MIN}
          max={Constants.UI.Sliders.Speed.MAX}
        />
        <br />
        <ScaleSlider
          value={scale}
          label={pageText && pageText.planetScale}
          onChange={changeScale}
          min={Constants.UI.Sliders.Scale.MIN}
          max={Constants.UI.Sliders.Scale.MAX}
        />
        <br />
        <br />
      </div>
    </div>
  )
}
