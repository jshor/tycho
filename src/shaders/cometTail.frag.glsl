uniform vec3 dustColor;
uniform vec3 ionColor;
uniform float activity;
uniform float elapsed;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vToCamera;

// Value noise, so the tail can shimmer without a texture to sample.

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
