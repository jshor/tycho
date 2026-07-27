import React from 'react'
import { renderWithStore } from '../../test/render'
import { EventContainer } from '../EventContainer'
import { Mutable } from '../../test/helpers'

describe('Event Container', () => {
  let ref: React.RefObject<EventContainer>

  beforeEach(() => {
    vi.clearAllMocks()
    ref = React.createRef<EventContainer>()
    renderWithStore(<EventContainer ref={ref} />)
  })

  describe('onTouched()', () => {
    it('should call setTouched with the current timestamp', () => {
      const current = ref.current as Mutable<EventContainer>
      const now = 12345
      const setTouched = vi.fn()
      vi.spyOn(Date, 'now').mockReturnValue(now)

      current.props = {
        action: { setTouched, setReleased: vi.fn() }
      }
      current.onTouched()

      expect(setTouched).toHaveBeenCalledWith(now)
    })
  })

  describe('onReleased()', () => {
    it('should call setReleased with the current timestamp', () => {
      const current = ref.current as Mutable<EventContainer>
      const now = 12345
      const setReleased = vi.fn()
      vi.spyOn(Date, 'now').mockReturnValue(now)

      current.props = {
        action: { setTouched: vi.fn(), setReleased }
      }
      current.onReleased()

      expect(setReleased).toHaveBeenCalledWith(now)
    })
  })
})
