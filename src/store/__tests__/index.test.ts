import useStore from '../'
import orbitalFixtures from './__fixtures__/orbitals.json'
import pageTextFixtures from './__fixtures__/pageText.json'

/** Stands in for the network, handing back the given JSON. */
const mockJsonFetch = (jsonData: object) => {
  return vi.fn().mockResolvedValue({ json: () => jsonData })
}

describe('Store', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('should start with no state set', () => {
    const { time, playing, orbitalData, targetId, activeModal } = useStore.getState()

    expect(time).toBeUndefined()
    expect(playing).toBeUndefined()
    expect(orbitalData).toBeUndefined()
    expect(targetId).toBeUndefined()
    expect(activeModal).toBeUndefined()
  })

  describe('requestOrbitalData()', () => {
    beforeEach(() => {
      vi.stubGlobal('fetch', mockJsonFetch(orbitalFixtures))
    })

    it('should request orbitals.json', async () => {
      await useStore.getState().requestOrbitalData()

      expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/static/data/orbitals.json'))
    })

    it('should store the orbital data it fetched', async () => {
      await useStore.getState().requestOrbitalData()

      expect(useStore.getState().orbitalData).toEqual(orbitalFixtures)
    })
  })

  describe('requestPageText()', () => {
    beforeEach(() => {
      vi.stubGlobal('fetch', mockJsonFetch(pageTextFixtures))
    })

    it('should request pageText.json', async () => {
      await useStore.getState().requestPageText()

      expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/static/data/pageText.json'))
    })

    it('should store the page text it fetched', async () => {
      await useStore.getState().requestPageText()

      expect(useStore.getState().pageText).toEqual(pageTextFixtures)
    })
  })

  describe('setActiveOrbital()', () => {
    it('should focus the camera on the given orbital', () => {
      useStore.getState().setActiveOrbital('earth', 'Earth')

      const { targetId, targetName } = useStore.getState()

      expect(targetId).toEqual('earth')
      expect(targetName).toEqual('Earth')
    })

    it('should animate its way to the orbital by default', () => {
      useStore.getState().setActiveOrbital('earth', 'Earth')

      expect(useStore.getState().animateTargetChange).toBe(true)
    })

    it('should snap to the orbital when told not to animate', () => {
      useStore.getState().setActiveOrbital('earth', 'Earth', false)

      expect(useStore.getState().animateTargetChange).toBe(false)
    })
  })

  describe('addHighlightedOrbital()', () => {
    it('should highlight the first orbital', () => {
      useStore.getState().addHighlightedOrbital('earth')

      expect(useStore.getState().highlightedOrbitals).toEqual(['earth'])
    })

    it('should keep the orbitals already highlighted', () => {
      useStore.setState({ highlightedOrbitals: ['earth'] })
      useStore.getState().addHighlightedOrbital('mars')

      expect(useStore.getState().highlightedOrbitals).toEqual(['earth', 'mars'])
    })
  })

  describe('removeHighlightedOrbital()', () => {
    it('should stop highlighting the given orbital', () => {
      useStore.setState({ highlightedOrbitals: ['earth', 'mars'] })
      useStore.getState().removeHighlightedOrbital('earth')

      expect(useStore.getState().highlightedOrbitals).toEqual(['mars'])
    })

    it('should do nothing when no orbital is highlighted', () => {
      useStore.getState().removeHighlightedOrbital('earth')

      expect(useStore.getState().highlightedOrbitals).toEqual([])
    })
  })

  describe('setPercentLoaded()', () => {
    it('should record the count as a percentage of the total', () => {
      useStore.getState().setPercentLoaded(1, 4)

      expect(useStore.getState().percent).toEqual(25)
    })

    it('should reach 100 once everything has loaded', () => {
      useStore.getState().setPercentLoaded(4, 4)

      expect(useStore.getState().percent).toEqual(100)
    })
  })

  describe('changeZoom() / changeSpeed() / changeScale()', () => {
    it('should apply a new zoom level', () => {
      useStore.getState().changeZoom(50)

      expect(useStore.getState().zoom).toEqual(50)
    })

    it('should apply a new simulation speed', () => {
      useStore.getState().changeSpeed(2)

      expect(useStore.getState().speed).toEqual(2)
    })

    it('should apply a new body scale', () => {
      useStore.getState().changeScale(3)

      expect(useStore.getState().scale).toEqual(3)
    })
  })
})
