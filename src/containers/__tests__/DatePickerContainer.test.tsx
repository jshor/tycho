import React from 'react'
import { act } from '@testing-library/react'
import { renderWithStore } from '../../test/render'
import DatePickerContainer from '../DatePickerContainer'
import { Mutable } from '../../test/helpers'
import moment from 'moment'

describe('Date Picker Container', () => {
  let ref: React.RefObject<DatePickerContainer>

  beforeEach(() => {
    ref = React.createRef<DatePickerContainer>()
    renderWithStore(<DatePickerContainer time={1000000} onUpdate={vi.fn()} ref={ref} />)
  })

  describe('componentDidUpdate()', () => {
    it('should update uxTime and realTime when time changes', () => {
      const container = ref.current as Mutable<DatePickerContainer>
      container.props = { time: 2000000 }
      act(() => {
        container.componentDidUpdate({ time: 1000000 })
      })

      expect(container.state.uxTime).toBeDefined()
      expect(container.state.realTime).toBeInstanceOf(Date)
    })

    it('should not update state when time is unchanged', () => {
      const container = ref.current as Mutable<DatePickerContainer>
      container.props = { time: 1000000 }
      const prevUxTime = container.state.uxTime

      container.componentDidUpdate({ time: 1000000 })

      expect(container.state.uxTime).toBe(prevUxTime)
    })

    it('should not update state when picker is open', () => {
      const container = ref.current as Mutable<DatePickerContainer>
      container.isOpen = true
      container.props = { time: 2000000 }

      container.componentDidUpdate({ time: 1000000 })
    })
  })

  describe('shouldComponentUpdate()', () => {
    it('should return true when picker is closed', () => {
      const current = ref.current
      current.isOpen = false
      expect(current.shouldComponentUpdate()).toBe(true)
    })

    it('should return false when picker is open', () => {
      const current = ref.current
      current.isOpen = true
      expect(current.shouldComponentUpdate()).toBe(false)
    })
  })

  describe('hidePicker() / showPicker()', () => {
    it('should set isOpen to false', () => {
      const current = ref.current
      current.isOpen = true
      current.hidePicker()
      expect(current.isOpen).toBe(false)
    })
  })

  describe('changeTime()', () => {
    it('should call onUpdate with unix timestamp', () => {
      const current = ref.current as Mutable<DatePickerContainer>
      const onUpdate = vi.fn()
      current.props = { onUpdate }
      const timeInstance = moment.unix(12345)

      current.changeTime(timeInstance)

      expect(onUpdate).toHaveBeenCalledWith(12345)
    })
  })
})
