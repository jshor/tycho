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
