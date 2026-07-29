import { act, fireEvent, screen } from '@testing-library/react'
import { renderWithStore } from '../../test/render'
import { useStore } from '../../store'
import { DatePicker } from '../datePicker'
import moment from 'moment'
import { Constants } from '../../constants'

/**
 * The display text for the given simulation time, as the module formats it.
 */
const formatted = (time: number) => {
  return moment(time * 1000)
    .format(Constants.UI.UX_DATE_FORMAT)
    .replace(/ /g, '\u00a0')
}

describe('Date Picker Module', () => {
  const time = moment('2024-01-01T12:00:00').unix()

  const getDisplay = (container: HTMLElement) => {
    return container.querySelector('.date-picker__display')?.textContent
  }

  const openCalendar = (container: HTMLElement) => {
    fireEvent.click(container.querySelector('.date-picker__display') as HTMLElement)
  }
  const pickDay = (day: RegExp) => {
    fireEvent.click(screen.getByRole('gridcell', { name: day }))
  }

  describe('render()', () => {
    it('should display the current simulation time', () => {
      const { container } = renderWithStore(<DatePicker />, { time: 1000000 })

      expect(getDisplay(container)).toEqual(formatted(1000000))
    })

    it('should display nothing until the simulation has a time', () => {
      const { container } = renderWithStore(<DatePicker />)

      expect(getDisplay(container)).toEqual('')
    })

    it('should re-read the clock as the simulation time changes', () => {
      const { container } = renderWithStore(<DatePicker />, { time: 1000000 })

      act(() => useStore.setState({ time: 2000000 }))

      expect(getDisplay(container)).toEqual(formatted(2000000))
    })
  })

  describe('changeTime()', () => {
    it('should move the simulation to the picked time', () => {
      const { container } = renderWithStore(<DatePicker />, { time })

      openCalendar(container)
      pickDay(/January 15th, 2024/)

      expect(useStore.getState().timeOffset).toEqual(moment('2024-01-15T12:00:00').unix())
    })

    it('should show the picked time on the readout', () => {
      const { container } = renderWithStore(<DatePicker />, { time })

      openCalendar(container)
      pickDay(/January 15th, 2024/)

      expect(getDisplay(container)).toEqual(formatted(moment('2024-01-15T12:00:00').unix()))
    })

    it('should hold the readout while the calendar is open, rather than move it under the user', () => {
      const { container } = renderWithStore(<DatePicker />, { time })

      openCalendar(container)
      act(() => useStore.setState({ time: 2000000 }))

      expect(getDisplay(container)).toEqual(formatted(time))
    })

    it('should re-read the clock once the calendar closes', () => {
      const { container } = renderWithStore(<DatePicker />, { time })

      openCalendar(container)
      fireEvent.keyDown(document.querySelector('.react-datepicker') as HTMLElement, {
        key: 'Escape'
      })
      act(() => useStore.setState({ time: 2000000 }))

      expect(getDisplay(container)).toEqual(formatted(2000000))
    })
  })
})
