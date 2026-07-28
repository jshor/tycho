import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { TailData } from '../../../types'

interface Props {
  /** The radius of the comet's nucleus, in km. */
  radius: number
  /** How this comet's tail is drawn. */
  settings: TailData
  /** The orbit the comet travels, which the tail trails back along. */
  pathVertices: THREE.Vector3[]
  /** How far around that orbit the comet currently is, from 0 to 1. */
  bodyPercent?: number
}

/** Below this the tail axis and the view line are the same, and the billboard has no solution. */
const DEGENERATE_VIEW = 1e-8

/** How many faces the cone of the tail is drawn with. */
const TAIL_SEGMENTS = 24

/** The far end of the tail is left open, so that it fades out rather than ending on a disc. */
const OPEN_ENDED = true

/**
 * Returns the magnitude of the comet's venting at the given distance from the sun [0, 1].
 */
export const getActivity = (distance: number, settings: TailData): number => {
  const proximity = 1 - Math.min(distance / settings.activeDistance, 1)

  return THREE.MathUtils.lerp(settings.restActivity, 1, proximity)
}

/**
 * Returns the direction the body is travelling along its orbit.
 */
export const getHeading = (
  pathVertices: THREE.Vector3[],
  bodyPercent: number,
  heading: THREE.Vector3
): THREE.Vector3 => {
  const total = pathVertices.length
  const travelled = Math.floor(bodyPercent * (total - 1))
  const from = Math.min(Math.max(travelled, 0), total - 2)

  return heading.subVectors(pathVertices[from + 1], pathVertices[from]).normalize()
}

const along = new THREE.Vector3()
const facing = new THREE.Vector3()
const across = new THREE.Vector3()
const basis = new THREE.Matrix4()

/**
 * Returns the comet plume's Y- axis value, or false when the camera looks straight down the tail.
 */
export const getPlumeOrientation = (
  axis: THREE.Vector3,
  worldPosition: THREE.Vector3,
  cameraPosition: THREE.Vector3,
  orientation: THREE.Quaternion
): boolean => {
  along.copy(axis).normalize()
  facing.subVectors(cameraPosition, worldPosition).normalize()
  across.crossVectors(along, facing)

  if (across.lengthSq() <= DEGENERATE_VIEW) {
    return false
  }

  across.normalize()
  facing.crossVectors(across, along)
  basis.makeBasis(across, along, facing)

  orientation.setFromRotationMatrix(basis)

  return true
}

const TAIL_VERTEX_SHADER = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vToCamera;

  void main() {
    vUv = uv;

    vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);

    // the cone is squashed along its axis as the tail grows, so the normal matrix is what keeps
    // the normals square to the surface
    vNormal = normalMatrix * normal;

    // the camera sits at the origin of view space, so this is the line back to it
    vToCamera = -viewPosition.xyz;

    gl_Position = projectionMatrix * viewPosition;
  }
`

/**
 * Value noise, so the tail can shimmer without an texture to sample.
 */
const NOISE = /* glsl */ `
  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);

    return mix(
      mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
      mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
      u.y
    );
  }
`

const TAIL_FRAGMENT_SHADER = /* glsl */ `
  uniform vec3 dustColor;
  uniform vec3 ionColor;
  uniform float activity;
  uniform float elapsed;

  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vToCamera;

  ${NOISE}

  void main() {
    // the cone is built apex-up and then turned to trail the comet, so v runs backwards
    float along = 1.0 - vUv.y;

    // the cone is a surface rather than a volume: it faces the camera head on through the middle
    // of the tail and turns away at the silhouette, which stands in for how much of the plume the
    // eye is looking through
    float facing = abs(dot(normalize(vNormal), normalize(vToCamera)));

    // the solar wind blows ionised gas straight back along the axis, while the heavier dust lags
    // into a broader fan around it
    float ion = pow(facing, 4.0);
    float dust = pow(facing, 1.2);

    // the material is streaming away from the nucleus, so the shimmer travels with it. the ring
    // coordinate wraps without a seam, unlike the u it is built from
    float angle = vUv.x * 6.28318;
    vec2 ring = vec2(cos(angle), sin(angle)) * 2.0;
    float streaks = noise(ring + vec2(along * 6.0 - elapsed * 0.6));

    float density = max(ion, dust * 0.55) * pow(1.0 - along, 1.4);

    gl_FragColor = vec4(mix(dustColor, ionColor, ion), density * activity * (0.65 + 0.35 * streaks));
  }
`

/**
 * The tail of the comet, trailing back along the orbit it is travelling.
 */
export function Comet({ radius, settings, pathVertices, bodyPercent }: Props) {
  const groupRef = useRef<THREE.Group>(null)
  const tailRef = useRef<THREE.Mesh>(null)

  const tailMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: TAIL_VERTEX_SHADER,
      fragmentShader: TAIL_FRAGMENT_SHADER,
      uniforms: {
        dustColor: { value: new THREE.Color(settings.dustColor) },
        ionColor: { value: new THREE.Color(settings.ionColor) },
        activity: { value: settings.restActivity },
        elapsed: { value: 0 }
      },
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide
    })
  }, [settings])

  const worldPosition = useMemo(() => new THREE.Vector3(), [])
  const parentQuaternion = useMemo(() => new THREE.Quaternion(), [])
  const orientation = useMemo(() => new THREE.Quaternion(), [])
  const trailing = useMemo(() => new THREE.Vector3(), [])

  useFrame(({ camera, clock }) => {
    const group = groupRef.current
    const tail = tailRef.current

    if (!group?.parent || !tail) return

    group.parent.updateWorldMatrix(true, false)
    group.getWorldPosition(worldPosition)

    const activity = getActivity(worldPosition.length(), settings)

    group.parent.getWorldQuaternion(parentQuaternion)

    getHeading(pathVertices, bodyPercent ?? 0, trailing)
      .applyQuaternion(parentQuaternion)
      .negate()

    if (getPlumeOrientation(trailing, worldPosition, camera.position, orientation)) {
      // the comet hangs under rotated orbital groups, so undo their turn to land on world axes
      group.quaternion.copy(parentQuaternion).invert().multiply(orientation)
    }

    // keep the tail pinned to its nucleus
    tail.scale.setY(activity)
    tail.position.setY((settings.length * activity) / 2)

    const elapsed = clock.getElapsedTime()

    tailMaterial.uniforms.activity.value = activity
    tailMaterial.uniforms.elapsed.value = elapsed
  })

  return (
    <group ref={groupRef} name="comet">
      <mesh
        ref={tailRef}
        material={tailMaterial}
        position={[0, settings.length / 2, 0]}
        rotation={[Math.PI, 0, 0]}
      >
        <coneGeometry args={[settings.width / 2, settings.length, TAIL_SEGMENTS, 1, OPEN_ENDED]} />
      </mesh>
    </group>
  )
}
