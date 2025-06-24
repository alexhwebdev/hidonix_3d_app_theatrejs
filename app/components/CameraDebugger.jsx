// components/CameraDebugger.jsx
"use client";

import { useControls } from "leva";
import { useEffect } from "react";
import * as THREE from "three";

export default function CameraDebugger({
  cameraPositions,
  cameraTargets,
  setCameraPositions,
  setCameraTargets,
  sceneOrder,
}) {
  const updatedPositions = {};
  const updatedTargets = {};

  sceneOrder.forEach((scene) => {
    const pos = useControls(`${scene} Position`, {
      x: { value: cameraPositions[scene].x, min: -20, max: 20, step: 0.1 },
      y: { value: cameraPositions[scene].y, min: -20, max: 20, step: 0.1 },
      z: { value: cameraPositions[scene].z, min: -20, max: 20, step: 0.1 },
    });

    const target = useControls(`${scene} Target`, {
      x: { value: cameraTargets[scene].x, min: -20, max: 20, step: 0.1 },
      y: { value: cameraTargets[scene].y, min: -20, max: 20, step: 0.1 },
      z: { value: cameraTargets[scene].z, min: -20, max: 20, step: 0.1 },
    });

    updatedPositions[scene] = pos;
    updatedTargets[scene] = target;
  });

  useEffect(() => {
    setCameraPositions((prev) => {
      const next = { ...prev };
      sceneOrder.forEach((scene) => {
        next[scene] = updatedPositions[scene];
      });
      return next;
    });
    setCameraTargets((prev) => {
      const next = { ...prev };
      sceneOrder.forEach((scene) => {
        next[scene] = updatedTargets[scene];
      });
      return next;
    });
  });

  return (
    <>
      {sceneOrder.map((scene, i) => (
        <mesh
          key={i}
          position={new THREE.Vector3(
            cameraTargets[scene].x,
            cameraTargets[scene].y,
            cameraTargets[scene].z
          )}
        >
          <sphereGeometry args={[0.1, 8, 8]} />
          <meshBasicMaterial color="red" />
        </mesh>
      ))}
    </>
  );
}
