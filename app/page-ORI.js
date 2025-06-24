"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import { Canvas, useThree, useFrame, invalidate } from "@react-three/fiber";
import { 
  Grid,
  OrbitControls, 
  PerspectiveCamera,
  SoftShadows 
} from "@react-three/drei";
import { UI } from "./components/UI/UI";
import { Experience } from "./components/Experience";

import CameraMovement from "./components/CameraMovement";
import CustomGrid from "./components/CustomGrid";
import ParticlesHoverPlane from "./components/ParticlesHoverPlane/ParticlesHoverPlane";
import ParticlesWavePlane from "./components/ParticlesWavePlane/ParticlesWavePlane";

import gsap from "gsap";
import './page.scss'

import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'

const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('/draco/');

const gltfLoader = new GLTFLoader();
gltfLoader.setDRACOLoader(dracoLoader);

const sceneOrder = ["Scene1", "Scene2", "Scene3"];
const cameraTargets = {
  Scene1: { x: 0, y: 5, z: 7 },
  Scene2: { x: 5, y: 8, z: 15 },
  Scene3: { x: -5, y: 6, z: 10 },
};



export default function App() {
  const cameraOffsetGroupRef = useRef()
  const targetSceneRef = useRef("Scene1");
  const scrollLock = useRef(false);
  const triggerRef = useRef(null);
  const particlesRef = useRef();

  function TriggerUiChange() {
    triggerRef.current?.(); // 🔁 this will re-render SceneUI
  }

  function CameraAnimator({ targetSceneRef, particlesRef }) {
    const { camera } = useThree();
    const activeScene = useRef(null);

    useFrame(() => {
      const target = targetSceneRef.current;
      if (!target || activeScene.current === target) return;

      activeScene.current = target;
      const targetPos = cameraTargets[target];
      if (!targetPos) return;

      gsap.to(camera.position, {
        ...targetPos,
        duration: 2,
        ease: "power2.inOut",
        onUpdate: () => invalidate(),
        onComplete: () => {
          TriggerUiChange()
          console.log("[CameraAnimator] triggering resetMouse()");
          particlesRef.current?.resetMouse();
        },
      });
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
      <div style={{ height: "600vh", position: "absolute", top: 0, left: 0, width: "100%", zIndex: -5 }} />

      <UI
        targetSceneRef={targetSceneRef} // read-only
        triggerRef={triggerRef}
      />

      <Canvas
        style={{ position: "absolute", top: 0, left: 0, zIndex: 1 }}
        frameloop="always"
        shadows
        gl={{ preserveDrawingBuffer: true }}
      >
        {/* <OrbitControls /> */}
        {/* <OrbitControls autoRotate autoRotateSpeed={0.05} enableZoom={false} makeDefault minPolarAngle={Math.PI / 2} maxPolarAngle={Math.PI / 2} /> */}
        
        <fog attach="fog" args={['black', 15, 22.5]} />
        {/* <SoftShadows /> */}

        {/* <CameraMovement cameraGroupRef={cameraOffsetGroupRef} intensity={0.4} /> */}

        <group ref={cameraOffsetGroupRef}>
          <PerspectiveCamera 
            makeDefault 
            fov={30} 
            near={1}
            position={[5, 5, 20]} 
          />
        </group>

        <CameraAnimator 
          targetSceneRef={targetSceneRef} 
          particlesRef={particlesRef}
        />
        <Experience />
        <CustomGrid
          position={[0, -1.85, 0]}
          cellSize={3.0}
          cellThickness={0.005}
          dotRadius={0.02}
          sectionColor={[0.5, 0.5, 0.5]}
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
          ref={particlesRef}
          width={50}
          height={50}
          segments={100}
          liftRadius={6}
          liftStrength={1}
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
