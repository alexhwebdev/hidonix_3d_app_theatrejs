"use client";
import { useEffect, useReducer } from "react";
import gsap from 'gsap';
// import { useGSAP } from '@gsap/react';
// import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import './ui.scss'

export const UI = ({ targetSceneRef, triggerRef }) => {
  const [, forceUpdate] = useReducer(x => x + 1, 0);

  // Allow parent to trigger UI updates
  useEffect(() => {
    if (triggerRef) {
      triggerRef.current = () => forceUpdate();
    }
  }, [triggerRef]);

  const current = targetSceneRef.current;

  // Initial animation for the first section
  useEffect(() => {
    const tl = gsap.timeline();

    // ---------- Section One Animation ----------
    if (current === "Scene1") {
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
    if (current === "Scene2") {
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
    gsap.fromTo(
      ".section_three",
      { 
        opacity: 0, 
        top: current === "Scene3" ? "150px" : "0px" 
      },
      {
        delay: 0,
        opacity: current === "Scene3" ? 1 : 0,
        top: "0px",
        ease: "power1.out",
        duration: 0.7,
      }
    );
  }, [current]);



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
      <div className={`
        section_one__container
        ui__sections 
        ${current === "Scene1" ? "" : "ui__hidden"}`}
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
      </div>

      {/* ---------- Section Two ---------- */}
      <div className={`
        section_two__container
        ui__sections 
        ${current === "Scene2" ? "" : "ui__hidden"}`}
      >
        Section 2
      </div>


      <div className={`
        section_three
        ui__sections 
        ${current === "Scene3" ? "" : "ui__hidden"}`}
      >
        Section 3
      </div>
    </div>
  );
}