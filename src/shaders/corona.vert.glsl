varying vec2 vScreenPosition;

void main() {
  vScreenPosition = position.xy;

  gl_Position = vec4(position.xy, 0.0, 1.0);
}
