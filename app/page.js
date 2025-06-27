"use client";

import { useEffect, useLayoutEffect, useReducer, useRef } from "react";
import * as THREE from "three";
import { Canvas, useThree, useFrame, invalidate } from "@react-three/fiber";
import { 
  Grid,
  OrbitControls, 
  PerspectiveCamera,
  SoftShadows,
  TransformControls
} from "@react-three/drei";
import { UI } from "./components/UI/UI";
import { Experience } from "./components/Experience";
import CameraMovement from "./components/CameraMovement";
import CustomGrid from "./components/CustomGrid";
import ParticlesWavePlane from "./components/ParticlesWavePlane/ParticlesWavePlane";
import gsap from "gsap";
import './page.scss';

import { useControls } from "leva";
import { levaStore } from 'leva';

import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';

import { atom, useAtom } from "jotai";
export const sceneGroupAtom = atom("SceneGroupOne");
export const sceneOne = atom("Scene1");
// export const sceneTwo = atom("Scene2");
// export const sceneThree = atom("Scene3");
// export const sceneFour = atom("Scene4");

const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('/draco/');

const gltfLoader = new GLTFLoader();
gltfLoader.setDRACOLoader(dracoLoader);

const sceneOrder = ["Scene1", "Scene2", "Scene3", "Scene4"];

const cameraPositions = {
  Scene1: { x: -7, y: 5, z: 6.5 },
  Scene2: { x: -1, y: 14.5, z: -5.05 },
  Scene3: { x: -4.579, y: 1.697, z: 2.177 },
  Scene4: { x: -7, y: 5, z: 6.5 },
};

const cameraTargets = {
  Scene1: { x: 0, y: -1, z: 0 },
  Scene2: { x: 0, y: 0, z: -5.043 },
  Scene3: { x: -2.034, y: 0.464, z: 0.550 },
  Scene4: { x:0, y: -1, z: 0 },
};

export default function App() {
  const initialCameraRef = useRef();
  const cameraOffsetGroupRef = useRef();
  const cameraControlTarget = useRef();
  const lookAtControlTarget = useRef();
  const currentSceneRef = useRef("Scene1");
  const scrollLock = useRef(false);
  const forceUiUpdateRef = useRef(null);
  const particlesRef = useRef();
  console.log("App currentSceneRef:", currentSceneRef);
  // console.log("App forceUiUpdateRef:", forceUiUpdateRef);

  const [sceneGroup, setSceneGroup] = useAtom(sceneGroupAtom);
  // useEffect(() => {
  //   console.log("App sceneOne:", sceneOne);
  //   // Map scene to screenAtom values
  //   if (sceneOne === "Scene1" || sceneOne === "Scene2" || sceneOne === "Scene3") {
  //     setSceneGroup("SceneGroupOne");
  //   } else if (sceneOne === "Scene4") {
  //     setSceneGroup("SceneGroupTwo");
  //   }
  // }, [sceneOne, setSceneGroup]);


  // ---------- COMMENT OUT WHEN DONE WITH PLOTTING X, Y, Z COORDINATES
  // const { cameraPosition, cameraTarget } = useControls("Camera", {
  //   // Scene1
  //   cameraPosition: { value: { x: -7, y: 4, z: 6.5 }, step: 0.1 },
  //   cameraTarget: { value: { x: 0, y: 0, z: 0 }, step: 0.1 },
  // });

  const initialCameraPosition = { x: -7, y: 5, z: 6.5 };
  // Inital page load animation
  useEffect(() => {
    let raf;

    function tryAnimateCamera() {
      const cam = initialCameraRef.current;
      if (!cam) {
        raf = requestAnimationFrame(tryAnimateCamera);
        return;
      }
      // Starting position, before Scene1
      cam.position.set(12, 2, 7);

      gsap.to(cam.position, {
        // ...cameraPosition,
        ...initialCameraPosition,
        duration: 2,
        ease: "power2.inOut",
        onUpdate: () => invalidate(),
        onComplete: () => {
          // cam.lookAt(
          //   initialCameraTarget.x,
          //   initialCameraTarget.y,
          //   initialCameraTarget.z
          // );
          TriggerUiChange();
          particlesRef.current?.resetMouse?.();
        }
      });
    }

    tryAnimateCamera();

    return () => cancelAnimationFrame(raf);
  }, []);

  function TriggerUiChange() {
    // console.log("TriggerUiChange called");
    // // console.log("SCROLL");
    // // console.log("sceneOne:", sceneOne);
    // if (sceneOne.init === "Scene1" || sceneOne.init === "Scene2" || sceneOne.init === "Scene3") {
    //   // console.log("HIT 1");
    //   setSceneGroup("SceneGroupOne");
    // } else if (sceneOne.init === "Scene4") {
    //   console.log("HIT 2");
    //   setSceneGroup("SceneGroupTwo");
    // }
    forceUiUpdateRef.current?.(); // 🔁 this will re-render SceneUI
  }

  function CameraAnimator({ particlesRef }) {
    // // ---------- COMMENT OUT WHEN DONE WITH PLOTTING X, Y, Z COORDINATES
    // const { camera } = useThree();
    // useFrame(() => {
    //   if (!camera || !cameraControlTarget.current || !lookAtControlTarget.current) return;
    //   camera.position.copy(cameraControlTarget.current.position);
    //   camera.lookAt(lookAtControlTarget.current.position);

    //   // const camPos = cameraControlTarget.current.position;
    //   const lookAtPos = lookAtControlTarget.current.position;

    //   // levaStore.setValueAtPath("Camera.cameraPosition", {
    //   //   x: camPos.x,
    //   //   y: camPos.y,
    //   //   z: camPos.z,
    //   // });

    //   levaStore.setValueAtPath("Camera.cameraTarget", {
    //     x: lookAtPos.x,
    //     y: lookAtPos.y,
    //     z: lookAtPos.z,
    //   });
    // });
    // return null;

    
    // ---------- UNCOMMENT WHEN DONE WITH PLOTTING X, Y, Z COORDINATES
    // ---------- Handle scene transitions ----------
    const { camera } = useThree();
    const activeScene = useRef(null);
    const lookAtTarget = useRef(new THREE.Vector3()); // store lookAt separately for animation

    // ⛳️ Always make camera look at the animated target
    useFrame(() => {
      camera.lookAt(lookAtTarget.current);
    });

    useFrame(() => {
      const target = currentSceneRef.current;
      if (!target || activeScene.current === target) return;
      activeScene.current = target;

      const camPos = cameraPositions[target];
      const camTarget = cameraTargets[target];
      if (!camPos || !camTarget) return;

      const fromTarget = lookAtTarget.current.clone();
      const toTarget = new THREE.Vector3(camTarget.x, camTarget.y, camTarget.z);

      // Animate camera position
      gsap.to(camera.position, {
        x: camPos.x,
        y: camPos.y,
        z: camPos.z,
        duration: 2,
        ease: "power2.inOut",
        onUpdate: () => invalidate(),
      });

      // Animate camera lookAt target
      gsap.to(fromTarget, {
        x: toTarget.x,
        y: toTarget.y,
        z: toTarget.z,
        duration: 2,
        ease: "power2.inOut",
        onUpdate: () => {
          camera.lookAt(fromTarget);
          invalidate();
        },
        onComplete: () => {
          lookAtTarget.current.copy(toTarget);
          particlesRef.current?.resetMouse();
          // TriggerUiChange();
        }
      });

      // Animate lookAt target
      gsap.to(lookAtTarget.current, {
        x: camTarget.x,
        y: camTarget.y,
        z: camTarget.z,
        duration: 2,
        ease: "power2.inOut",
        onUpdate: () => invalidate(),
        onComplete: () => {
          particlesRef.current?.resetMouse?.();
          // TriggerUiChange();
        },
      });
    });
    return null;
  }

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Scroll-based scene switching
  useEffect(() => {
    const handleWheel = (e) => {
      if (scrollLock.current) return;
      const direction = e.deltaY > 0 ? 1 : -1;
      const currentIdx = sceneOrder.indexOf(currentSceneRef.current);
      const newIdx = Math.max(0, Math.min(sceneOrder.length - 1, currentIdx + direction));
      if (newIdx === currentIdx) return;

      const nextScene = sceneOrder[newIdx];
      currentSceneRef.current = nextScene;

      scrollLock.current = true;
      window.scrollTo({
        top: newIdx * window.innerHeight,
        behavior: "smooth",
      });

      setTimeout(() => {
        scrollLock.current = false;
      }, 2000);
    };

    window.addEventListener("wheel", handleWheel, { passive: true });
    return () => window.removeEventListener("wheel", handleWheel);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const index = Math.round(window.scrollY / window.innerHeight);
      const nextScene = sceneOrder[Math.max(0, Math.min(sceneOrder.length - 1, index))];
      if (nextScene !== currentSceneRef.current) {
        currentSceneRef.current = nextScene;
        TriggerUiChange();
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  console.log("sceneGroup:", sceneGroup);

  return (
    <>
      {/* Scrollable page: 1 full-height div per scene */}
      <div style={{ height: "600vh", position: "absolute", top: 0, left: 0, width: "100%", zIndex: -5 }} />

      <UI
        currentSceneRef={currentSceneRef} // read-only
        forceUiUpdateRef={forceUiUpdateRef}
      />

      <Canvas
        style={{ position: "absolute", top: 0, left: 0, zIndex: 1 }}
        frameloop="always"
        shadows
        gl={{ preserveDrawingBuffer: true }}
      >
        <axesHelper args={[5]} />
        <OrbitControls />
        {/* <OrbitControls autoRotate autoRotateSpeed={0.05} enableZoom={false} makeDefault minPolarAngle={Math.PI / 2} maxPolarAngle={Math.PI / 2} /> */}
        
        {/* <fog attach="fog" args={['black', 15, 22.5]} /> */}
        {/* <SoftShadows /> */}

        <CameraMovement 
          cameraGroupRef={cameraOffsetGroupRef} 
          intensity={2.0} 
          sceneNameRef={currentSceneRef}
        />

        <group ref={cameraOffsetGroupRef}>
          <PerspectiveCamera 
            ref={initialCameraRef}
            makeDefault 
            fov={30} 
            far={2000} 
            near={1}
            zoom={1}
            position={[0, 10, 20]}
            // position={[20, 10, 30]} 
          />
        </group>

        <CameraAnimator particlesRef={particlesRef} />


        {/* Draggable Camera Position & Target */}
        {/* <TransformControls object={cameraControlTarget} mode="translate" />
        <mesh
          ref={cameraControlTarget}
          position={[cameraPosition.x, cameraPosition.y, cameraPosition.z]}
          visible={true}
        />
        <TransformControls object={lookAtControlTarget} mode="translate" />
        <mesh
          ref={lookAtControlTarget}
          position={[cameraTarget.x, cameraTarget.y, cameraTarget.z]}
          visible={true}
        /> */}


        <Experience 
          currentSceneRef={currentSceneRef} 
          forceUiUpdateRef={forceUiUpdateRef}
          sceneGroup={sceneGroup}
        />


        {/* <Grid 
          renderOrder={-1} 
          position={[0, -1.85, 0]} 
          infiniteGrid 
          cellSize={0.6} 
          cellThickness={0.6} 
          sectionSize={2.3} 
          sectionThickness={1.5} 
          // sectionColor={[0.5, 0.5, 10]} 
          sectionColor={[1, 1, 1]} // Dark red
          fadeDistance={30} 
        /> */}

        {/* <ParticlesWavePlane
          width={150}
          height={150}
          segments={500}
          amplitude={0.1}
          frequency={2.0}
          speed={1.5}
          position={[0, -2, 0]}
          rotation={[-Math.PI / 2, 0, 1]} // rotate to lay flat
        /> */}

        {/* <svg width="76" height="90" viewBox="0 0 76 90" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path className="cls-1" d="M32 89C32 87.4 11.3333 39 1 15L25.5 12L64.5 83" stroke="black"/>
          <path className="cls-1" d="M39.5 87.5L1.5 4.5L25.5 1L75 81" stroke="black"/>
          <path className="cls-1" d="M1.5 4.5V15.5L26 12V1L1.5 4.5Z" stroke="black"/>
        </svg> */}
      </Canvas>
    </>
  );
}
