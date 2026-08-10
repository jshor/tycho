// modelViewMatrix, normalMatrix, projectionMatrix and viewMatrix are all injected automatically by
// three.js into every ShaderMaterial — see three.module.js's WebGLProgram prefix generation — so
// only the values this shader actually needs beyond those are declared here.

varying vec3 vViewPosition;
varying vec3 vViewCenter;
varying vec3 vViewNormal;

void main() {
  // The shell is placed against the camera rather than against the world origin, because three
  // folds the two together into modelViewMatrix on the CPU, where it has the precision to spare.
  // Reaching the same place the long way about — viewMatrix * modelMatrix * position — asks a
  // float32 to hold a body's whole distance from the sun and then take almost all of it back off
  // again, which at Neptune's remove throws the answer out by a few hundred km. That is enough for
  // the shell to land somewhere the body's own mesh (drawn by three, the short way) did not expect,
  // and for the surface to break through the air around it.
  vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);

  vViewPosition = viewPosition.xyz;

  // where the body this shell is wrapped around sits, which the sight line is measured against
  vViewCenter = (modelViewMatrix * vec4(0.0, 0.0, 0.0, 1.0)).xyz;

  // matrix carries the normal into view space without the inverse-transpose correction that
  // non-uniform scaling would otherwise require.
  vViewNormal = normalize(normalMatrix * normal);

  gl_Position = projectionMatrix * viewPosition;
}
