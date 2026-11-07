import React from 'react'
import ReactSlider from 'react-slider'
import './slider.scss'

interface Props {
  /** Label of the slider (for screen readers). */
  label: string
  /** Numeric value of the slider (for screen readers). */
  valueText?: (value: number) => string
  /** The axis the slider travels along. */
  orientation: 'horizontal' | 'vertical'
  /** The increment between selectable values. */
  step?: number
  /** The increment of each arrow key press. */
  keyboardStep?: number
  /** The lowest selectable value. */
  min?: number
  /** The highest selectable value. */
  max?: number
  /** The currently selected value. */
  value?: number
  /** Invoked with the newly selected value. */
  onChange?: (value: number) => void
  /** Whether the track runs from `max` to `min` instead. */
  invert?: boolean
  /** The value to fall back to before one is selected. */
  defaultValue?: number
}

/** Number of steps to move the slider by. */
const PAGE_STEPS = 10 // TODO: move to constants

/**
 * A thin wrapper around `ReactSlider` that applies the app's slider styling.
 */
export function Slider({
  label,
  valueText,
  orientation,
  step,
  keyboardStep,
  min = 0,
  max = 100,
  value,
  onChange,
  invert
}: Props) {
  /**
   * Returns the BEM class name for the given slider part, in the slider's orientation.
   */
  const getClassName = (subName?: string): string => {
    let baseName = 'slider'

    if (subName) {
      baseName += `__${subName}`
    }
    return `${baseName} ${baseName}--${orientation}`
  }

  /**
   * Returns the value the given key moves the slider to from the given one.
   */
  const getKeyedValue = (key: string, from: number): number | undefined => {
    const deltas: Record<string, number> = {
      ArrowUp: keyboardStep,
      ArrowRight: keyboardStep,
      ArrowDown: -keyboardStep,
      ArrowLeft: -keyboardStep,
      PageUp: keyboardStep * PAGE_STEPS,
      PageDown: -keyboardStep * PAGE_STEPS,
      Home: -Infinity,
      End: Infinity
    }

    if (!(key in deltas)) return

    return Math.min(max, Math.max(min, from + deltas[key]))
  }

  /**
   * Moves the slider by the keyboard step.
   */
  const onThumbKeyDown =
    (from: number) =>
    (ev: React.KeyboardEvent): void => {
      const to = getKeyedValue(ev.key, from)

      if (to === undefined || ev.altKey || ev.ctrlKey || ev.metaKey || ev.shiftKey) return

      // `ReactSlider` listens on the document, which the event is kept from reaching
      ev.preventDefault()
      ev.stopPropagation()
      onChange?.(to)
    }

  return (
    <ReactSlider
      orientation={orientation}
      className={getClassName('container')}
      thumbClassName={getClassName('handle')}
      trackClassName={getClassName('bar')}
      ariaLabel={label}
      ariaValuetext={valueText ? ({ valueNow }) => valueText(valueNow) : undefined}
      renderThumb={({ key, ...props }, { valueNow }) => (
        // eslint-disable-next-line jsx-a11y/no-static-element-interactions
        <div key={key} {...props} onKeyDown={keyboardStep ? onThumbKeyDown(valueNow) : undefined} />
      )}
      pearling={true}
      invert={invert}
      step={step}
      min={min}
      max={max}
      value={value}
      onChange={onChange}
    />
  )
}
