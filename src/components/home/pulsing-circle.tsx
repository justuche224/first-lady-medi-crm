"use client";

import { PulsingBorder } from "@paper-design/shaders-react";
import { motion } from "framer-motion";

export default function PulsingCircle() {
  const circleVariants = {
    hidden: { opacity: 0, scale: 0 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 1,
        delay: 1,
        ease: [0.25, 0.46, 0.45, 0.94] as const,
      },
    },
  } as const;

  return (
    <motion.div
      className="absolute bottom-8 right-8 z-30 max-lg:bottom-4 max-lg:right-4 max-sm:bottom-2 max-sm:right-2"
      variants={circleVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="relative w-20 h-20 flex items-center justify-center max-sm:w-16 max-sm:h-16">
        {/* Pulsing Border Circle */}
        <PulsingBorder
          colors={[
            "#BEECFF",
            "#E77EDC",
            "#FF4C3E",
            "#00FF88",
            "#FFD700",
            "#FF6B35",
            "#8A2BE2",
          ]}
          colorBack="#00000000"
          speed={1.5}
          roundness={1}
          thickness={0.1}
          softness={0.2}
          intensity={5}
          // @ts-expect-error: works
          spotsPerColor={5}
          spotSize={0.1}
          pulse={0.1}
          smoke={0.5}
          smokeSize={4}
          scale={0.65}
          rotation={0}
          frame={9161408.251009725}
          style={{
            width: "60px",
            height: "60px",
            borderRadius: "50%",
          }}
        />

        {/* Rotating Text Around the Pulsing Border */}
        <motion.svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 100 100"
          animate={{ rotate: 360 }}
          transition={{
            duration: 20,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
          style={{ transform: "scale(1.6)" }}
        >
          <defs>
            <path
              id="circle"
              d="M 50, 50 m -38, 0 a 38,38 0 1,1 76,0 a 38,38 0 1,1 -76,0"
            />
          </defs>
          <text className="text-sm fill-white/80 instrument">
            <textPath href="#circle" startOffset="0%">
              medical • medical • medical • medical •
            </textPath>
          </text>
        </motion.svg>
      </div>
    </motion.div>
  );
}
