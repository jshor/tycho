uniform vec3 color;
uniform vec3 duskColor;
uniform float power;
uniform float intensity;
uniform float terminatorSoftness;

varying vec3 vWorldPosition;
varying vec3 vWorldNormal;

void main() {
  vec3 normal = normalize(vWorldNormal);
  vec3 viewDir = normalize(cameraPosition - vWorldPosition);

  // The sun sits at the true world origin (see sun.tsx and scene.tsx, which render it with no
  // position offset), so the direction from any point on the shell back to it is simply the
  // vector to the origin — no sun-position uniform needed, and this stays correct regardless of
  // how many rotated orbital groups this mesh is nested under, since vWorldPosition already
  // reflects the full model-matrix transform.
  vec3 sunDir = normalize(-vWorldPosition);

  // Fresnel/rim term: 0 looking straight down at the surface, 1 at a grazing angle. This stands
  // in for the much longer path sunlight (and the eye's view of it) travels through the
  // atmosphere near the limb than it does straight overhead — the reason a real atmosphere
  // glows brightest at the edge of the disc rather than uniformly across it.
  float viewDot = clamp(dot(normal, viewDir), 0.0, 1.0);
  float fresnel = pow(1.0 - viewDot, power);

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

  // Non-premultiplied additive blending (see WebGLState's blendFunc(SRC_ALPHA, ONE) for
  // AdditiveBlending) multiplies this alpha straight into the glow's brightness, so it does
  // double duty as both transparency and intensity.
  float alpha = fresnel * light * intensity;

  gl_FragColor = vec4(scatterColor, alpha);
}
