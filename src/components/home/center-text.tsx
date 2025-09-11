"use client";

import { motion, easeInOut } from "framer-motion";

export default function CenterText() {
  const textVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        delay: 0.5,
        ease: easeInOut,
      },
    },
  };

  return (
    <motion.div
      className="md:absolute md:left-2 md:top-32 md:z-20 md:text-left md:max-w-lg md:w-full md:px-8 relative left-0 top-0 max-w-none px-4 text-left w-full"
      variants={textVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="backdrop-blur-sm bg-white/10 rounded-2xl p-8 border border-white/20 shadow-2xl max-md:p-6 max-md:rounded-xl">
        <motion.h2
          className="text-4xl font-bold text-white mb-4 max-md:text-2xl max-md:mb-3"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{
            opacity: 1,
            scale: 1,
            transition: { duration: 0.6, delay: 0.8 },
          }}
        >
          Your Health,
          <br />
          Our Priority
        </motion.h2>
        <motion.p
          className="text-white/90 text-lg leading-relaxed mb-6 max-md:text-base max-md:mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{
            opacity: 1,
            y: 0,
            transition: { duration: 0.6, delay: 1 },
          }}
        >
          Experience world-class healthcare with cutting-edge technology and
          compassionate care from our dedicated medical professionals.
        </motion.p>
        <motion.div
          className="flex items-center justify-center space-x-4 text-white/80 text-sm max-md:flex-col max-md:space-x-0 max-md:space-y-2 max-md:text-xs"
          initial={{ opacity: 0 }}
          animate={{
            opacity: 1,
            transition: { duration: 0.6, delay: 1.2 },
          }}
        >
          <div className="flex items-center">
            <div className="w-2 h-2 bg-blue-400 rounded-full mr-2"></div>
            <span>Advanced Care</span>
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
            <span>Expert Staff</span>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
