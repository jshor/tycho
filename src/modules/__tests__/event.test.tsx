import { fireEvent } from '@testing-library/react'
import { renderWithStore } from '../../test/render'
import { Event } from '../event'

const action = { setTouched: vi.fn() }

describe('Event Module', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const renderModule = () => {
    const { container } = renderWithStore(
      <Event action={action}>
        <div className="child" />
      </Event>
    )

    return container.firstElementChild as HTMLElement
  }

  describe('onTouched()', () => {
    it('should call setTouched with the current timestamp when the scene is pressed', () => {
      const now = 12345
      vi.spyOn(Date, 'now').mockReturnValue(now)

      fireEvent.mouseDown(renderModule())

      expect(action.setTouched).toHaveBeenCalledWith(now)
    })

    it('should call setTouched with the current timestamp when the scene is touched', () => {
      const now = 12345
      vi.spyOn(Date, 'now').mockReturnValue(now)

      fireEvent.touchStart(renderModule())

      expect(action.setTouched).toHaveBeenCalledWith(now)
    })
  })

  describe('render()', () => {
    it('should forward wheel events to the given handler', () => {
      const onWheel = vi.fn()
      const { container } = renderWithStore(<Event action={action} onWheel={onWheel} />)

      fireEvent.wheel(container.firstElementChild as HTMLElement)

      expect(onWheel).toHaveBeenCalledTimes(1)
    })

    it('should render its children', () => {
      expect(renderModule().querySelector('.child')).not.toBeNull()
    })
  })
})
