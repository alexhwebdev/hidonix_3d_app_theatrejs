"use client";

import React, { useEffect, useMemo } from 'react'
import { OrbitControls } from '@react-three/drei'
import { useLoader } from '@react-three/fiber'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader'
import * as THREE from 'three'
import CustomGrid from "./CustomGrid";

export default function StadiumTwo({ 
  position = [0, 0, 0],
  scale = [0.1, 0.1, 0.1]
}) {
  // Load Draco-compressed GLB using GLTFLoader with DRACOLoader
  const gltf = useLoader(GLTFLoader, '/models/vallourec_stadium_draco.glb', (loader) => {
    const dracoLoader = new DRACOLoader()
    dracoLoader.setDecoderPath('/draco/') // assumes draco files are in public/draco/
    loader.setDRACOLoader(dracoLoader)
  })

  const meshes = useMemo(() => {
    const found = []
    gltf.scene.traverse((child) => {
      if (child.isMesh) {
        found.push(child)
      }
    })
    return found
  }, [gltf])

  useEffect(() => {
    const box = new THREE.Box3().setFromObject(gltf.scene)
    const size = box.getSize(new THREE.Vector3())
    const center = box.getCenter(new THREE.Vector3())
    // Optional: console.log(size, center)
  }, [gltf])

  return (
    <>
      <OrbitControls />
      <ambientLight intensity={1} />

      <group position={position} scale={scale}>
        <mesh
          position={[0, 0, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <planeGeometry args={[50, 50]} />
          <meshBasicMaterial color="gray" />
        </mesh>

        {meshes.map((mesh, i) => (
          <mesh
            key={i}
            geometry={mesh.geometry}
            position={mesh.position}
            rotation={mesh.rotation}
            scale={mesh.scale}
          >
            <meshBasicMaterial
              wireframe
              color="blue"
              opacity={0.9}
              transparent
            />
          </mesh>
        ))}
      </group>
    </>
  )
}



// import React, { useEffect, useMemo } from 'react'
// import { useGLTF, OrbitControls } from '@react-three/drei'
// import * as THREE from 'three'

// export default function StadiumTwo({ position = [0, 0, 0] }) {
//   const { scene } = useGLTF('/models/vallourec_stadium.glb')

//   const meshes = useMemo(() => {
//     const found = []
//     scene.traverse((child) => {
//       if (
//         child.isMesh &&
//         ![
//           // "Object_4", 
//           // "Object_5", 
//           // "Object_6", 
//           // "Object_7", 
//           // "Object_8", 
//           // "Object_9", 
//           // "Object_10",
//           // "Object_11",
//         ].includes(child.name) // 👈 skip these
//       ) {
//         found.push(child)
//       }
//     })
//     return found
//   }, [scene])

  
//   // Debug bounding box
//   useEffect(() => {
//     const box = new THREE.Box3().setFromObject(scene)
//     const size = box.getSize(new THREE.Vector3())
//     const center = box.getCenter(new THREE.Vector3())
//   }, [scene])

//   return (
//     <>
//       <OrbitControls />
//       <ambientLight intensity={1} />
      
//       <group position={position} scale={[0.1, 0.1, 0.1]}>
//         <mesh
//           position={[0, -5, 0]}
//           rotation={[-Math.PI / 2, 0, 0]}
//         >
//           <planeGeometry args={[50, 50]} />
//           <meshBasicMaterial color="gray" />
//         </mesh>

//         {meshes.map((mesh, i) => (
//           <mesh
//             key={i}
//             geometry={mesh.geometry}
//             position={mesh.position}
//             rotation={mesh.rotation}
//             scale={mesh.scale}
//           >
//             <meshBasicMaterial
//               wireframe
//               color="blue"
//               opacity={0.9}
//               transparent
//             />
//           </mesh>
//         ))}
//       </group>
//     </>
//   )
// }

// useGLTF.preload('/models/vallourec_stadium_draco.glb')