import React, { useRef, useEffect } from 'react'
import { Path, BufferGeometry } from 'three'

type EllipseProps = {
  geometry: Path
  /** Orbit line color, taken from the body's `atmosphere` (a hex color int). */
  color?: number
}

function Ellipse (props: EllipseProps) {
  const ref = useRef<BufferGeometry>(null)

  // Rebuild the line geometry whenever the path changes (e.g. when the planet
  // scale lifts a moon's orbit). `onUpdate` only fires on creation, so an
  // effect keyed on the path is needed to keep the drawn ellipse in sync.
  useEffect(() => {
    ref.current?.setFromPoints(props.geometry.getPoints(50))
  }, [props.geometry])

  return (
    <line>
      <bufferGeometry ref={ref} attach="geometry" />
      <lineBasicMaterial attach="material" color={props.color ?? 0xffffff} />
    </line>
  )
}

export default Ellipse
