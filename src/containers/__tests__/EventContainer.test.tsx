import React from 'react'
import { render } from '@testing-library/react'
import { EventContainer } from '../EventContainer'

describe('Event Container', () => {
  let ref: React.RefObject<EventContainer>

  beforeEach(() => {
    vi.clearAllMocks()
    ref = React.createRef<EventContainer>()
    render(<EventContainer ref={ref as any} />)
  })

  describe('onTouched()', () => {
    it('should call setTouched with the current timestamp', () => {
      const now = 12345
      const setTouched = vi.fn()
      vi.spyOn(Date, 'now').mockReturnValue(now)

      ;(ref.current! as any).props = { action: { setTouched } }
      ref.current!.onTouched()

      expect(setTouched).toHaveBeenCalledWith(now)
    })
  })

  describe('onReleased()', () => {
    it('should call setReleased with the current timestamp', () => {
      const now = 12345
      const setReleased = vi.fn()
      vi.spyOn(Date, 'now').mockReturnValue(now)

      ;(ref.current! as any).props = { action: { setReleased } }
      ref.current!.onReleased()

      expect(setReleased).toHaveBeenCalledWith(now)
    })
  })
})
