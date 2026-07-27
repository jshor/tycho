import { fireEvent, render } from '@testing-library/react'
import useStore from '../../store'
import Event from '../event'

describe('Event Module', () => {
  const renderModule = () => {
    const { container } = render(
      <Event>
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

  describe('render()', () => {
    it('should forward wheel events to the given handler', () => {
      const onWheel = vi.fn()
      const { container } = render(<Event onWheel={onWheel} />)

      fireEvent.wheel(container.firstElementChild as HTMLElement)

      expect(onWheel).toHaveBeenCalledTimes(1)
    })

    it('should render its children', () => {
      expect(renderModule().querySelector('.child')).not.toBeNull()
    })
  })
})
