import cx from 'classnames'
import { onActivate } from '../../utils/a11y'
import './uiControlsLayout.scss'

interface Props {
  /** Whether or not the user may interact with the controls. */
  controlsEnabled?: boolean
  /** Children to populate in the left pane. */
  left: React.ReactNode
  /** Children to populate in the top pane. */
  bottom: React.ReactNode
  /** Children to populate in the right pane. */
  right: React.ReactNode
  /** Label to display in the center pane. */
  label?: string
  /** Callback when the label is clicked. */
  onLabelClick?: () => void
}

/**
 * The heads-up display overlaying the scene.
 */
export function UIControlsLayout({ controlsEnabled, label, onLabelClick, left, bottom, right }: Props) {
  return (
    <div
      className={cx({
        'ui-controls-layout': true,
        'ui-controls-layout--enabled': controlsEnabled,
        'ui-controls-layout--disabled': !controlsEnabled
      })}
    >
      <div className="ui-controls-layout__left">{left}</div>
      <div className="ui-controls-layout__middle">
        <div className="ui-controls-layout__top">
          <div
            className="ui-controls-layout__label"
            role="button"
            tabIndex={0}
            onClick={onLabelClick}
            onKeyDown={onActivate(onLabelClick)}
          >
            {label}
          </div>
        </div>
        <div className="ui-controls-layout__center"></div>
        <div className="ui-controls-layout__bottom">{bottom}</div>
      </div>
      <div className="ui-controls-layout__right">{right}</div>
    </div>
  )
}
