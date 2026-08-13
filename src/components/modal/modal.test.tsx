import React from 'react'
import { render } from '@testing-library/react'
import { Modal } from './modal'

describe('Modal Component', () => {
  it('should render without crashing', () => {
    const { container } = render(<Modal modalActive={false} title="Test" closeModal={vi.fn()} />)
    expect(container).toBeTruthy()
  })

  it('should hand out a handle on the panel, for the room it takes up to be measured', () => {
    const ref = React.createRef<HTMLDivElement>()
    const { container } = render(<Modal modalActive title="Test" closeModal={vi.fn()} ref={ref} />)

    expect(ref.current).toBe(container.querySelector('.modal'))
  })
})
