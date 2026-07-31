import React from 'react'
import { onActivate } from '../a11y'

/** A key press carrying only what the handler reads of it. */
const press = (key: string) =>
  ({ key, preventDefault: vi.fn() }) as unknown as React.KeyboardEvent & {
    preventDefault: ReturnType<typeof vi.fn>
  }

describe('a11y', () => {
  describe('onActivate()', () => {
    it('should press the control on Enter', () => {
      const onClick = vi.fn()
      const ev = press('Enter')

      onActivate(onClick)(ev)

      expect(onClick).toHaveBeenCalledTimes(1)
      expect(ev.preventDefault).toHaveBeenCalledTimes(1)
    })

    it('should press the control on Space', () => {
      const onClick = vi.fn()
      const ev = press(' ')

      onActivate(onClick)(ev)

      expect(onClick).toHaveBeenCalledTimes(1)
      expect(ev.preventDefault).toHaveBeenCalledTimes(1)
    })

    it('should leave every other key to the browser', () => {
      const onClick = vi.fn()
      const ev = press('Tab')

      onActivate(onClick)(ev)

      expect(onClick).not.toHaveBeenCalled()
      expect(ev.preventDefault).not.toHaveBeenCalled()
    })

    it('should do nothing when there is nothing to press', () => {
      const ev = press('Enter')

      expect(() => onActivate()(ev)).not.toThrow()
      expect(ev.preventDefault).not.toHaveBeenCalled()
    })
  })
})
