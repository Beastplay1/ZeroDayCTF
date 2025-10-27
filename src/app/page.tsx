"use client";
import React, { useEffect, useRef, useState } from "react";
import { Orbitron, Bungee, Roboto_Mono } from "next/font/google";
import Typewriter from "@/components/Typewriter";
import MatrixRainSingle from "@/components/Matrix/MatrixRainSingle";
import MatrixRainTriangle from "@/components/Matrix/MatrixRainTriangle";
import "@/components/Matrix/matrix.css";
import Image from "next/image";
import flag from "../../public/home_page/flag.png";

const orbitron = Orbitron({ subsets: ["latin"] });
const bungee = Bungee({ weight: "400", subsets: ["latin"] });
const roboto = Roboto_Mono({ subsets: ["latin"] });

export default function Home() {
  return (
    <>
      {/* Hero Section */}
      <div className="flex justify-center items-center ml-[-200px] sm:ml-[-220px] md:ml-[-220px] lg:ml-[-320px] max-sm:mb-[-50]">
        <span
          className="welcome-text text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold"
          style={{
            WebkitTextStroke: "4px transparent",
            WebkitTextFillColor: "#eaeaeaff",
            backgroundImage: "linear-gradient(315deg, #03a9f4, #ff0058)",
            backgroundSize: "200% auto",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            paintOrder: "stroke fill",
            textShadow: "0px 4px 4px rgba(0, 0, 0, 0.25)",
          }}
        >
          Welcome to
        </span>
      </div>
      <div
        className="max-sm:scale-70 max-sm:flex max-sm:flex-col max-sm:items-center max-sm:gap-6 max-sm:ml-[-60px] 
 container relative sm:mt-20 max-sm:ml-[-100px] xl:ml-[-130px] 2xl:ml-0
    sm:flex sm:flex-col sm:items-center sm:gap-8 sm:ml-[-120px]
    xl:flex-none xl:block"
      >
        <div className="matrix">
          <div className="text-container">
            <span className="select-none text-4xl text-[#919098] font-bold">
              {" "}
              Learn.{" "}
            </span>
            <span className="select-none text-4xl text-red-400 animate-pulse font-bold">
              Hack.
            </span>
            <br />
            <Typewriter
              text="3XPL0IT."
              className={`select-none text-2xl text-zerogreen font-bold ${orbitron.className}`}
              typingSpeed={150}
              deletingSpeed={150}
              pauseDuration={2000}
              loop={true}
              showCursor={true}
              cursorClassName="border-r-2 border-zerogreen animate-pulse ml-0.5"
            />
          </div>
        </div>
        <div className="matrix-container sm:hidden xl:block">
          <div>
            <MatrixRainSingle
              width={20}
              height={230}
              color="#0F0"
              fontSize={15}
              speed={100}
              fadeEffect={0.05}
              className="matrix-rain-single"
            />
          </div>
          <div className="matrix-triangle">
            <MatrixRainTriangle
              width={240}
              height={230}
              color="#0F0"
              fontSize={15}
              speed={100}
              fadeEffect={0.05}
              columns={12}
              className="matrix-rain-triangle"
            />
          </div>
        </div>
        <div
          className="max-sm:scale-70 max-sm:flex max-sm:flex-row max-sm:items-center max-sm:justify-center max-sm:gap-4 max-sm:order-[-1]
    sm:flex sm:flex-row sm:items-center sm:justify-center sm:gap-6 
    xl:block xl:static sm:order-[-1]
  "
        >
          <div className="naming  xl:order-none xl:absolute xl:left-[330px] xl:top-0 ">
            <span
              className={`glitch-container text-white text-[360px] font-bold leading-none ml-6 select-none ${roboto.className}`}
            >
              0<span>0</span>
              <span>0</span>
            </span>
            <span
              className={`
    absolute xl:top-[40px]
    text-white text-[120px] font-bold select-none leading-none ${bungee.className}`}
            >
              day
            </span>
            <span
              className={`xl:absolute xl:top-[170px] text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-purple-500 to-blue-500 bg-[length:200%_auto] animate-gradient text-[180px] font-bold select-none leading-none ${bungee.className}`}
            >
              CTF
            </span>
          </div>
          <div className="flex justify-center xl:absolute xl:top-0 xl:ml-[930px]">
            <Image
              src={flag}
              alt="flag"
              width={230}
              style={{ maxWidth: "230px" }}
            />
          </div>
        </div>
      </div>

      {/* About Section */}
      <div className="mt-50 flex flex-col justify-center items-center ml-[-200px] sm:ml-[-220px] md:ml-[-220px] lg:ml-[-320px] max-sm:mb-[-50]">
        <div className="max-w-3xl text-center relative p-8">
          {/* Decorative elements */}
          <div className="absolute top-0 left-0 w-[2px] h-12 bg-cyan-500"></div>
          <div className="absolute top-0 left-0 w-12 h-[2px] bg-cyan-500"></div>
          <div className="absolute bottom-0 right-0 w-[2px] h-12 bg-purple-500"></div>
          <div className="absolute bottom-0 right-0 w-12 h-[2px] bg-purple-500"></div>

          {/* Background blur effect */}
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm -z-10"></div>

          <h2
            className="text-center text-3xl sm:text-4xl lg:text-4xl xl:text-5xl font-extrabold mb-6 relative text-transparent bg-clip-text bg-gradient-to-l from-gray-500 to-white z-10 leading-[1.2]"
          >
            From Challenge to Mastery
          </h2>

          <p className="text-gray-400 text-lg sm:text-xl font-light tracking-wide px-4 relative group">
            <span className="inline-block group-hover:scale-105 transition-transform duration-300">
              Weekly rotating challenges from real CTF competitions.
            </span>
            <br />
            <span className="inline-block text-cyan-400 font-medium mt-2 group-hover:text-purple-400 transition-colors duration-300">
              One unique daily mission. No repeats.
            </span>
          </p>

          {/* Always active indicator */}
          <div className="flex items-center justify-center mt-8 px-6 py-3 bg-black/30 backdrop-blur-sm border border-cyan-500/20 rounded-sm group hover:bg-black/40 transition-all duration-300">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-3"></div>
            <span className="text-green-400 font-mono tracking-wider group-hover:text-green-300 transition-colors">
              24/7 ACTIVE CHALLENGES
            </span>
          </div>
        </div>
      </div>
      {/* Active Missions Section */}
      <div className="mt-50 flex flex-col justify-center items-center ml-[-200px] sm:ml-[-220px] md:ml-[-220px] lg:ml-[-320px] max-sm:mb-[-50]">
        <div className="relative mb-12">
          <h2 className="text-center text-4xl sm:text-5xl lg:text-5xl xl:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-500 to-white">
            Active Missions
          </h2>
        </div>

        {/* Rest of your existing content structure stays the same */}
        <div className="flex flex-col md:flex-row gap-6 w-full max-w-5xl px-4">
          {/* Main Weekly Box */}
          <div
            className="flex-1 bg-black/40 border-l-4 border-cyan-500 p-8 backdrop-blur-sm
      hover:bg-black/60 transition-all duration-300 group"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse"></div>
              <h3 className="text-cyan-400 text-xl font-mono">
                7-DAY MISSIONS
              </h3>
            </div>
            <div className="grid grid-cols-7 gap-2 mb-4">
              {[...Array(7)].map((_, i) => (
                <div
                  key={i}
                  className="w-full aspect-square bg-gray-800/50 border border-gray-700 
            group-hover:border-cyan-500/30 transition-all duration-300"
                ></div>
              ))}
            </div>
            <p className="text-gray-400 font-mono text-sm">
              Real CTF challenges. Random selection. 7 days to solve.
            </p>
          </div>

          {/* Daily Challenge Box */}
          <div
            className="md:w-72 bg-black/40 border-l-4 border-purple-500 p-8 backdrop-blur-sm
      hover:bg-black/60 transition-all duration-300"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-ping"></div>
              <h3 className="text-purple-400 text-xl font-mono">24H MISSION</h3>
            </div>
            <div className="text-4xl font-mono text-purple-500 mb-4">
              23:59:59
            </div>
            <p className="text-gray-400 font-mono text-sm">
              Daily unique challenge. Gone in 24h.
            </p>
          </div>
        </div>

        <button
          className="mt-8 px-6 py-3 bg-black/50 border border-cyan-500/30 text-cyan-400 
    font-mono hover:bg-cyan-500/10 transition-all duration-300 flex items-center gap-2"
        >
          <span className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse"></span>
          START MISSION
        </button>
      </div>
    </>
  );
}
