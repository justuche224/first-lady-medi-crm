"use client";

import { motion } from "framer-motion";
import { Heart, Users, Award, Clock } from "lucide-react";

export default function HospitalInfo() {
  const features = [
    {
      icon: Heart,
      title: "Comprehensive Care",
      description: "24/7 medical services with state-of-the-art facilities",
    },
    {
      icon: Users,
      title: "Expert Team",
      description: "Board-certified physicians and experienced medical staff",
    },
    {
      icon: Award,
      title: "Accredited Excellence",
      description: "Nationally recognized for quality patient care",
    },
    {
      icon: Clock,
      title: "Quick Access",
      description: "Streamlined appointment booking and patient portal",
    },
  ];

  return (
    <motion.div
      className="md:absolute md:right-8 md:top-1/2 md:-translate-y-1/2 md:z-20 md:max-w-md md:w-full relative right-0 top-0 transform-none max-w-none w-full"
      initial={{ opacity: 0, x: 50 }}
      animate={{
        opacity: 1,
        x: 0,
        transition: {
          duration: 0.8,
          staggerChildren: 0.2,
          ease: [0.25, 0.46, 0.45, 0.94],
        },
      }}
    >
      <div className="backdrop-blur-sm bg-white/10 rounded-2xl p-8 border border-white/20 shadow-2xl max-md:p-6 max-md:rounded-xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{
            opacity: 1,
            y: 0,
            transition: {
              duration: 0.6,
              ease: [0.25, 0.46, 0.45, 0.94],
            },
          }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-4 max-md:text-2xl max-md:mb-3">
            Welcome to City Gate Hospital
          </h1>
          <p className="text-white/90 text-lg leading-relaxed max-md:text-base max-md:leading-normal">
            At City Gate Hospital, we are committed to providing the best
            healthcare services to our patients.
          </p>
        </motion.div>

        <div className="space-y-6 max-md:space-y-4">
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{
                opacity: 1,
                y: 0,
                transition: {
                  duration: 0.6,
                  ease: [0.25, 0.46, 0.45, 0.94],
                },
              }}
              className="flex items-start space-x-4 group"
              whileHover={{ x: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <motion.div
                className="flex-shrink-0 p-2 bg-white/20 rounded-lg backdrop-blur-sm"
                whileHover={{
                  scale: 1.1,
                  rotate: 5,
                  transition: { type: "spring", stiffness: 300 },
                }}
              >
                <feature.icon className="w-6 h-6 text-white" />
              </motion.div>
              <div>
                <h3 className="text-white font-semibold text-lg mb-1 max-md:text-base">
                  {feature.title}
                </h3>
                <p className="text-white/80 text-sm leading-relaxed max-md:text-xs">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{
            opacity: 1,
            y: 0,
            transition: {
              duration: 0.6,
              ease: [0.25, 0.46, 0.45, 0.94],
            },
          }}
          className="mt-8 pt-6 border-t border-white/20 max-md:mt-6 max-md:pt-4"
        >
          <div className="flex items-center justify-between text-white/90 text-sm max-md:flex-col max-md:items-start max-md:space-y-2 max-md:text-xs">
            <span>Emergency: (555) 123-4567</span>
            <span className="flex items-center">
              <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
              Online 24/7
            </span>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
