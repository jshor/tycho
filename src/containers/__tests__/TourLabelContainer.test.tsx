import React from 'react'
import { act } from '@testing-library/react'
import { renderWithStore } from '../../test/render'
import TourLabelContainer from '../TourLabelContainer'

vi.useFakeTimers()

describe('Tour Label Container', () => {
  describe('componentDidMount()', () => {
    it('should schedule show and hide via setTimeout', () => {
      const spy = vi.spyOn(global, 'setTimeout')

      renderWithStore(<TourLabelContainer text="Hello" start={100} end={5000} />)

      expect(spy).toHaveBeenCalledTimes(2)
    })
  })

  describe('setClassAsync()', () => {
    it('should update modifier state after the timeout fires', () => {
      const ref = React.createRef<TourLabelContainer>()
      renderWithStore(<TourLabelContainer text="Hello" start={100} end={5000} ref={ref} />)

      expect(ref.current?.state.modifier).toBe('hide')

      act(() => {
        vi.advanceTimersByTime(100)
      })
      expect(ref.current?.state.modifier).toBe('show')

      act(() => {
        vi.advanceTimersByTime(5000)
      })
      expect(ref.current?.state.modifier).toBe('hide')
    })

    it('should not update state after unmount', () => {
      const ref = React.createRef<TourLabelContainer>()
      const { unmount } = renderWithStore(
        <TourLabelContainer text="Hello" start={100} end={5000} ref={ref} />
      )

      unmount()

      expect(() => vi.advanceTimersByTime(10000)).not.toThrow()
    })
  })
})
