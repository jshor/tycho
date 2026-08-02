// Confines the material's emissive term to the body's night side (i.e., where the sun don't shine).
//
// The sun sits at the world origin, so the view matrix's translation column is where the sun lands
// in view space, and adding the vector back to the eye gives the direction from this fragment to
// the sun. Sampling the un-perturbed normal keeps a bump or normal map from stippling the
// terminator with lit and unlit pixels.
#ifdef USE_EMISSIVEMAP
  vec3 sunDirection = normalize( viewMatrix[ 3 ].xyz + vViewPosition );
  float dayFactor = smoothstep( - 0.15, 0.25, dot( nonPerturbedNormal, sunDirection ) );
  totalEmissiveRadiance *= 1.0 - dayFactor;
#endif
