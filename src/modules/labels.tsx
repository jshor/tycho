import { useCallback, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { useStore } from '../store'
import { Constants } from '../constants'
import { LabelItem, Labels as LabelsView } from '../components/labels/labels'
import { LabelPlacement, labelElements, labelPlacements } from '../utils/labels'
import { focusById, recoverFocus } from '../utils/a11y'
import { OrbitalData } from '../types'

/**
 * Returns the orbitals in the order the keyboard visits their labels.
 */
export const getLabelItems = (orbitals: OrbitalData[] = []): LabelItem[] => {
  return [...orbitals]
    .sort((a, b) => a.semimajor - b.semimajor)
    .flatMap(({ id, name, satellites }) => [{ id, name }, ...getLabelItems(satellites)])
}

/**
 * Appends each element over the label representing it.
 */
export const placeLabels = (
  elements: Map<string, HTMLElement> = labelElements,
  placements: Map<string, LabelPlacement> = labelPlacements
): void => {
  const drawn = [...elements.keys()]
    .filter((id) => placements.get(id)?.visible)
    .sort((a, b) => placements.get(a).order - placements.get(b).order)

  elements.forEach((element, id) => {
    if (drawn.includes(id) || element.hidden) return

    if (element.contains(document.activeElement)) {
      // the label went from under the focus, which must not be left to drop out of the page
      ;(document.activeElement as HTMLElement).blur()
      recoverFocus()
    }

    element.hidden = true
  })

  drawn.forEach((id, rank) => {
    const { left, top, width, height } = placements.get(id)
    const element = elements.get(id)

    element.hidden = false
    element.style.left = `${left}px`
    element.style.top = `${top}px`
    element.style.width = `${width}px`
    element.style.height = `${height}px`
    element.style.zIndex = String(rank + 1)
  })
}

/**
 * List of focusable buttons for each orbital label in the scene.
 */
export function Labels() {
  const orbitalData = useStore((state) => state.orbitalData)
  const setActiveOrbitalId = useStore((state) => state.setActiveOrbitalId)
  const setHighlightedId = useStore((state) => state.setHighlightedId)
  const setFocusedLabelId = useStore((state) => state.setFocusedLabelId)
  const items = useMemo(() => getLabelItems(orbitalData), [orbitalData])

  /**
   * Caches the given label.
   */
  const itemRef = useCallback((id: string, element: HTMLLIElement | null) => {
    if (element) {
      labelElements.set(id, element)
    } else {
      labelElements.delete(id)
    }
  }, [])

  /**
   * Focuses the camera on the orbital.
   */
  const onActivate = (id: string) => {
    setActiveOrbitalId(id)
    focusById(Constants.UI.TARGET_LABEL_ID)
  }

  /**
   * Focuses the orbital having the given ID.
   */
  const onFocus = (id: string) => {
    setFocusedLabelId(id)
    setHighlightedId(id)
  }

  /**
   * Blurs the orbital having the given ID.
   */
  const onBlur = (id: string) => {
    if (useStore.getState().focusedLabelId !== id) return

    setFocusedLabelId(undefined)
    setHighlightedId(undefined)
  }

  return (
    <LabelsView
      items={items}
      itemRef={itemRef}
      onActivate={onActivate}
      onFocus={onFocus}
      onBlur={onBlur}
    />
  )
}

/** Maintains label order. It's in an element for reactivity only. */
export function LabelSync(): null {
  useFrame(() => placeLabels())

  return null
}
