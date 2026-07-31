import cx from 'classnames'
import { ZoomSlider } from '../slider/zoomSlider/zoomSlider'
import { DatePicker } from '../../modules/datePicker'
import { PlayPause } from '../../modules/playPause'
import { Speed } from '../../modules/speed'
import { Volume } from '../../modules/volume'
import { Constants } from '../../constants'
import { onActivate } from '../../utils/a11y'
import './uiControls.scss'

interface Props {
  /** Whether or not the user may interact with the controls. */
  controlsEnabled?: boolean
  /** The name of the orbital the camera is focused on. */
  targetName?: string
  /** The current zoom level. */
  zoom?: number
  /** Opens the modal of the given type. */
  openModal?: (type: string) => void
  /** Applies a new zoom level. */
  changeZoom?: (zoom: number) => void
}

/**
 * The heads-up display overlaying the scene.
 */
export function UIControls({ controlsEnabled, targetName, zoom, openModal, changeZoom }: Props) {
  const openStatsModal = openModal && (() => openModal(Constants.UI.ModalTypes.STATS_MODAL))
  const openAboutModal = openModal && (() => openModal(Constants.UI.ModalTypes.ABOUT_MODAL))

  return (
    <div
      className={cx({
        uicontrols: true,
        'uicontrols--enabled': controlsEnabled,
        'uicontrols--disabled': !controlsEnabled
      })}
    >
      <div className="uicontrols__control uicontrols__control--target-label">
        <span
          className="uicontrols__control uicontrols__control--stats-modal"
          role="button"
          tabIndex={0}
          onClick={openStatsModal}
          onKeyDown={onActivate(openStatsModal)}
        >
          {targetName}
        </span>
      </div>

      <div className="uicontrols__control uicontrols__control--datetime">
        <div className="uicontrols__row">
          <DatePicker />
          <PlayPause />
        </div>
        <Speed />
      </div>

      <div className="uicontrols__control uicontrols__control--left-bar">
        <div
          className="uicontrols__button uicontrols__button--about-modal"
          role="button"
          tabIndex={0}
          onClick={openAboutModal}
          onKeyDown={onActivate(openAboutModal)}
        ></div>
        <ZoomSlider value={zoom} onChange={changeZoom} />
        <div className="uicontrols__button uicontrols__button--volume">
          <Volume />
        </div>
      </div>
    </div>
  )
}
