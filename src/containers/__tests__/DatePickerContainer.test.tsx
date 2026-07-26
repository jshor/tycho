import React from 'react'
import { render } from '@testing-library/react'
import DatePickerContainer from '../DatePickerContainer'

describe('Date Picker Container', () => {
  let ref: React.RefObject<DatePickerContainer>

  beforeEach(() => {
    ref = React.createRef<DatePickerContainer>()
    render(<DatePickerContainer time={1000000} onUpdate={vi.fn()} ref={ref as any} />)
  })

  describe('componentDidUpdate()', () => {
    it('should update uxTime and realTime when time changes', () => {
      const container = ref.current!
      ;(container as any).props = { time: 2000000 }
      container.componentDidUpdate({ time: 1000000 } as any)

      expect(container.state.uxTime).toBeDefined()
      expect(container.state.realTime).toBeInstanceOf(Date)
    })

    it('should not update state when time is unchanged', () => {
      const container = ref.current!
      ;(container as any).props = { time: 1000000 }
      const prevUxTime = container.state.uxTime

      container.componentDidUpdate({ time: 1000000 } as any)

      expect(container.state.uxTime).toBe(prevUxTime)
    })

    it('should not update state when picker is open', () => {
      const container = ref.current!
      container.isOpen = true
      ;(container as any).props = { time: 2000000 }

      container.componentDidUpdate({ time: 1000000 } as any)
    })
  })

  describe('shouldComponentUpdate()', () => {
    it('should return true when picker is closed', () => {
      ref.current!.isOpen = false
      expect(ref.current!.shouldComponentUpdate()).toBe(true)
    })

    it('should return false when picker is open', () => {
      ref.current!.isOpen = true
      expect(ref.current!.shouldComponentUpdate()).toBe(false)
    })
  })

  describe('hidePicker() / showPicker()', () => {
    it('should set isOpen to false', () => {
      ref.current!.isOpen = true
      ref.current!.hidePicker()
      expect(ref.current!.isOpen).toBe(false)
    })
  })

  describe('changeTime()', () => {
    it('should call onUpdate with unix timestamp', () => {
      const onUpdate = vi.fn()
      ;(ref.current! as any).props = { onUpdate }
      const moment = { unix: () => 12345 } as any

      ref.current!.changeTime(moment)

      expect(onUpdate).toHaveBeenCalledWith(12345)
    })
  })
})
