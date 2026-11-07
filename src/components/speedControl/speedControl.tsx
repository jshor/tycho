import React, { useEffect, useId, useRef, useState } from 'react'
import cx from 'classnames'
import { SpeedSlider } from '../slider/speedSlider/speedSlider'
import { ControlButton } from '../controlButton/controlButton'
import { describeSpeed } from '../../utils/a11y'
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
  const buttonRef = useRef<HTMLButtonElement>(null)
  const popoverId = useId()

  /**
   * Toggles the slider popover.
   */
  const toggle = () => setIsOpen((wasOpen) => !wasOpen)

  /**
   * Stows the slider popover, handing the focus back to the button that opened it.
   */
  const close = () => {
    setIsOpen(false)
    buttonRef.current?.focus()
  }

  /**
   * Stows the slider popover when escape is pressed within it.
   */
  const onKeyDown = (ev: React.KeyboardEvent) => {
    if (isOpen && ev.key === 'Escape') {
      ev.stopPropagation()
      close()
    }
  }

  /**
   * Stows the slider popover once the focus leaves the control altogether.
   */
  const onBlur = (ev: React.FocusEvent) => {
    if (!ref.current?.contains(ev.relatedTarget as Node)) {
      setIsOpen(false)
    }
  }

  useEffect(() => {
    if (isOpen) {
      ref.current?.querySelector<HTMLElement>('[role="slider"]')?.focus()
    }
  }, [isOpen])

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
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions
    <div
      className={cx('speed-control', { 'speed-control--open': isOpen })}
      ref={ref}
      onKeyDown={onKeyDown}
      onBlur={onBlur}
    >
      <div id={popoverId} className="speed-control__popover" role="dialog" aria-label="Speed">
        <SpeedSlider value={speed} onChange={onChange} />
      </div>

      <ControlButton
        ref={buttonRef}
        label={`Speed: ${describeSpeed(speed)}`}
        onClick={toggle}
        active={isOpen}
        expanded={isOpen}
        controls={popoverId}
      >
        &times;10<sup className="speed-control__exponent">{speed}</sup>
      </ControlButton>
    </div>
  )
}
