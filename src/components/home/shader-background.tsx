"use client";

import React from "react";

import { useCallback, useEffect, useMemo, useRef } from "react";
import { MeshGradient } from "@paper-design/shaders-react";

interface ShaderBackgroundProps {
  children: React.ReactNode;
}

const ShaderBackground = React.memo(function ShaderBackground({
  children,
}: ShaderBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const gradientColors1 = useMemo(
    () => ["#0f172a", "#6366f1", "#a5b4fc", "#334155", "#1e293b"],
    []
  );
  const gradientColors2 = useMemo(
    () => ["#0f172a", "#e2e8f0", "#6366f1", "#0f172a"],
    []
  );

  const handleMouseEnter = useCallback(() => {}, []);
  const handleMouseLeave = useCallback(() => {}, []);

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener("mouseenter", handleMouseEnter);
      container.addEventListener("mouseleave", handleMouseLeave);
    }

    return () => {
      if (container) {
        container.removeEventListener("mouseenter", handleMouseEnter);
        container.removeEventListener("mouseleave", handleMouseLeave);
      }
    };
  }, [handleMouseEnter, handleMouseLeave]);

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-background relative overflow-hidden"
    >
      {/* SVG Filters */}
      <svg className="absolute inset-0 w-0 h-0">
        <defs>
          <filter
            id="glass-effect"
            x="-10%"
            y="-20%"
            width="100%"
            height="100%"
          >
            <feTurbulence baseFrequency="0.01" numOctaves="1" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="0.2" />
            <feColorMatrix
              type="matrix"
              values="1 0 0 0 0.01
                      0 1 0 0 0.01
                      0 0 1 0 0.02
                      0 0 0 0.95 0"
            />
          </filter>
          <filter
            id="gooey-filter"
            x="-10%"
            y="-20%"
            width="100%"
            height="100%"
          >
            <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 12 -5"
              result="gooey"
            />
            <feComposite in="SourceGraphic" in2="gooey" operator="atop" />
          </filter>
        </defs>
      </svg>

      {/* Background Shaders */}
      <MeshGradient
        className="absolute inset-0 w-full h-full"
        colors={gradientColors1}
        speed={0.05}
        // @ts-expect-error: works
        backgroundColor="#0f172a"
      />
      <MeshGradient
        className="absolute inset-0 w-full h-full opacity-60"
        colors={gradientColors2}
        speed={0.05}
        // @ts-expect-error: works
        wireframe="true"
        backgroundColor="transparent"
      />

      {children}
    </div>
  );
});

export default ShaderBackground;
