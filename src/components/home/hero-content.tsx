"use client";

import { motion } from "framer-motion";
import { LoginForm } from "./login-form";

export default function HeroContent() {
  const containerVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.8,
        ease: [0.25, 0.46, 0.45, 0.94] as const,
        delay: 0.2,
      },
    },
  } as const;

  return (
    <motion.main
      className="md:absolute md:bottom-8 md:left-8 md:z-20 md:max-w-md md:shadow-2xl md:w-full relative bottom-0 left-0 max-w-none mx-0 w-full"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      // whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <LoginForm />
    </motion.main>
  );
}
