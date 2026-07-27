import React from 'react'

interface Props {
  /** Whether or not the prompt is visible. */
  show?: boolean
  /** Number of arrows to render on each side of the label. */
  count?: number
}

/**
 * The prompt inviting the user to spin the camera around the scene.
 */
export default function SpinLabel({ show, count }: Props) {
  /** Builds a row of arrows pointing in the given direction. */
  const createArrowSet = (modifier: string, count: number) => {
    const base = 'spin__arrow'
    const arrows: React.ReactNode[] = []

    for (let i = 0; i < count; i++) {
      arrows.push(<span className={`${base} ${base}--${modifier}`} key={i}></span>)
    }

    return <div className={`${base}-container--${modifier}`}>{arrows}</div>
  }

  const modifier = show ? 'show' : 'hide'

  return (
    <div className={`spin-container spin-container--${modifier}`}>
      <div className="spin">
        {createArrowSet('left', count)}
        <div className="spin__label">Spin</div>
        {createArrowSet('right', count)}
      </div>
    </div>
  )
}
