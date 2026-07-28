import { fireEvent, render } from '@testing-library/react'
import { Speed } from './speed'

describe('Speed Component', () => {
  it('should render without crashing', () => {
    const { container } = render(<Speed speed={0} onClick={vi.fn()} />)

    expect(container).toBeTruthy()
  })

  it('should show the speed as a power of ten', () => {
    const { container } = render(<Speed speed={4} />)

    expect(container.querySelector('.speed__button')?.textContent).toEqual('104')
    expect(container.querySelector('.speed__exponent')?.textContent).toEqual('4')
  })

  it('should show real time as the zeroth power', () => {
    const { container } = render(<Speed />)

    expect(container.querySelector('.speed__exponent')?.textContent).toEqual('0')
  })

  it('should step up the speed when clicked', () => {
    const onClick = vi.fn()
    const { container } = render(<Speed speed={1} onClick={onClick} />)

    fireEvent.click(container.querySelector('.speed'))

    expect(onClick).toHaveBeenCalledTimes(1)
  })
})
