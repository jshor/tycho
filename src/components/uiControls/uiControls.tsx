import cx from 'classnames'
import { ZoomSlider } from '../slider/zoomSlider/zoomSlider'
import { DatePicker } from '../../modules/datePicker'
import { PlayPause } from '../../modules/playPause'
import { Speed } from '../../modules/speed'
import { Volume } from '../../modules/volume'
import { Constants } from '../../constants'
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
          onClick={openModal && (() => openModal(Constants.UI.ModalTypes.STATS_MODAL))}
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
          onClick={openModal && (() => openModal(Constants.UI.ModalTypes.ABOUT_MODAL))}
        ></div>
        <ZoomSlider value={zoom} onChange={changeZoom} />
        <div className="uicontrols__button uicontrols__button--volume">
          <Volume />
        </div>
      </div>
    </div>
  )
}
