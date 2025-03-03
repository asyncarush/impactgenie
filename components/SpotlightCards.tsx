"use client";

import React, { useState, useEffect, useRef, ReactNode } from "react";
import { useTheme } from "next-themes";

interface SpotlightCardProps {
  children: ReactNode;
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
  const [isHovered, setIsHovered] = useState(false);
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
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    setOpacity(1);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setOpacity(0);
  };

  // Default spotlight color based on theme
  const defaultSpotlightColor = mounted && theme === "dark" 
    ? "rgba(255, 255, 255, 0.05)" 
    : "rgba(0, 0, 0, 0.05)";

  // Use provided spotlightColor or default based on theme
  const effectiveSpotlightColor = spotlightColor || defaultSpotlightColor;

  return (
    <div
      ref={cardRef}
      className={`relative ${className}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div
        className="absolute pointer-events-none inset-0 transition-opacity duration-300"
        style={{
          opacity,
          background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, ${effectiveSpotlightColor}, transparent 40%)`,
        }}
      />
      {children}
    </div>
  );
};

export default SpotlightCard;
