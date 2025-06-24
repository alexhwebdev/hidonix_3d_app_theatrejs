"use client";

import { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const cameraParallaxConfig = {
  // Scene1: { intensity: 1.2, damping: 0.04, limit: 1.5 }, // wide parallax
  // Scene2: { intensity: 0.5, damping: 0.03, limit: 0.7 }, // subtle hover
  // Scene3: { intensity: 0.0, damping: 0.0, limit: 0.0 },  // disable

  Scene1: { intensity: 1.5, damping: 0.05, limit: 1.5 },
  Scene2: { intensity: 0.4, damping: 0.03, limit: 0.4 },
  // Scene2: { enabled: false },
  Scene3: { intensity: 0.9, damping: 0.02, limit: 1.0 },
};

export default function CameraMovement({ 
  sceneNameRef,
  cameraGroupRef, 
  intensity = 0.4, 
  damping = 0.009,
  limit = 1.0 // max movement in any direction
}) {
  const mouse = useRef([0, 0])
  const targetPosition = useRef(new THREE.Vector3())
  const currentPosition = useRef(new THREE.Vector3())

  useEffect(() => {
    const handleMouseMove = (e) => {
      mouse.current = [
        // (e.clientX / window.innerWidth) * 2 - 1,
        // -(e.clientY / window.innerHeight) * 2 + 1,
        (e.clientX / window.innerWidth),
        -(e.clientY / window.innerHeight),
      ]
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  useFrame(({ camera }) => {
    const sceneName = sceneNameRef.current;
    const config = cameraParallaxConfig[sceneName] || {};
    // if (config.enabled === false) return;
    if (!cameraGroupRef.current || config.enabled === false) return;

    const intensity = config.intensity ?? 0.5;
    const damping = config.damping ?? 0.01;
    const limit = config.limit ?? 1.0;

    const [mx, my] = mouse.current;

    const offset = new THREE.Vector3(
      THREE.MathUtils.clamp(mx * intensity, -limit, limit),
      THREE.MathUtils.clamp(my * intensity, -limit, limit),
      0
    );

    // Align to camera space
    camera.updateMatrixWorld();
    const right = new THREE.Vector3();
    const up = new THREE.Vector3();
    camera.getWorldDirection(right);
    right.crossVectors(camera.up, right).normalize();
    up.copy(camera.up).normalize();

    const worldOffset = new THREE.Vector3()
      .copy(right).multiplyScalar(offset.x)
      .addScaledVector(up, offset.y);

    targetPosition.current.copy(worldOffset);
    currentPosition.current.lerp(targetPosition.current, damping);
    cameraGroupRef.current.position.copy(currentPosition.current);
  });


  return null
}
