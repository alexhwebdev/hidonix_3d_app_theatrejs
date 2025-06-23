"use client";

import { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export default function CameraMovement({ 
  cameraGroupRef, 
  intensity = 0.4, 
  damping = 0.009,
  limit = 2.0 // max movement in any direction
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

  useFrame(() => {
    if (!cameraGroupRef.current) return

    const [mx, my] = mouse.current

    // Compute target position with intensity
    let tx = THREE.MathUtils.clamp(mx * intensity, -limit, limit)
    let ty = THREE.MathUtils.clamp(my * intensity, -limit, limit)

    targetPosition.current.set(tx, ty, 0)

    // Smooth interpolation
    currentPosition.current.lerp(targetPosition.current, damping)

    // Apply to camera group
    cameraGroupRef.current.position.copy(currentPosition.current)
  })

  return null
}
