import { fireEvent, screen } from '@testing-library/react'
import { renderWithStore } from '../../test/helpers'
import { useStore } from '../../store'
import { getLabelItems, Labels, placeLabels } from '../labels'
import { LabelPlacement, labelPlacements } from '../../utils/labels'
import { Constants } from '../../constants'
import { OrbitalData } from '../../types'

/** An orbital carrying only what the labels read of it. */
const orbital = (id: string, semimajor: number, satellites?: OrbitalData[]) =>
  ({ id, name: id.toUpperCase(), semimajor, satellites }) as OrbitalData

/** A label drawn on screen, at the given place, in the given order. */
const drawn = (order: number, left = 10, top = 20): LabelPlacement => ({
  visible: true,
  left,
  top,
  width: 60,
  height: 30,
  order
})

/** The frames requested of the browser, which are run one at a time rather than forever. */
const frames: FrameRequestCallback[] = []

/** Runs every frame requested so far. */
const runFrame = () => frames.splice(0).forEach((callback) => callback(0))

describe('Labels Module', () => {
  const orbitals = [
    orbital('mars', 2, [orbital('deimos', 2), orbital('phobos', 1)]),
    orbital('sun', 0)
  ]

  beforeEach(() => {
    frames.length = 0
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) =>
      frames.push(callback)
    )
    vi.stubGlobal('cancelAnimationFrame', vi.fn())
    labelPlacements.clear()
    useStore.setState({
      orbitalData: orbitals,
      focusedLabelId: undefined,
      highlightedId: undefined
    })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    document.body.innerHTML = ''
  })

  describe('getLabelItems()', () => {
    it('should order the orbitals outward from the sun, each followed by its satellites', () => {
      expect(getLabelItems(orbitals).map(({ id }) => id)).toEqual([
        'sun',
        'mars',
        'phobos',
        'deimos'
      ])
    })

    it('should name each item as its orbital is named', () => {
      expect(getLabelItems([orbital('sun', 0)])).toEqual([{ id: 'sun', name: 'SUN' }])
    })

    it('should list nothing before the orbitals arrive', () => {
      expect(getLabelItems()).toEqual([])
    })
  })

  describe('placeLabels()', () => {
    const elementsFor = (...ids: string[]) => {
      const elements = new Map(ids.map((id) => [id, document.createElement('li')]))

      elements.forEach((element) => {
        element.hidden = true
        document.body.appendChild(element)
      })
      return elements
    }

    it('should place each element over its label', () => {
      const elements = elementsFor('mars')

      placeLabels(elements, new Map([['mars', drawn(1, 12, 34)]]))

      const { style, hidden } = elements.get('mars') as HTMLElement

      expect(hidden).toBe(false)
      expect([style.left, style.top, style.width, style.height]).toEqual([
        '12px',
        '34px',
        '60px',
        '30px'
      ])
    })

    it('should stack the elements in the order their labels are drawn', () => {
      const elements = elementsFor('mars', 'sun', 'phobos')

      placeLabels(
        elements,
        new Map([
          ['mars', drawn(5)],
          ['sun', drawn(9)],
          ['phobos', drawn(1)]
        ])
      )

      expect(['phobos', 'mars', 'sun'].map((id) => elements.get(id)?.style.zIndex)).toEqual([
        '1',
        '2',
        '3'
      ])
    })

    it('should hide the elements of labels that are not drawn', () => {
      const elements = elementsFor('mars', 'sun')

      elements.get('mars').hidden = false
      placeLabels(elements, new Map([['mars', { ...drawn(1), visible: false }]]))

      expect(elements.get('mars')?.hidden).toBe(true)
      expect(elements.get('sun')?.hidden).toBe(true)
    })

    it('should hand the focus to the scene when the focused label goes from under it', () => {
      const scene = document.createElement('div')
      const elements = elementsFor('mars')
      const button = document.createElement('button')

      scene.id = Constants.UI.SCENE_ID
      scene.tabIndex = 0
      document.body.appendChild(scene)
      elements.get('mars').hidden = false
      elements.get('mars').appendChild(button)
      button.focus()

      placeLabels(elements, new Map())
      runFrame()

      expect(document.activeElement).toBe(scene)
    })
  })

  describe('render()', () => {
    it('should stand a named button in for every orbital, in the order the keyboard visits them', () => {
      renderWithStore(<Labels />)

      const nav = screen.getByRole('navigation', { name: 'Orbitals', hidden: true })
      const buttons = nav.querySelectorAll('button')

      expect([...buttons].map((button) => button.textContent)).toEqual([
        'SUN',
        'MARS',
        'PHOBOS',
        'DEIMOS'
      ])
    })

    it('should keep every button out of reach until its label is drawn', () => {
      const { container } = renderWithStore(<Labels />)

      container.querySelectorAll('li').forEach((item) => expect(item.hidden).toBe(true))
    })
  })

  describe('the label holding the focus', () => {
    const button = (id: string) =>
      document.querySelector(`[data-orbital-id="${id}"]`) as HTMLElement

    it('should be raised and highlighted, as a pointer resting on it would', () => {
      renderWithStore(<Labels />)

      fireEvent.focus(button('mars'))

      expect(useStore.getState().focusedLabelId).toEqual('mars')
      expect(useStore.getState().highlightedId).toEqual('mars')
    })

    it('should be lowered again once the focus leaves it', () => {
      renderWithStore(<Labels />)

      fireEvent.focus(button('mars'))
      fireEvent.blur(button('mars'))

      expect(useStore.getState().focusedLabelId).toBeUndefined()
      expect(useStore.getState().highlightedId).toBeUndefined()
    })

    it('should leave the next label raised when the focus moves straight on to it', () => {
      renderWithStore(<Labels />)

      fireEvent.focus(button('mars'))
      fireEvent.focus(button('sun'))
      fireEvent.blur(button('mars'))

      expect(useStore.getState().focusedLabelId).toEqual('sun')
    })

    it('should focus the camera on its orbital when pressed, handing the focus to its new target', () => {
      const target = document.createElement('button')

      target.id = Constants.UI.TARGET_LABEL_ID
      document.body.appendChild(target)
      renderWithStore(<Labels />)

      fireEvent.click(button('mars'))
      runFrame()

      expect(useStore.getState().targetId).toEqual('mars')
      expect(document.activeElement).toBe(target)
    })
  })
})
