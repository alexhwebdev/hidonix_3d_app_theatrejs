"use client";

import { 
  CameraControls,
  Environment,
  Float,
  Html,
  OrbitControls,
  PerspectiveCamera,
  useFBO,
  useGLTF,
} from "@react-three/drei";
import { useThree, useFrame, useLoader } from "@react-three/fiber";
import { Autofocus, EffectComposer } from "@react-three/postprocessing";
// import { editable as e } from "@theatre/r3f";
import { useEffect, useRef, useState, Suspense } from "react";
import { MathUtils, Vector3 } from "three";
import { DEG2RAD } from "three/src/math/MathUtils";
import { isProd } from "../page";
// import { MedievalFantasyBook } from "./MedievalFantasyBook";

import CustomGrid from "./CustomGrid";
import { useAtom } from "jotai";
import { sceneGroupAtom } from "./UI/UI";

import Stadium from "./Stadium";
import StadiumTwo from "./StadiumTwo";
import Drone from "./Drone";
import ParticlePathAnimation from "./ParticlePathAnimation/ParticlePathAnimation";
import ParticlesHoverPlane from "./ParticlesHoverPlane/ParticlesHoverPlane";
// import { FirstScene } from "./FirstScene/FirstScene";
// import { SecondScene } from "./SecondScene/SecondScene";
// import { ThirdScene } from "./ThirdScene/ThirdScene";




export const Experience = ({sceneGroup}) => {
  // const [sceneGroup, setSceneGroup] = useAtom(sceneGroupAtom);
  // console.log("Experience sceneGroup:", sceneGroup);
  console.log("Experience sceneGroup:", sceneGroup);

  // NOT SURE IF THIS IS NEEDED WITH sceneGroup
  const focusTargetRef = useRef(new Vector3(0, 0, 0));
  const focusTargetVisualizerRef = useRef();
  useFrame(() => {
    if (focusTargetVisualizerRef.current) {
      focusTargetRef.current.copy(focusTargetVisualizerRef.current.position);
    }
  });

  const viewport = useThree((state) => state.viewport);
  const firstScene = useRef();
  const secondScene = useRef();
  const thirdScene = useRef();

  const renderTarget1 = useFBO();
  const renderTarget2 = useFBO();
  const renderMaterial = useRef();
  const [mode, setMode] = useState(0);
  const [prevMode, setPrevMode] = useState(0);

  const { scene: modernStadiumScene } = useGLTF("/models/vallourec_stadium_draco.glb");

  const renderCamera = useRef();
  const controls = useRef();

  const progressionRef = useRef(0); // 0 to 1
  const scrollSpeed = 0.5;

  // Listen to scroll and update progression
  useEffect(() => {
    const handleScroll = (e) => {
      progressionRef.current += e.deltaY * 0.001 * scrollSpeed;
      progressionRef.current = MathUtils.clamp(progressionRef.current, 0, 1);
    };
    window.addEventListener("wheel", handleScroll);
    return () => window.removeEventListener("wheel", handleScroll);
  }, []);

  useEffect(() => {
    controls.current.camera = renderCamera.current;
    controls.current.setLookAt(
      // Camera position
      -7,
      5,
      6.5,
      // Target position
      0,
      -1,
      0
    );
  }, []);

  useFrame(({ gl, scene }, delta) => {
    renderMaterial.current.progression = progressionRef.current;

    // Frame 1: draw scene 1
    firstScene.current.visible = true;
    secondScene.current.visible = false;
    gl.setRenderTarget(renderTarget1);
    gl.render(scene, renderCamera.current);

    // Frame 2: draw scene 2
    secondScene.current.visible = true;
    firstScene.current.visible = false;
    gl.setRenderTarget(renderTarget2);
    gl.render(scene, renderCamera.current);

    // Show result, Reset everything
    secondScene.current.visible = false;
    gl.setRenderTarget(null);
  });

  return (
    <>
      <PerspectiveCamera near={0.5} ref={renderCamera} />
      <CameraControls
        enablePan={false}
        minPolarAngle={DEG2RAD * 70}
        maxPolarAngle={DEG2RAD * 85}
        minAzimuthAngle={DEG2RAD * -30}
        maxAzimuthAngle={DEG2RAD * 30}
        minDistance={5}
        maxDistance={9}
        ref={controls}

        // Disables zoom on scroll
        dollyToCursor={false}
        enabled={true}
        mouseButtons={{
          left: 0,  // pan
          middle: 0, // disabled
          right: 0,  // rotate
          wheel: 0,  // disable wheel
        }}
        touches={{
          one: 0,
          two: 0
        }}
      />
      {/* <e.directionalLight
        theatreKey="SunLight"
        position={[3, 3, 3]}
        intensity={0.2}
        castShadow
        shadow-bias={-0.001}
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      /> */}

      {/* <ambientLight intensity={10.9} /> */}



      <mesh>
        <planeGeometry args={[viewport.width, viewport.height]} />
        {/* <transitionMaterial
          ref={renderMaterial}
          tex1={renderTarget1.texture}
          tex2={renderTarget2.texture}
          toneMapped={false}
          transition={0} // 0 = horizontal, 1 = vertical
        /> */}
        <teleportationMaterial
          ref={renderMaterial}
          tex1={renderTarget1.texture}
          tex2={renderTarget2.texture}
          toneMapped={false}
          transition={0} // 0 = horizontal, 1 = vertical
        />
      </mesh>


      <group 
        // theatreKey={"Stadium"}
        position={[0, 0, 0]}
        rotation={[0, 0, 0]}
        scale={[1.0, 1.0, 1.0]}

        ref={firstScene}
        visible={sceneGroup === "SceneGroupOne"}
      >
        <Environment 
          preset="city" 
          // background 
          blur={4} 
        />
        <Stadium scale={0.2} envMapIntensity={1.0} />
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
        {/* <CustomGrid
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
        /> */}

        {/* <group 
          position={[-0.5, 0.5, 0.65]}
          rotation={[1.7, 0, 2.6]}
          scale={[0.2, 0.2, 0.2]}
        >
          <ParticlePathAnimation 
            // position={[-1.39, 1.2, 0]} 
          />
        </group> */}
      </group>


      <group 
        // theatreKey="StadiumTwo" 
        position={[0, 0, 0]}
        scale={[1.0, 1.0, 1.0]}

        ref={secondScene}
        visible={sceneGroup === "SceneGroupTwo"}
      >
        <StadiumTwo scale={0.2} envMapIntensity={0.3} />
        {/* <ParticlesHoverPlane
          // ref={particlesRef}
          width={50}
          height={50}
          segments={500}
          liftRadius={3}
          liftStrength={1.0}
          position={[0, -2, 0]}
          rotation={[-Math.PI / 2, 0, 0]} // rotate to lay flat
        /> */}

        {/* <Float
          speed={1}
          rotationIntensity={2}
          floatIntensity={0.2}
          floatingRange={[1, 1]}
        > */}
          <Drone 
            position={[0.2, -1.5, 0]}
            rotation={[5, 5, 5]}
            scale={[0, 0, 0]}
          />
        {/* </Float> */}
      </group>


      {/* <e.mesh
        theatreKey="FocusTarget"
        ref={focusTargetVisualizerRef}
        visible="editor"
      >
        <sphereGeometry args={[0.01, 8, 8]} />
        <meshBasicMaterial color="red" wireframe />
      </e.mesh> */}

      {/* <EffectComposer>
        <Autofocus
          target={focusTargetRef.current}
          smoothTime={0.1}
          // debug={0.04}
          debug={isProd ? undefined : 0.04}
          focusRange={0.002}
          bokehScale={8}
        />
      </EffectComposer> */}

    </>
  );
};