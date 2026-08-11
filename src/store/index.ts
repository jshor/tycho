import { create } from 'zustand'
import { OrbitalData, PageText, Store } from '../types'
import { env } from '../utils/Environment'

export const useStore = create<Store>()((set, get) => ({
  /**
   * Fetches the orbital data.
   */
  requestOrbitalData: () => {
    return fetch(env('/static/data/orbitals.json'))
      .then((res) => res.json())
      .then((orbitalData: OrbitalData[]) => set({ orbitalData }))
  },

  /**
   * Fetches the translated page text.
   */
  requestPageText: () => {
    return fetch(env('/static/data/pageText.json'))
      .then((res) => res.json())
      .then((pageText: PageText) => set({ pageText }))
  },

  /**
   * Sets the active orbital target.
   */
  setActiveOrbitalId: (targetId: string, animateTargetChange = true) => {
    /**
     * Returns a target of the given system having the given name.
     */
    function getTargetByName(targetName: string, orbitals?: OrbitalData[]) {
      let target: OrbitalData | undefined

      orbitals?.forEach((orbital) => {
        if (!target) {
          if (orbital.id === targetName) {
            target = orbital
          } else if (orbital.satellites) {
            target = getTargetByName(targetName, orbital.satellites)
          }
        }
      })

      return target
    }

    const target = getTargetByName(targetId, get().orbitalData)

    set({
      target,
      targetId,
      targetName: target?.name,
      animateTargetChange,
      activeModal: null
    })
  },

  /**
   * Sets the ID of the orbital that is currently highlighted (i.e., hovered over).
   */
  setHighlightedId: (highlightedId) => set({ highlightedId }),

  /**
   * Sets the percentage of assets loaded, based on the count and total.
   */
  setPercentLoaded: (count, total) => set({ percent: (count / total) * 100 }),

  /**
   * Changes the zoom level.
   */
  changeZoom: (zoom) => set({ zoom })
}))
