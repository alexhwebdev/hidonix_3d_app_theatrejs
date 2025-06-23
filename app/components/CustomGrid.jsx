"use client";
import React, { useRef, useEffect, useMemo, memo } from 'react';
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from 'three';




const CustomGrid = memo(({
  position = [0, -1.85, 0],
  cellSize = 1,
  cellThickness = 0.01,
  dotRadius = 0.005,
  fadeDistance = 30,
  planeSize = 50,
  sectionColor = [1, 1, 1],
  // sectionColor=[0, 0, 0],
  dotColor = [1.0, 0.2, 0.2], // default reddish
}) => {
  const materialRef = useRef();
  const { invalidate } = useThree();

useFrame((state) => {
  const mat = materialRef.current;
  if (!mat) return;
  const elapsed = state.clock.getElapsedTime();
  if (mat.uniforms.uTime.value !== elapsed) {
    mat.uniforms.uTime.value = elapsed;
    // 💥 Force change detection at WebGL level
    mat.uniforms.uTime.needsUpdate = true;
    mat.needsUpdate = true;

    // 💥 Direct low-level WebGL trigger
    mat.version++; // ← this is the key
  }
});


const uniforms = useMemo(() => ({
  uTime: { value: 0 },
  cellSize: { value: cellSize },
  cellThickness: { value: cellThickness },
  dotRadius: { value: dotRadius },
  sectionColor: { value: new THREE.Color(...sectionColor) },
  dotColor: { value: new THREE.Color(...dotColor) },
  fadeDistance: { value: fadeDistance },
  planeSize: { value: planeSize },
}), [cellSize, cellThickness, dotRadius, sectionColor, dotColor, fadeDistance, planeSize]);

  return (
    <mesh 
      rotation={[-Math.PI / 2, 0, 0]} 
      position={position}
      frustumCulled={false}      // ✅ Prevent auto-culling
      renderOrder={-1}           // ✅ Force render priority
    >
      
      <planeGeometry args={[planeSize, planeSize, 1, 1]} />
      
      <shaderMaterial
        // key="CustomGridShaderMaterial" // 👈 Force stable identity
        ref={materialRef}
        transparent
        depthWrite={false}         // ✅ Avoid z-fighting
        toneMapped={false}
        frustumCulled={false}

        uniforms={uniforms}

        vertexShader={/* glsl */`
          varying vec2 vUv;
          uniform float planeSize;

          void main() {
            vUv = uv * planeSize;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `}
        fragmentShader={/* glsl */`
          varying vec2 vUv;

          uniform float cellSize;
          uniform float cellThickness;
          uniform float dotRadius;
          uniform vec3 sectionColor;
          uniform vec3 dotColor;
          uniform float fadeDistance;
          uniform float planeSize;
          uniform float uTime;

          void main() {
            vec2 cellUV = fract(vUv / cellSize) - 0.5;

            // Grid lines
            float lineX = smoothstep(cellThickness, 0.0, abs(cellUV.x));
            float lineY = smoothstep(cellThickness, 0.0, abs(cellUV.y));
            float grid = max(lineX, lineY);

            // Pulsing radius via sine wave
            float pulse = 0.5 + 0.5 * sin(uTime * 4.0); // 4.0 = blink speed
            float pulsingRadius = dotRadius * mix(0.6, 1.5, pulse);

            // Dot at intersection
            float dot = 1.0 - smoothstep(pulsingRadius, pulsingRadius + 0.01, length(cellUV));

            // Mask grid where dot appears
            float maskedGrid = grid * (1.0 - dot);

            // Fade to horizon
            vec2 center = vec2(planeSize * 0.5);
            float dist = distance(vUv, center);
            float fade = smoothstep(fadeDistance * 0.6, fadeDistance, dist);
            float alpha = 1.0 - fade;

            // Final color mix
            vec3 color = mix(vec3(0.1), sectionColor, maskedGrid);
            color = mix(color, dotColor, dot);

            gl_FragColor = vec4(color * alpha, alpha);
            // gl_FragColor = vec4(vec3(sin(uTime * 2.0)), 1.0);
          }
        `}
      />
    </mesh>
  );
});

export default CustomGrid;
