import { render, fireEvent } from '@testing-library/react'
import DatePicker from '../datePicker'
import moment from 'moment'
import Constants from '../../constants'

/** The display text for the given simulation time, as the module formats it. */
const formatted = (time: number) => {
  return moment(time * 1000)
    .format(Constants.UI.UX_DATE_FORMAT)
    .replace(/ /g, ' ')
}

describe('Date Picker Module', () => {
  const getDisplay = (container: HTMLElement) => {
    return container.querySelector('.date-picker__display')?.textContent
  }

  describe('render()', () => {
    it('should display the current simulation time', () => {
      const { container } = render(<DatePicker time={1000000} onUpdate={vi.fn()} />)

      expect(getDisplay(container)).toEqual(formatted(1000000))
    })

    it('should display nothing until the simulation has a time', () => {
      const { container } = render(<DatePicker onUpdate={vi.fn()} />)

      expect(getDisplay(container)).toEqual('')
    })

    it('should re-read the clock as the simulation time changes', () => {
      const { container, rerender } = render(<DatePicker time={1000000} onUpdate={vi.fn()} />)

      rerender(<DatePicker time={2000000} onUpdate={vi.fn()} />)

      expect(getDisplay(container)).toEqual(formatted(2000000))
    })
  })

  describe('changeTime()', () => {
    it('should move the simulation to the picked time', () => {
      const onUpdate = vi.fn()
      const { container } = render(<DatePicker time={1000000} onUpdate={onUpdate} />)
      const picked = moment.unix(12345)
      const input = container.querySelector('.date-picker__input') as HTMLInputElement

      fireEvent.change(input, { target: { value: picked.format('MM/DD/YYYY h:mm A') } })

      expect(onUpdate).toHaveBeenCalledWith(picked.startOf('minute').unix())
    })

    it('should ignore a partially typed date', () => {
      const onUpdate = vi.fn()
      const { container } = render(<DatePicker time={1000000} onUpdate={onUpdate} />)
      const input = container.querySelector('.date-picker__input') as HTMLInputElement

      fireEvent.change(input, { target: { value: '12/' } })

      expect(onUpdate).not.toHaveBeenCalled()
    })
  })
})
