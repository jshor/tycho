import { fireEvent } from '@testing-library/react'
import { renderWithStore } from '../../test/render'
import { EventContainer } from '../EventContainer'

const action = { setTouched: vi.fn() }

describe('Event Container', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const renderContainer = () => {
    const { container } = renderWithStore(
      <EventContainer action={action}>
        <div className="child" />
      </EventContainer>
    )

    return container.firstElementChild as HTMLElement
  }

  describe('onTouched()', () => {
    it('should call setTouched with the current timestamp when the scene is pressed', () => {
      const now = 12345
      vi.spyOn(Date, 'now').mockReturnValue(now)

      fireEvent.mouseDown(renderContainer())

      expect(action.setTouched).toHaveBeenCalledWith(now)
    })

    it('should call setTouched with the current timestamp when the scene is touched', () => {
      const now = 12345
      vi.spyOn(Date, 'now').mockReturnValue(now)

      fireEvent.touchStart(renderContainer())

      expect(action.setTouched).toHaveBeenCalledWith(now)
    })
  })

  describe('render()', () => {
    it('should forward wheel events to the given handler', () => {
      const onWheel = vi.fn()
      const { container } = renderWithStore(<EventContainer action={action} onWheel={onWheel} />)

      fireEvent.wheel(container.firstElementChild as HTMLElement)

      expect(onWheel).toHaveBeenCalledTimes(1)
    })

    it('should render its children', () => {
      expect(renderContainer().querySelector('.child')).not.toBeNull()
    })
  })
})
