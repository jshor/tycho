import { PerspectiveCamera, Vector3 } from 'three'
import { Controls } from '../controls'

vi.unmock('three/examples/jsm/controls/OrbitControls.js')

describe('Controls touch gestures', () => {
  /** How far out the camera sits, so that there is an orbit to swing it around. */
  const RADIUS = 100

  let camera: PerspectiveCamera
  let canvas: HTMLCanvasElement
  let controls: Controls

  /**
   * Builds one of the pointer events the orbit controls listen for.
   */
  const finger = (type: string, id: number, x: number, y: number): MouseEvent => {
    const event = new MouseEvent(type, { bubbles: true })
    const properties = { pointerId: id, pointerType: 'touch', pageX: x, pageY: y }

    Object.entries(properties).forEach(([key, value]) => {
      Object.defineProperty(event, key, { value })
    })

    return event
  }

  /** The direction the camera watches the scene from, which moves only when it orbits. */
  const heading = (): Vector3 => camera.position.clone().normalize()

  beforeEach(() => {
    canvas = document.createElement('canvas')

    document.body.appendChild(canvas)

    Object.defineProperty(canvas, 'clientWidth', { value: 400 })
    Object.defineProperty(canvas, 'clientHeight', { value: 800 })

    canvas.setPointerCapture = vi.fn()
    canvas.releasePointerCapture = vi.fn()

    camera = new PerspectiveCamera()
    camera.position.set(0, 0, RADIUS)
    controls = new Controls(camera, canvas)
  })

  afterEach(() => {
    controls.dispose()
    canvas.remove()
  })

  it('should orbit the camera when one finger drags across the scene', () => {
    const before = heading()

    canvas.dispatchEvent(finger('pointerdown', 1, 100, 100))
    canvas.dispatchEvent(finger('pointermove', 1, 200, 160))

    expect(heading().angleTo(before)).toBeGreaterThan(0)
  })

  it('should leave the camera where it is when two fingers drag across the scene', () => {
    const before = heading()

    canvas.dispatchEvent(finger('pointerdown', 1, 100, 100))
    canvas.dispatchEvent(finger('pointerdown', 2, 200, 100))
    canvas.dispatchEvent(finger('pointermove', 1, 180, 180))
    canvas.dispatchEvent(finger('pointermove', 2, 280, 180))

    expect(heading().angleTo(before)).toEqual(0)
    expect(camera.position.length()).toEqual(RADIUS)
  })

  it('should leave the camera where it is when two fingers pinch', () => {
    const before = heading()

    canvas.dispatchEvent(finger('pointerdown', 1, 150, 100))
    canvas.dispatchEvent(finger('pointerdown', 2, 250, 100))
    canvas.dispatchEvent(finger('pointermove', 1, 50, 100))
    canvas.dispatchEvent(finger('pointermove', 2, 350, 100))

    expect(heading().angleTo(before)).toEqual(0)
    expect(camera.position.length()).toEqual(RADIUS)
  })

  it('should orbit from where the last finger is once the other one lifts', () => {
    canvas.dispatchEvent(finger('pointerdown', 1, 100, 100))
    canvas.dispatchEvent(finger('pointerdown', 2, 300, 100))
    canvas.dispatchEvent(finger('pointermove', 1, 140, 300))
    canvas.dispatchEvent(finger('pointermove', 2, 340, 300))
    canvas.dispatchEvent(finger('pointerup', 2, 340, 300))

    const resumed = heading()

    canvas.dispatchEvent(finger('pointermove', 1, 142, 302))

    expect(heading().angleTo(resumed)).toBeLessThan(0.05)
  })
})
