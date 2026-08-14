import { createEvent, fireEvent, render } from '@testing-library/react'
import { useStore } from '../../store'
import { Constants } from '../../constants'
import { Event } from '../event'

/** Two fingers the given distance apart, along the x axis. */
const fingers = (separation: number) => ({
  touches: [
    { clientX: 0, clientY: 0 },
    { clientX: separation, clientY: 0 }
  ]
})

/** A single finger, which is not a pinch. */
const finger = { touches: [{ clientX: 0, clientY: 0 }] }

describe('Event Module', () => {
  const renderModule = (onPinch?: (separationDelta: number) => void) => {
    const { container } = render(
      <Event onPinch={onPinch}>
        <div className="child" />
      </Event>
    )

    return container.firstElementChild as HTMLElement
  }

  describe('onInteract()', () => {
    it('should record the timestamp when the scene is pressed', () => {
      const now = 12345
      vi.spyOn(Date, 'now').mockReturnValue(now)

      fireEvent.mouseDown(renderModule())

      expect(useStore.getState().interacted).toEqual(now)
    })

    it('should record the timestamp when a finger lands on the scene', () => {
      const now = 12345
      vi.spyOn(Date, 'now').mockReturnValue(now)

      fireEvent.touchStart(renderModule())

      expect(useStore.getState().interacted).toEqual(now)
    })

    it('should record the timestamp when the scene is scrolled over', () => {
      const now = 12345
      vi.spyOn(Date, 'now').mockReturnValue(now)

      fireEvent.wheel(renderModule())

      expect(useStore.getState().interacted).toEqual(now)
    })

    it('should record the timestamp when the scene is released', () => {
      const now = 12345
      vi.spyOn(Date, 'now').mockReturnValue(now)

      fireEvent.mouseUp(renderModule())

      expect(useStore.getState().interacted).toEqual(now)
    })

    it('should record the timestamp when a finger moves across the scene', () => {
      const now = 12345
      vi.spyOn(Date, 'now').mockReturnValue(now)

      fireEvent.touchMove(renderModule(), finger)

      expect(useStore.getState().interacted).toEqual(now)
    })

    it('should keep recording while the scene is dragged', () => {
      const scene = renderModule()
      const start = 12345
      const now = vi.spyOn(Date, 'now').mockReturnValue(start)

      fireEvent.mouseDown(scene)
      now.mockReturnValue(start + Constants.UI.INTERACTION_INTERVAL)
      fireEvent.mouseMove(scene, { buttons: 1 })

      expect(useStore.getState().interacted).toEqual(start + Constants.UI.INTERACTION_INTERVAL)
    })

    it('should ignore a pointer that merely passes over the scene', () => {
      const scene = renderModule()

      fireEvent.mouseMove(scene, { buttons: 0 })

      expect(useStore.getState().interacted).toBeUndefined()
    })

    it('should record a gesture already underway no more than once an interval', () => {
      const scene = renderModule()
      const start = 12345
      const now = vi.spyOn(Date, 'now').mockReturnValue(start)

      fireEvent.mouseDown(scene)
      now.mockReturnValue(start + Constants.UI.INTERACTION_INTERVAL - 1)
      fireEvent.mouseMove(scene, { buttons: 1 })

      expect(useStore.getState().interacted).toEqual(start)
    })
  })

  describe('onPinch()', () => {
    it('should report how much further apart the fingers spread', () => {
      const onPinch = vi.fn()
      const scene = renderModule(onPinch)

      fireEvent.touchStart(scene, fingers(100))
      fireEvent.touchMove(scene, fingers(160))

      expect(onPinch).toHaveBeenCalledWith(60)
    })

    it('should report how much closer together the fingers came', () => {
      const onPinch = vi.fn()
      const scene = renderModule(onPinch)

      fireEvent.touchStart(scene, fingers(100))
      fireEvent.touchMove(scene, fingers(40))

      expect(onPinch).toHaveBeenCalledWith(-60)
    })

    it('should measure each move against the one before it', () => {
      const onPinch = vi.fn()
      const scene = renderModule(onPinch)

      fireEvent.touchStart(scene, fingers(100))
      fireEvent.touchMove(scene, fingers(120))
      fireEvent.touchMove(scene, fingers(150))

      expect(onPinch).toHaveBeenNthCalledWith(1, 20)
      expect(onPinch).toHaveBeenNthCalledWith(2, 30)
    })

    it('should measure fingers that move on both axes', () => {
      const onPinch = vi.fn()
      const scene = renderModule(onPinch)

      fireEvent.touchStart(scene, fingers(0))
      fireEvent.touchMove(scene, {
        touches: [
          { clientX: 0, clientY: 0 },
          { clientX: 30, clientY: 40 }
        ]
      })

      expect(onPinch).toHaveBeenCalledWith(50)
    })

    it('should ignore a single finger', () => {
      const onPinch = vi.fn()
      const scene = renderModule(onPinch)

      fireEvent.touchStart(scene, finger)
      fireEvent.touchMove(scene, finger)

      expect(onPinch).not.toHaveBeenCalled()
    })

    it('should measure the next pinch from where it starts, not where the last one ended', () => {
      const onPinch = vi.fn()
      const scene = renderModule(onPinch)

      fireEvent.touchStart(scene, fingers(100))
      fireEvent.touchMove(scene, fingers(200))
      fireEvent.touchEnd(scene, finger)

      onPinch.mockClear()

      fireEvent.touchStart(scene, fingers(50))
      fireEvent.touchMove(scene, fingers(60))

      expect(onPinch).toHaveBeenCalledTimes(1)
      expect(onPinch).toHaveBeenCalledWith(10)
    })

    it('should not pinch when no handler was given', () => {
      const scene = renderModule()

      expect(() => {
        fireEvent.touchStart(scene, fingers(100))
        fireEvent.touchMove(scene, fingers(160))
      }).not.toThrow()
    })
  })

  describe('render()', () => {
    it('should forward wheel events to the given handler', () => {
      const onWheel = vi.fn()
      const { container } = render(<Event onWheel={onWheel} />)

      fireEvent.wheel(container.firstElementChild as HTMLElement)

      expect(onWheel).toHaveBeenCalledTimes(1)
    })

    it('should ask the browser to leave the pinch gesture to the scene', () => {
      const scene = renderModule(vi.fn())

      fireEvent.touchStart(scene, fingers(100))

      const pinch = createEvent.touchMove(scene, fingers(160))
      const prevented = vi.spyOn(pinch, 'preventDefault')

      fireEvent(scene, pinch)

      expect(prevented).toHaveBeenCalled()
    })

    it('should leave a single finger to the browser, so the page still scrolls', () => {
      const scene = renderModule(vi.fn())

      fireEvent.touchStart(scene, finger)

      const move = createEvent.touchMove(scene, finger)
      const prevented = vi.spyOn(move, 'preventDefault')

      fireEvent(scene, move)

      expect(prevented).not.toHaveBeenCalled()
    })

    it('should render its children', () => {
      expect(renderModule().querySelector('.child')).not.toBeNull()
    })
  })
})
