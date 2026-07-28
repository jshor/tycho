import { act, fireEvent } from '@testing-library/react'
import { renderWithStore } from '../../test/render'
import useStore from '../../store'
import DatePicker from '../datePicker'
import moment from 'moment'
import Constants from '../../constants'

/**
 * The display text for the given simulation time, as the module formats it.
 */
const formatted = (time: number) => {
  return moment(time * 1000).format(Constants.UI.UX_DATE_FORMAT)
}

describe('Date Picker Module', () => {
  const getDisplay = (container: HTMLElement) => {
    return container.querySelector('.date-picker__display')?.textContent
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
      const { container } = renderWithStore(<DatePicker />, { time: 1000000 })
      const picked = moment.unix(12345)
      const input = container.querySelector('.date-picker__input') as HTMLInputElement

      fireEvent.change(input, { target: { value: picked.format('MM/DD/YYYY h:mm A') } })

      expect(useStore.getState().timeOffset).toEqual(picked.startOf('minute').unix())
    })

    it('should ignore a partially typed date', () => {
      const { container } = renderWithStore(<DatePicker />, { time: 1000000 })
      const input = container.querySelector('.date-picker__input') as HTMLInputElement

      fireEvent.change(input, { target: { value: '12/' } })

      expect(useStore.getState().timeOffset).toBeUndefined()
    })
  })
})
