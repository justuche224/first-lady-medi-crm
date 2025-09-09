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
      className="absolute bottom-8 left-8 z-20 max-w-md shadow-2xl w-full max-sm:bottom-0 max-sm:left-0 max-sm:right-0 max-sm:max-w-none max-sm:mx-auto"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <LoginForm />
    </motion.main>
  );
}
