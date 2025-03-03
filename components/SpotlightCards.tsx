"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";

interface SpotlightCardProps {
  children: React.ReactNode;
  className?: string;
  spotlightColor?: string;
}

const SpotlightCard: React.FC<SpotlightCardProps> = ({
  children,
  className = "",
  spotlightColor = "rgba(255, 255, 255, 0.05)",
}) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setPosition({ x, y });
    setOpacity(1);
  };

  const handleMouseLeave = () => {
    setOpacity(0);
  };

  const defaultSpotlightColor = mounted && theme === "dark" ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)";
  
  // Use provided spotlightColor or default based on theme
  const effectiveSpotlightColor = spotlightColor || defaultSpotlightColor;

  // Animation variants for the card
  const cardVariants = {
    initial: { 
      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)" 
    },
    hover: { 
      boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
      transition: { duration: 0.3 }
    }
  };

  return (
    <motion.div
      ref={cardRef}
      className={`relative rounded-3xl border border-neutral-800 bg-neutral-900 overflow-hidden ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      variants={cardVariants}
      initial="initial"
      whileHover="hover"
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <motion.div
        className="spotlight"
        style={{
          background: effectiveSpotlightColor,
          opacity,
          left: position.x,
          top: position.y,
          pointerEvents: "none",
          position: "absolute",
          width: "150px",
          height: "150px",
          borderRadius: "50%",
          transform: "translate(-50%, -50%)",
          mixBlendMode: "soft-light",
        }}
        animate={{ 
          opacity, 
          scale: opacity ? 1 : 0.8 
        }}
        transition={{ duration: 0.2 }}
      />
      {children}
    </motion.div>
  );
};

export default SpotlightCard;
