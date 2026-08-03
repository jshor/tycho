uniform vec3 color;
uniform vec3 duskColor;
uniform float power;
uniform float intensity;
uniform float terminatorSoftness;
uniform float surfaceRadius;
uniform float shellRadius;
uniform float densityFalloff;

varying vec3 vViewPosition;
varying vec3 vViewCenter;
varying vec3 vWorldPosition;
varying vec3 vWorldNormal;

/** Below this the shell has no depth to speak of, and there is nothing to divide the sight by. */
const float NO_DEPTH = 1e-6;

/**
 * Returns how much air the line of sight to this point looks through, from 0 where it only skims
 * the top of the shell to 1 where it grazes the surface itself.
 */
float getDepthThroughAtmosphere() {
  // measured from the camera, which view space puts at the origin: every length here is a length
  // about this one body, rather than a difference between two distances out to the sun
  vec3 sight = normalize(vViewPosition);
  vec3 toCenter = vViewCenter;

  // how far along the sight line the body's centre lies, and how wide of it the line passes
  float closest = dot(toCenter, sight);
  float offset = dot(toCenter, toCenter) - closest * closest;

  float outer = shellRadius * shellRadius;
  float inner = surfaceRadius * surfaceRadius;

  // where the line of sight crosses into the shell and where it leaves again. A line that only
  // clips the edge of the shell crosses in and out at the same point, which is what carries the
  // glow to nothing exactly where the geometry ends, rather than cutting it off at its brightest
  float halfChord = sqrt(max(outer - offset, 0.0));
  float entry = max(closest - halfChord, 0.0);
  float exit = closest + halfChord;

  // the body itself stops the sight line, so the far half of the shell is behind it
  if (offset < inner) {
    exit = closest - sqrt(inner - offset);
  }

  // the longest a sight line can be is the one grazing the surface, so it is what the rest measure
  // against, leaving a length of [0, 1] however thick this body wears its atmosphere
  float deepest = 2.0 * sqrt(max(outer - inner, 0.0));
  float traversed = clamp(max(exit - entry, 0.0) / max(deepest, NO_DEPTH), 0.0, 1.0);

  // Air thins with height, so a sight line skimming the top of the shell passes through next to
  // nothing while one grazing the surface passes through the thick of it. Without this the shell
  // would be as dense at its outer edge as at the ground, and the glow would still be at most of
  // its brightness where the geometry runs out — a rim drawn around the body against the black.
  float altitude = max(sqrt(offset) - surfaceRadius, 0.0);
  float scaleHeight = max((shellRadius - surfaceRadius) / densityFalloff, NO_DEPTH);

  return traversed * exp(-altitude / scaleHeight);
}

void main() {
  vec3 normal = normalize(vWorldNormal);

  // The sun sits at the true world origin (see sun.tsx and scene.tsx, which render it with no
  // position offset), so the direction from any point on the shell back to it is simply the
  // vector to the origin — no sun-position uniform needed, and this stays correct regardless of
  // how many rotated orbital groups this mesh is nested under, since vWorldPosition already
  // reflects the full model-matrix transform.
  vec3 sunDir = normalize(-vWorldPosition);

  // Day/night term, softened across the terminator so a thin twilight glow persists slightly
  // onto the night side rather than cutting off sharply at the line of sunset.
  float sunDot = dot(normal, sunDir);
  float light = smoothstep(-terminatorSoftness, terminatorSoftness, sunDot);

  // Near the terminator, sunlight grazes through far more atmosphere before reaching the eye
  // than it does at local noon, and blue wavelengths scatter out of that longer path — the same
  // reason sunsets are orange. Blend towards the warm dusk colour in proportion to how close to
  // the terminator this point is (squared so the band stays tucked around the terminator rather
  // than bleeding deep into full daylight), gated by the day/night term so it never tints the
  // night side.
  float grazing = pow(clamp(1.0 - abs(sunDot), 0.0, 1.0), 2.0) * light;
  vec3 scatterColor = mix(color, duskColor, grazing);

  // The deeper the sight line runs through the air, the more of it scatters back, saturating the
  // way light through a thickening medium does rather than climbing without end.
  float scattered = 1.0 - exp(-getDepthThroughAtmosphere() * power);

  // Non-premultiplied additive blending (see WebGLState's blendFunc(SRC_ALPHA, ONE) for
  // AdditiveBlending) multiplies this alpha straight into the glow's brightness, so it does
  // double duty as both transparency and intensity.
  float alpha = scattered * light * intensity;

  gl_FragColor = vec4(scatterColor, alpha);
}
