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
        <svg
          fill="currentColor"
          viewBox="0 0 147 70"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
          className="size-10 translate-x-[-0.5px] text-primary-foreground dark:text-foreground max-md:size-8"
        >
          <path d="M56 50.2031V14H70V60.1562C70 65.5928 65.5928 70 60.1562 70C57.5605 70 54.9982 68.9992 53.1562 67.1573L0 14H19.7969L56 50.2031Z"></path>
          <path d="M147 56H133V23.9531L100.953 56H133V70H96.6875C85.8144 70 77 61.1856 77 50.3125V14H91V46.1562L123.156 14H91V0H127.312C138.186 0 147 8.81439 147 19.6875V56Z"></path>
        </svg>
      </motion.div>

      <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
        <Button className="max-md:text-sm max-md:px-3 max-md:py-2">
          Contact Us
        </Button>
      </motion.div>
    </motion.header>
  );
}
