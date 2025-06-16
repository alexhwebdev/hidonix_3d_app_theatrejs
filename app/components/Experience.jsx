import { 
  Environment,
  Float
} from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { Autofocus, EffectComposer } from "@react-three/postprocessing";
import { editable as e } from "@theatre/r3f";
import { useRef, Suspense } from "react";
import { Vector3 } from "three";
import { isProd } from "../page";
// import { MedievalFantasyBook } from "./MedievalFantasyBook";
import Stadium from "./Stadium";
import StadiumTwo from "./StadiumTwo";
import Drone from "./Drone";



const CubeLoader = () => {
  return (
    <mesh>
      <boxGeometry />
      <meshNormalMaterial />
    </mesh>
  );
};


export const Experience = () => {
  const focusTargetRef = useRef(new Vector3(0, 0, 0));
  const focusTargetVisualizerRef = useRef();

  useFrame(() => {
    if (focusTargetVisualizerRef.current) {
      focusTargetRef.current.copy(focusTargetVisualizerRef.current.position);
    }
  });

  return (
    <>
      <Suspense fallback={<CubeLoader />}>
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


      <e.group 
        theatreKey={"Stadium"}
      >
        {/* <MedievalFantasyBook scale={0.1} envMapIntensity={0.3} /> */}
        <Stadium scale={0.1} envMapIntensity={0.3} />
      </e.group>

      {/* ⬇️ Only appears in Scene4 via Theatre.js scale animation */}
      <e.group 
        theatreKey="StadiumTwo" 
        position={[10, 0, 10]}
        scale={[0, 0, 0]}
      >
        <StadiumTwo scale={0.1} envMapIntensity={0.3} />

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
      </e.group>

      {/* <Environment 
        preset="dawn" 
        background 
        blur={4} 
      /> */}

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
      </Suspense>
    </>
  );
};
