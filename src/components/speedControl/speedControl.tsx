import { useEffect, useRef, useState } from 'react'
import cx from 'classnames'
import { SpeedSlider } from '../slider/speedSlider/speedSlider'
import { ControlButton } from '../controlButton/controlButton'
import './speedControl.scss'

interface Props {
  /** The power of ten the simulation clock runs at. */
  speed?: number
  /** Invoked with the power of ten the user picked. */
  onChange?: (speed: number) => void
}

/**
 * The button that shows the speed the simulation runs at, as a power of ten.
 *
 * Pressing it opens the slider that sets the speed, alongside the button it belongs to.
 */
export function SpeedControl({ speed = 0, onChange }: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  /**
   * Toggles the slider popover.
   */
  const toggle = () => setIsOpen((wasOpen) => !wasOpen)

  /**
   * Stows the slider popover when the user interacts elsewhere.
   */
  useEffect(() => {
    if (!isOpen) return

    const onPressElsewhere = ({ target }: Event) => {
      if (!ref.current?.contains(target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('pointerdown', onPressElsewhere)

    return () => document.removeEventListener('pointerdown', onPressElsewhere)
  }, [isOpen])

  return (
    <div className={cx('speed-control', { 'speed-control--open': isOpen })} ref={ref}>
      <div className="speed-control__popover" role="dialog" aria-label="Speed" aria-hidden={!isOpen}>
        <SpeedSlider value={speed} onChange={onChange} />
      </div>

      <ControlButton onClick={toggle} active={isOpen}>
        &times;10<sup className="speed-control__exponent">{speed}</sup>
      </ControlButton>
    </div>
  )
}
