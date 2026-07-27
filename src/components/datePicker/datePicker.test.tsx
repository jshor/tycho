import { render } from '@testing-library/react'
import DatePicker from './datePicker'

describe('DatePicker Component', () => {
  it('should render without crashing', () => {
    const { container } = render(<DatePicker onClick={vi.fn()} uxTime="2024-01-01" />)
    expect(container).toBeTruthy()
  })
})
