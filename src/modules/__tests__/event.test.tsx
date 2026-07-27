import { fireEvent, render } from '@testing-library/react'
import useStore from '../../store'
import Event from '../event'

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

  describe('onTouched()', () => {
    it('should record the timestamp when the scene is pressed', () => {
      const now = 12345
      vi.spyOn(Date, 'now').mockReturnValue(now)

      fireEvent.mouseDown(renderModule())

      expect(useStore.getState().touched).toEqual(now)
    })

    it('should record the timestamp when the scene is touched', () => {
      const now = 12345
      vi.spyOn(Date, 'now').mockReturnValue(now)

      fireEvent.touchStart(renderModule())

      expect(useStore.getState().touched).toEqual(now)
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

    it('should leave the pinch gesture to the scene rather than the browser', () => {
      expect(renderModule().style.touchAction).toEqual('none')
    })

    it('should render its children', () => {
      expect(renderModule().querySelector('.child')).not.toBeNull()
    })
  })
})
