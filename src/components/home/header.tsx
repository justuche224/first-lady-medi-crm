"use client";

import { motion } from "framer-motion";
import { Button } from "../ui/button";

export default function Header() {
  const headerVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.46, 0.45, 0.94] as const,
      },
    },
  } as const;

  const logoVariants = {
    hover: {
      scale: 1.05,
      rotate: 2,
      transition: { type: "spring" as const, stiffness: 400 },
    },
  } as const;

  const buttonVariants = {
    hover: {
      scale: 1.05,
      transition: { type: "spring" as const, stiffness: 400 },
    },
    tap: { scale: 0.95 },
  } as const;

  return (
    <motion.header
      className="relative z-20 flex items-center justify-between p-6 max-md:p-4"
      variants={headerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div
        className="flex items-center"
        variants={logoVariants}
        whileHover="hover"
      >
       <h1 className="text-2xl font-bold text-primary-foreground dark:text-foreground max-md:text-xl">City Gate Hospital</h1>
      </motion.div>

      <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
        <Button className="max-md:text-sm max-md:px-3 max-md:py-2">
          Contact Us
        </Button>
      </motion.div>
    </motion.header>
  );
}
