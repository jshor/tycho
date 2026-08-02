// modelMatrix, viewMatrix, projectionMatrix and cameraPosition are all injected automatically by
// three.js into every ShaderMaterial — see three.module.js's WebGLProgram prefix generation —
// so only the values this shader actually needs beyond those are declared here.

varying vec3 vWorldPosition;
varying vec3 vWorldNormal;

void main() {
  vec4 worldPosition = modelMatrix * vec4(position, 1.0);
  vWorldPosition = worldPosition.xyz;

  // The shell is only ever uniformly scaled (see Scale() / getVisibleRadius()), so the model
  // matrix's rotation block can carry the normal into world space directly, without the
  // inverse-transpose correction non-uniform scaling would otherwise require.
  vWorldNormal = normalize(mat3(modelMatrix) * normal);

  gl_Position = projectionMatrix * viewMatrix * worldPosition;
}
