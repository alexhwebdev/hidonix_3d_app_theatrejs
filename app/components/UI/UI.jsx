"use client";
import { useEffect, useReducer } from "react";
import gsap from 'gsap';
// import { useGSAP } from '@gsap/react';
// import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import './ui.scss'
import { motion } from "framer-motion";
import { atom, useAtom } from "jotai";
// export const transitionAtom = atom(true);
export const sceneGroupAtom = atom("SceneGroupOne");

// console.log("UI sceneGroupAtom:", sceneGroupAtom);

export const UI = ({ currentSceneRef, forceUiUpdateRef }) => {
  const [sceneGroup, setSceneGroup] = useAtom(sceneGroupAtom);
  const currentScene = currentSceneRef.current;
  // console.log("UI currentScene:", currentScene);
  // console.log("UI forceUiUpdateRef:", forceUiUpdateRef);

  // Allow parent to trigger UI updates
  const [, forceUpdate] = useReducer(x => x + 1, 0);
  useEffect(() => {
    if (forceUiUpdateRef) {
      forceUiUpdateRef.current = () => forceUpdate();
    }
  }, [forceUiUpdateRef]);

  useEffect(() => {
    // Map scene to screenAtom values
    if (currentScene === "Scene1" || currentScene === "Scene2" || currentScene === "Scene3") {
      setSceneGroup("SceneGroupOne");
    } else if (currentScene === "Scene4") {
      setSceneGroup("SceneGroupTwo");
    }
  }, [currentScene, setSceneGroup]);


  // Initial animation for the first section
  useEffect(() => {
    const tl = gsap.timeline();

    // ---------- Section One Animation ----------
    if (currentScene === "Scene1") {
      tl.fromTo(
        ".section_one__container",
        { opacity: 0 },
        {
          delay: 1,
          opacity: 1,
          ease: "power1.out",
          duration: 0.5,
        }
      )
      .fromTo(
        ".section_one__copy div span",
        {
          opacity: 0,
          y: "100%",
        },
        {
          opacity: 1,
          y: "0%",
          delay: 1,
          ease: "power2.out",
          stagger: 0.05,
          duration: 0.9,
        },
        // "<+=0.3" // Start animation 0.3 seconds after previous animation started.
      )
      .fromTo(
        ".section_one__copy p",
        {
          opacity: 0,
          x: "100px",
        },
        {
          opacity: 1,
          x: "0px",
          delay: 0,
          ease: "power2.out",
          duration: 0.5,
        },
        // "<+=0.0"
        // "<"
      );
    }
    
    // ---------- Section Two Animation ----------
    if (currentScene === "Scene2") {
      tl.fromTo(
        ".section_two__container",
        {
          opacity: 0,
          top: "150px"
        },
        {
          opacity: 1,
          top: "0px",
          ease: "power1.out",
          duration: 0.7,
        }
      )
      // Leaving Section One
      .to(
        ".section_one__container",
        { opacity: 0 },
      )
      .to(
        ".section_one__copy div span",
        {
          y: "-100%",
          opacity: 0,
          ease: "power2.in",
          stagger: 0.05,
          duration: 0.5,
        },
        // "<"  // Start this animation same time as previous one.
        "<-=0.7" // Start animation 0.3 seconds after previous animation started.
      )
      .to(
        ".section_one__copy p",
        {
          opacity: 0,
          x: "100px",
        },
      )
    }

    // ---------- Section Three Animation ----------
    if (currentScene === "Scene3") {
      tl.fromTo(
        ".section_three__container",
        {
          opacity: 0,
          top: "150px"
        },
        {
          opacity: 1,
          top: "0px",
          ease: "power1.out",
          duration: 0.7,
        }
      )
      // Leaving Section Two
      .to(
        ".section_two__container",
        { opacity: 0 },
        "<-=0.7"
      )

    }
  }, [currentScene]);


  // ---------- ParticlesCursor Example ----------
  // useEffect(() => {
  //   const pc = particlesCursor({
  //     el: document.getElementById('body'),
  //     gpgpuSize: 512,
  //     colors: [0x00ff00, 0x0000ff],
  //     color: 0xff0000,
  //     coordScale: 0.5,
  //     noiseIntensity: 0.001,
  //     noiseTimeCoef: 0.0001,
  //     pointSize: 5,
  //     pointDecay: 0.0025,
  //     sleepRadiusX: 250,
  //     sleepRadiusY: 250,
  //     sleepTimeCoefX: 0.001,
  //     sleepTimeCoefY: 0.002
  //   })

  //   document.body.addEventListener('click', () => {
  //     pc.uniforms.uColor.value.set(Math.random() * 0xffffff)
  //     pc.uniforms.uCoordScale.value = 0.001 + Math.random() * 2
  //     pc.uniforms.uNoiseIntensity.value = 0.0001 + Math.random() * 0.001
  //     pc.uniforms.uPointSize.value = 1 + Math.random() * 10
  //   })    
  // }, []);

  return (
    <div className="ui__container">
      
      {/* ---------- Section One ---------- */}
      <motion.section className={`
        section_one__container
        ui__sections 
        ${currentScene === "Scene1" ? "" : "ui__hidden"}`}
        animate={currentScene === "Scene1" ? "visible" : "hidden"}
      >
        <div className={`section_one__copy`}>
          <h1>
            <div><span>Vallourec</span></div>
            <div><span>rose</span></div>
            <div><span>to</span></div>
            <div><span>the</span></div>
            <div><span>challenge</span></div>
            <div><span>to</span></div>
            <div><span>speed</span></div>
            <div><span>up</span></div>
            <div><span>and</span></div>
            <div><span>simplify</span></div>
            <div><span>the</span></div>
            <div><span>construction</span></div>
            <div><span>of</span></div>
            <div><span>Brazil's</span></div>
            <div><span>foot-ball</span></div>
            <div><span>stadiums</span></div>
          </h1>
          <p>.</p>
        </div>
      </motion.section>

      {/* ---------- Section Two ---------- */}
      <motion.section className={`
        section_two__container
        ui__sections 

        `}
        animate={currentScene === "Scene2" ? "visible" : "hidden"}
      >
        <motion.h2
          variants={{
            visible: {
              opacity: 1,
              y: 0,
              transition: {
                delay: 1.5,
                duration: 0.7,
              },
            },
            hidden: {
              opacity: 0,
              y: 150,
              transition: {
                // delay: 1.5,
                duration: 0.7,
              },
            },
          }}
          initial={{
            opacity: 0,
            y: 150,
          }}
          className={``}
        >
          Section 2
        </motion.h2>
      </motion.section>


      {/* ---------- Section Three ---------- */}
      <motion.section className={`
        section_three__container
        ui__sections 

        `}
        animate={currentScene === "Scene3" ? "visible" : "hidden"}
      >
        <motion.h2
          variants={{
            visible: {
              opacity: 1,
              y: 0,
              transition: {
                delay: 1.5,
                duration: 0.7,
              },
            },
            hidden: {
              opacity: 0,
              y: 150,
              transition: {
                // delay: 1.5,
                duration: 0.7,
              },
            },
          }}
          initial={{
            opacity: 0,
            y: 150,
          }}
          className={``}
        >
          Section 3
        </motion.h2>
      </motion.section>

      {/* ---------- Section Four ---------- */}
      <motion.section className={`
        section_four__container
        ui__sections 

        `}
        animate={currentScene === "Scene4" ? "visible" : "hidden"}
      >
        <motion.h2
          variants={{
            visible: {
              opacity: 1,
              y: 0,
              transition: {
                delay: 1.5,
                duration: 0.7,
              },
            },
            hidden: {
              opacity: 0,
              y: 150,
              transition: {
                // delay: 1.5,
                duration: 0.7,
              },
            },
          }}
          initial={{
            opacity: 0,
            y: 150,
          }}
          className={``}
        >
          Section 4
        </motion.h2>
      </motion.section>
    </div>
  );
}