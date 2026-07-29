import { fireEvent, render, screen } from '@testing-library/react'
import { DatePicker } from './datePicker'

describe('DatePicker Component', () => {
  const uxTime = 'Jan 01, 2024 12:00:00 pm'
  const value = new Date('2024-01-01T12:00:00')

  const openCalendar = () => fireEvent.click(screen.getByRole('button', { name: uxTime }))

  it('should show the time it is given', () => {
    render(<DatePicker uxTime={uxTime} value={value} />)

    expect(screen.getByRole('button', { name: uxTime })).toBeInTheDocument()
  })

  it('should keep the calendar shut until the readout is clicked', () => {
    render(<DatePicker uxTime={uxTime} value={value} />)

    expect(document.querySelector('.react-datepicker')).not.toBeInTheDocument()

    openCalendar()

    expect(document.querySelector('.react-datepicker')).toBeInTheDocument()
  })

  it('should report the calendar opening and closing', () => {
    const onOpen = vi.fn()
    const onClose = vi.fn()

    render(<DatePicker uxTime={uxTime} value={value} onOpen={onOpen} onClose={onClose} />)
    openCalendar()

    expect(onOpen).toHaveBeenCalledTimes(1)
    expect(onClose).not.toHaveBeenCalled()

    fireEvent.keyDown(document.querySelector('.react-datepicker') as HTMLElement, {
      key: 'Escape'
    })

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('should report the date the user picked', () => {
    const onChange = vi.fn()

    render(<DatePicker uxTime={uxTime} value={value} onChange={onChange} />)
    openCalendar()
    fireEvent.click(screen.getByRole('gridcell', { name: /January 15th, 2024/ }))

    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange.mock.calls[0][0]).toBeInstanceOf(Date)
    expect(onChange.mock.calls[0][0].getDate()).toEqual(15)
  })

  it('should offer the year as a dropdown, rather than a month at a time to page through', () => {
    render(<DatePicker uxTime={uxTime} value={value} />)
    openCalendar()

    const years = screen.getByRole('combobox')

    expect(years).toHaveValue('2024')
    expect(screen.getByRole('option', { name: '1999' })).toBeInTheDocument()
  })

  it('should report the year the user picked', () => {
    const onChange = vi.fn()

    render(<DatePicker uxTime={uxTime} value={value} onChange={onChange} />)
    openCalendar()
    fireEvent.change(screen.getByRole('combobox'), { target: { value: '1999' } })
    fireEvent.click(screen.getByRole('gridcell', { name: /January 15th, 1999/ }))

    expect(onChange.mock.calls[0][0].getFullYear()).toEqual(1999)
  })

  it('should offer a time of day to pick alongside the date', () => {
    render(<DatePicker uxTime={uxTime} value={value} />)
    openCalendar()

    expect(document.querySelector('.react-datepicker__time-container')).toBeInTheDocument()
  })
})
