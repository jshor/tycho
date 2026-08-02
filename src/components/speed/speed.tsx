import { useEffect, useRef, useState } from 'react'
import cx from 'classnames'
import { SpeedSlider } from '../slider/speedSlider/speedSlider'
import { onActivate } from '../../utils/a11y'
import './speed.scss'

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
export function Speed({ speed = 0, onChange }: Props) {
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
    <div className={cx('speed', { 'speed--open': isOpen })} ref={ref}>
      <div className="speed__popover" role="dialog" aria-label="Speed" aria-hidden={!isOpen}>
        <SpeedSlider value={speed} onChange={onChange} />
      </div>

      <span
        className="speed__button"
        role="button"
        aria-expanded={isOpen}
        tabIndex={0}
        onClick={toggle}
        onKeyDown={onActivate(toggle)}
      >
        &times;10<sup className="speed__exponent">{speed}</sup>
      </span>
    </div>
  )
}
