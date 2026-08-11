uniform float aspectRatio;
uniform vec2 sunPosition;
uniform float sunSize;
uniform float camAngle;
uniform float phase;
uniform vec3 tint;
uniform float brightness;
uniform float rayDetail;
uniform float coronaSpread;
uniform float coronaContrast;

varying vec2 vScreenPosition;

const float NO_DISTANCE = 1e-4;
const float DISC_INNER = 0.9;
const float DISC_OUTER = 1.1;
const float NO_CROWN = 1e-6;
const float RAY_DRIFT_A = 0.8;
const float RAY_DRIFT_B = 1.2;
const float CROWN_DRIFT = 0.9;
const float CROWN_OFFSET = 0.5;
const float CROWN_FLOOR = 0.1;
const float CROWN_SCALE = 0.7;
const float CROWN_CEILING = 0.8;
const float RAYS_CROWNED = 0.8;
const float RAYS_BED = 0.6;
const float RAY_VARIANCE = 0.1;
const float RAY_REACH = 0.1;
const float RAY_FLOOR = 0.6;

vec3 mod289(vec3 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 mod289(vec4 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 permute(vec4 x) {
  return mod289(((x * 34.0) + 1.0) * x);
}

vec4 taylorInvSqrt(vec4 r) {
  return 1.79284291400159 - 0.85373472095314 * r;
}

float snoise(vec3 v) {
  const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

  vec3 i = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;

  i = mod289(i);

  vec4 p = permute(permute(permute(
    i.z + vec4(0.0, i1.z, i2.z, 1.0))
    + i.y + vec4(0.0, i1.y, i2.y, 1.0))
    + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 0.142857142857; // 1.0/7.0
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z); // mod(p,7*7)
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_); // mod(j,N)
  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));

  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;

  vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);

  m = m * m;

  return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}

void main() {
  vec2 screen = vec2(vScreenPosition.x * aspectRatio, vScreenPosition.y);
  vec2 sun = vec2(sunPosition.x * aspectRatio, sunPosition.y);
  vec2 offset = screen - sun;
  float dist = max(length(offset), NO_DISTANCE);
  vec2 heading = offset / dist;
  float disc = 1.0 - smoothstep(sunSize * DISC_INNER, sunSize * DISC_OUTER, dist);
  float glow = sunSize * brightness / dist;
  float fieldA = snoise(vec3(heading, camAngle + phase * RAY_DRIFT_A));
  float fieldB = snoise(vec3(heading, camAngle - phase * RAY_DRIFT_B));
  float raysA = glow + glow * (sin(fieldA * rayDetail) * RAY_VARIANCE + dist * RAY_REACH + RAY_FLOOR);
  float raysB = glow + glow * (sin(fieldB * rayDetail) * RAY_VARIANCE + dist * RAY_REACH + RAY_FLOOR);
  vec2 crown = offset / (sunSize * coronaSpread)
    + snoise(vec3(heading, phase * CROWN_DRIFT)) * CROWN_OFFSET;
  float crownDist = length(crown);
  float corona = clamp(
    (1.0 / (crownDist * crownDist) - CROWN_FLOOR) * CROWN_SCALE, 0.0, CROWN_CEILING
  );
  float total =
    raysA * RAYS_CROWNED * pow(max(corona, NO_CROWN), coronaContrast) + raysB * RAYS_BED;
  vec3 color = (vec3(total) + disc) * tint;

  gl_FragColor = vec4(color, color.r);
}
