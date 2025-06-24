"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
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
import ParticlesHoverPlane from "./components/ParticlesHoverPlane/ParticlesHoverPlane";
import ParticlesWavePlane from "./components/ParticlesWavePlane/ParticlesWavePlane";
import gsap from "gsap";
import './page.scss';
import { useControls } from "leva";
import * as THREE from "three";
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';

const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('/draco/');

const gltfLoader = new GLTFLoader();
gltfLoader.setDRACOLoader(dracoLoader);

const sceneOrder = ["Scene1", "Scene2", "Scene3"];

export default function App() {
  const initialCameraRef = useRef();
  const cameraOffsetGroupRef = useRef();
  const cameraControlTarget = useRef();
  const lookAtControlTarget = useRef();
  const targetSceneRef = useRef("Scene1");
  const scrollLock = useRef(false);
  const triggerRef = useRef(null);
  const particlesRef = useRef();

  const { cameraPosition, cameraTarget } = useControls("Camera", {
    cameraPosition: { value: { x: -7, y: 4, z: 6.5 }, step: 0.1 },
    cameraTarget: { value: { x: 0, y: 0.00057, z: 0 }, step: 0.1 },
  });

  useEffect(() => {
    let raf;

    function tryAnimateCamera() {
      const cam = initialCameraRef.current;
      if (!cam) {
        raf = requestAnimationFrame(tryAnimateCamera);
        return;
      }

      cam.position.set(12, 2, 7);

      gsap.to(cam.position, {
        ...cameraPosition,
        duration: 2,
        ease: "power2.inOut",
        onUpdate: () => invalidate(),
        onComplete: () => {
          TriggerUiChange();
          particlesRef.current?.resetMouse?.();
        }
      });
    }

    tryAnimateCamera();

    return () => cancelAnimationFrame(raf);
  }, []);

  function TriggerUiChange() {
    triggerRef.current?.(); // 🔁 this will re-render SceneUI
  }

  function CameraAnimator({ particlesRef }) {
    const { camera } = useThree();

    useFrame(() => {
      if (!camera || !cameraControlTarget.current || !lookAtControlTarget.current) return;

      camera.position.copy(cameraControlTarget.current.position);
      camera.lookAt(lookAtControlTarget.current.position);
    });

    return null;
  }

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const handleWheel = (e) => {
      if (scrollLock.current) return;
      const direction = e.deltaY > 0 ? 1 : -1;
      const currentIdx = sceneOrder.indexOf(targetSceneRef.current);
      const newIdx = Math.max(0, Math.min(sceneOrder.length - 1, currentIdx + direction));
      if (newIdx === currentIdx) return;

      const nextScene = sceneOrder[newIdx];
      targetSceneRef.current = nextScene;

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
      if (nextScene !== targetSceneRef.current) {
        targetSceneRef.current = nextScene;
        TriggerUiChange();
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {/* Scrollable page: 1 full-height div per scene */}
      <div style={{ height: "600vh", position: "absolute", top: 0, left: 0, width: "100%", zIndex: -5 }} />

      {/* <UI
        targetSceneRef={targetSceneRef} // read-only
        triggerRef={triggerRef}
      /> */}

      <Canvas
        style={{ position: "absolute", top: 0, left: 0, zIndex: 1 }}
        frameloop="always"
        shadows
        gl={{ preserveDrawingBuffer: true }}
      >
        <OrbitControls />
        {/* <OrbitControls autoRotate autoRotateSpeed={0.05} enableZoom={false} makeDefault minPolarAngle={Math.PI / 2} maxPolarAngle={Math.PI / 2} /> */}
        
        {/* <fog attach="fog" args={['black', 15, 22.5]} /> */}
        {/* <SoftShadows /> */}

        {/* <CameraMovement 
          cameraGroupRef={cameraOffsetGroupRef} 
          intensity={5.0} 
        /> */}

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

        {/* Draggable Camera Position Handle */}
        <TransformControls object={cameraControlTarget} mode="translate" />
        <mesh
          ref={cameraControlTarget}
          position={[cameraPosition.x, cameraPosition.y, cameraPosition.z]}
          visible={false}
        />

        {/* Draggable Camera Target Handle */}
        <TransformControls object={lookAtControlTarget} mode="translate" />
        <mesh
          ref={lookAtControlTarget}
          position={[cameraTarget.x, cameraTarget.y, cameraTarget.z]}
          visible={false}
        />

        <Experience />

        <CustomGrid
          position={[0, -1.85, 0]}
          cellSize={3.0}
          cellThickness={0.005}
          dotRadius={0.02}
          sectionColor={[1.0, 1.0, 1.0]}
          // sectionColor={[0.0, 0.0, 0.0]}
          // sectionColor={[0.5, 0.5, 0.5]}
          dotColor={[0.6, 0.1, 0.1]}
          fadeDistance={15}
          planeSize={50}
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

        <ParticlesHoverPlane
          // ref={particlesRef}
          width={50}
          height={50}
          segments={500}
          liftRadius={3}
          liftStrength={1.0}
          position={[0, -2, 0]}
          rotation={[-Math.PI / 2, 0, 0]} // rotate to lay flat
        />

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
