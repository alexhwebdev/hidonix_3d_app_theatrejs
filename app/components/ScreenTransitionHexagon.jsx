"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { extend, useFrame } from "@react-three/fiber";
import { Hud, OrthographicCamera, shaderMaterial } from "@react-three/drei";
import { MathUtils } from "three/src/math/MathUtils.js";

// Hexagonal Transition Shader
const ScreenTransitionMaterial = shaderMaterial(
  {
    uColor: new THREE.Color("pink"),
    uProgression: 0.0, // Start with 0.0 (texture1 visible)
    uResolution: [0, 0],
    uTime: 0,
    uTexture1: null, // First texture for the transition
    uTexture2: null, // Second texture for the transition
  },
  /* GLSL vertex shader */
  `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }`,
  /* GLSL fragment shader */
  `
  uniform float uTime;
  uniform float uProgression;
  uniform vec2 uResolution;
  uniform sampler2D uTexture1;
  uniform sampler2D uTexture2;
  varying vec2 vUv;

  // Helper function to scale the UVs to maintain aspect ratio
  vec2 scaleUV(vec2 uv, vec2 scale) {
    return (uv - 0.5) * scale + 0.5;
  }

  // Function to compute hexagonal distance
  float hexDistance(vec2 uv) {
    vec2 s = vec2(1.0, 1.7320508); // Hexagon scaling factor (sqrt(3) for height)
    vec2 p = abs(uv);
    return max(dot(p, s * 0.5), p.x);
  }

  // Round function for hex coordinates
  vec4 sround(vec4 s) {
    return floor(s + 0.5);
  }

  // Function for computing hexagonal coordinates
  vec4 hexCoordinates(vec2 uv) {
    vec2 s = vec2(1.0, 1.7320508);
    vec4 hexCenter = sround(vec4(uv, uv - vec2(0.5, 1.0)) / vec4(s, s));
    vec4 offset = vec4(
      uv - hexCenter.xy * s,
      uv - (hexCenter.zw + vec2(0.5)) * s
    );
    float d1 = dot(offset.xy, offset.xy);
    float d2 = dot(offset.zw, offset.zw);
    vec4 final1 = vec4(offset.xy, hexCenter.xy);
    vec4 final2 = vec4(offset.zw, hexCenter.zw);
    return mix(final1, final2, step(0.0, d1 - d2));
  }

  void main() {
    // Adjust the UV to maintain aspect ratio of the window
    vec2 aspect = vec2(1.0, uResolution.y / uResolution.x);
    vec2 corUV = scaleUV(vUv, aspect);
    vec2 distUV = scaleUV(corUV, vec2(1.0 + length((vUv - 0.5))));

    // Calculate hexagonal UVs and coordinates
    vec2 hexUv = distUV * 5.0;
    vec4 hexCoords = hexCoordinates(hexUv);
    float hexDist = hexDistance(hexCoords.xy);

    // Transition effect based on hexagon distance
    float y = pow(max(0.0, 0.5 - hexDist), 10.0) * 1.5;
    float z = fract(sin(dot(hexCoords.zw, vec2(12.9898, 78.233))) * 43758.5453);
    float bounceTransition = 1.0 - smoothstep(0.0, 0.5, abs(uProgression - 0.5));

    // Hexagonal transition effect (blur + bounce)
    float hexRadius = mix(0.0, 0.6, uProgression);
    float hexFade = smoothstep(hexRadius - 0.05, hexRadius + 0.05, hexDist);
    float distortionAmount = hexFade;
    vec2 textureUV = corUV + y * sin(vUv.y * 15.0 - uTime) * distortionAmount * 0.025;

    // Sample textures based on progress
    vec4 sample1 = texture2D(uTexture1, textureUV);
    vec4 sample2 = texture2D(uTexture2, textureUV);

    // Blend the textures based on uProgression (transition factor)
    vec4 final = mix(sample1, sample2, uProgression);

    // Set final fragment color
    gl_FragColor = final;
  }`
);

extend({ ScreenTransitionMaterial });

export const ScreenTransitionHexagon = ({ transition, color, texture1, texture2 }) => {
  const transitionMaterial = useRef();
  const transitionData = useRef({
    from: 1,
    to: 0,
    started: 0,
  });
  const [startedTransition, setStartedTransition] = useState(false); // Track when transition is actually triggered

  useEffect(() => {
    if (transition) {
      // Trigger animation only when transition becomes true
      if (!startedTransition) {
        setStartedTransition(true); // Set transition as started
      }
      transitionData.current.from = 1;
      transitionData.current.to = 0;
    } else {
      transitionData.current.from = 0;
      transitionData.current.to = 1;
    }
    transitionData.current.started = new Date();
  }, [transition, startedTransition]);

  useFrame(() => {
    if (!transitionMaterial.current) return;

    // Ensure the transition is smooth and uses lerping for smooth progression
    if (startedTransition) {
      transitionMaterial.current.uniforms.uProgression.value = MathUtils.lerp(
        transitionData.current.from,
        transitionData.current.to,
        (new Date() - transitionData.current.started) / (0.8 * 1000)
      );
    }

    // Update the resolution of the screen (for correct scaling)
    transitionMaterial.current.uniforms.uResolution.value = [
      window.innerWidth,
      window.innerHeight,
    ];

    // Pass the texture references and time to the shader
    transitionMaterial.current.uniforms.uTime.value = performance.now() / 1000; // Time-based animation
    transitionMaterial.current.uniforms.uTexture1.value = texture1;
    transitionMaterial.current.uniforms.uTexture2.value = texture2;
  });

  return (
    <Hud>
      <OrthographicCamera
        makeDefault
        top={1}
        right={1}
        bottom={-1}
        left={-1}
        near={0}
        far={1}
      />
      <mesh>
        <planeGeometry args={[2, 2]} />
        <screenTransitionMaterial
          ref={transitionMaterial}
          transparent
          uColor={color}
        />
      </mesh>
    </Hud>
  );
};
