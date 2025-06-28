import { Hud, OrthographicCamera, shaderMaterial } from "@react-three/drei";
import { extend, useFrame } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import { Color } from "three";
import { MathUtils } from "three/src/math/MathUtils.js";

const ScreenTransitionMaterial = shaderMaterial(
  {
    uColor: new Color("pink"),
    uProgression: 1,
    uResolution: [0, 0],
  },
  /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }`,
  /* glsl */ `
  uniform vec3 uColor;
  varying vec2 vUv;
  uniform float uProgression;
  const float pi = 3.141592654;
  uniform vec2 uResolution;

  void main() {
    // Ensure full transparency when progression is at 1
    if (uProgression == 1.0) {
      discard;
    }

    vec2 uvs = vUv - 0.5;
    uvs.x *= uResolution.x / uResolution.y;
    float r = length(uvs * 0.92);
    float theta = atan(uvs.y, uvs.x);
    float spiral = fract(2.5 * theta / pi + 7.0 * pow(r, 0.4) - 4.5 * uProgression);
    float animatedProgression = smoothstep(0.25, 1.0, uProgression);
    float alphaSpiral = step(animatedProgression, spiral);
    float animatedProgressionCircle = smoothstep(0.25, 0.8, uProgression);
    float alphaCircle = step(animatedProgressionCircle, r);
    float alpha = max(alphaSpiral, alphaCircle);

    float animatedProgressionOut = smoothstep(0.5, 1.0, uProgression);
    float alphaCircleOut = step(animatedProgressionOut, r);
    alpha = min(alpha, alphaCircleOut);

    vec3 darkenColor = uColor * 0.2;
    vec3 finalColor = mix(uColor, darkenColor, smoothstep(0.42, 0.8, uProgression));

    gl_FragColor = vec4(finalColor, alpha);
    // #include <encodings_fragment>
  }`
);

extend({ ScreenTransitionMaterial });

export const ScreenTransition = ({ transition, color }) => {
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

    // Check if transition has actually started (i.e., when it's triggered to true)
    if (startedTransition) {
      transitionMaterial.current.uniforms.uProgression.value = MathUtils.lerp(
        transitionData.current.from,
        transitionData.current.to,
        (new Date() - transitionData.current.started) / (0.8 * 1000)
      );
    }
    transitionMaterial.current.uniforms.uResolution.value = [
      window.innerWidth,
      window.innerHeight,
    ];
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
