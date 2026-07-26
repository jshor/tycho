import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Label from './Label'

const action = {
  setActiveOrbital: vi.fn(),
  addHighlightedOrbital: vi.fn(),
  removeHighlightedOrbital: vi.fn()
}

describe('Orbital Label Component', () => {
  beforeEach(() => vi.clearAllMocks())

  it('should render the label text', () => {
    render(<Label text="Earth" id="Earth" action={action} />)
    expect(screen.getByText('Earth')).toBeInTheDocument()
  })

  it('should hide a satellite label when its parent orbital is not focused', () => {
    render(
      <Label text="Moon" id="Moon" action={action} isSatellite parentId="Earth" targetId="Mars" />
    )
    expect(screen.queryByText('Moon')).not.toBeInTheDocument()
  })

  it('should show a satellite label when its parent orbital is focused', () => {
    render(
      <Label text="Moon" id="Moon" action={action} isSatellite parentId="Earth" targetId="Earth" />
    )
    expect(screen.getByText('Moon')).toBeInTheDocument()
  })

  it('should show a satellite label when the satellite itself is focused', () => {
    render(
      <Label text="Moon" id="Moon" action={action} isSatellite parentId="Earth" targetId="Moon" />
    )
    expect(screen.getByText('Moon')).toBeInTheDocument()
  })

  it('should always show a non-satellite (planet) label', () => {
    render(<Label text="Earth" id="Earth" action={action} targetId="Mars" />)
    expect(screen.getByText('Earth')).toBeInTheDocument()
  })

  it('should call setActiveOrbital on click', async () => {
    const user = userEvent.setup()
    render(<Label text="Earth" id="Earth" action={action} />)

    await user.click(screen.getByText('Earth'))

    expect(action.setActiveOrbital).toHaveBeenCalledWith('Earth', 'Earth')
  })

  it('should highlight the orbital on pointer over', async () => {
    const user = userEvent.setup()
    render(<Label text="Earth" id="Earth" action={action} />)

    await user.hover(screen.getByText('Earth'))

    expect(action.addHighlightedOrbital).toHaveBeenCalledWith('Earth')
  })

  it('should remove the highlight on pointer out', async () => {
    const user = userEvent.setup()
    render(<Label text="Earth" id="Earth" action={action} />)

    await user.unhover(screen.getByText('Earth'))

    expect(action.removeHighlightedOrbital).toHaveBeenCalledWith('Earth')
  })
})
