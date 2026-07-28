import { renderWithStore } from '../../test/render'
import UIControls from './uiControls'

describe('UIControls Component', () => {
  it('should render without crashing', () => {
    const { container } = renderWithStore(<UIControls />)

    expect(container).toBeTruthy()
  })

  it('should stack the speed button under the play/pause button', () => {
    const { container } = renderWithStore(<UIControls />)
    const datetime = container.querySelector('.uicontrols__control--datetime')

    expect(datetime?.querySelector('.uicontrols__row .play-pause')).not.toBeNull()
    expect(datetime?.lastElementChild?.className).toEqual('speed')
  })

  it('should no longer render the settings panel', () => {
    const { container } = renderWithStore(<UIControls />)

    expect(container.querySelector('.settings-panel')).toBeNull()
  })
})
