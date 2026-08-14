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
  label?: React.ReactNode
  /** Callback when the label is clicked. */
  onLabelClick?: () => void
  /** Callback when the user interacts with the scene. */
  onInteract?: () => void
}

/**
 * The heads-up display overlaying the scene.
 */
export function UIControlsLayout({
  controlsEnabled,
  label,
  onLabelClick,
  onInteract,
  left,
  bottom,
  right
}: Props) {
  /**
   * Mouse pointer event handler.
   */
  const onPointerMove = (ev: React.PointerEvent<HTMLDivElement>) => {
    if (ev.buttons > 0) {
      onInteract?.()
    }
  }

  return (
    <div
      // the frame carries no meaning of its own, and listens only to hear the controls it holds
      role="presentation"
      className={cx({
        'ui-controls-layout': true,
        'ui-controls-layout--enabled': controlsEnabled,
        'ui-controls-layout--disabled': !controlsEnabled
      })}
      onPointerDown={onInteract}
      onPointerMove={onPointerMove}
      onKeyDown={onInteract}
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
