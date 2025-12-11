"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface FuelBidonProps {
  currentLevel: number;
  capacity: number;
  fuelType?: "dizel" | "benzin" | "gas";
  name?: string;
  showDetails?: boolean;
  size?: "sm" | "md" | "lg";
  animated?: boolean;
}

const fuelColors = {
  dizel: {
    primary: "#22c55e",
    secondary: "#4ade80",
    dark: "#15803d",
  },
  benzin: {
    primary: "#eab308",
    secondary: "#facc15",
    dark: "#a16207",
  },
  gas: {
    primary: "#3b82f6",
    secondary: "#60a5fa",
    dark: "#1d4ed8",
  },
};

const sizeConfig = {
  sm: { width: 80, height: 120, fontSize: "text-xs" },
  md: { width: 120, height: 180, fontSize: "text-sm" },
  lg: { width: 160, height: 240, fontSize: "text-base" },
};

export function FuelBidon({
  currentLevel,
  capacity,
  fuelType = "dizel",
  name,
  showDetails = true,
  size = "md",
  animated = true,
}: FuelBidonProps) {
  const [displayLevel, setDisplayLevel] = useState(0);
  const percentage = capacity > 0 ? Math.min((currentLevel / capacity) * 100, 100) : 0;
  const colors = fuelColors[fuelType];
  const { width, height, fontSize } = sizeConfig[size];

  useEffect(() => {
    const timer = setTimeout(() => setDisplayLevel(percentage), animated ? 100 : 0);
    return () => clearTimeout(timer);
  }, [percentage, animated]);

  // Boja zavisi od nivoa
  const getLevelColor = () => {
    if (percentage <= 20) return "#ef4444"; // Crvena
    if (percentage <= 40) return "#f97316"; // Narandžasta
    if (percentage <= 60) return "#eab308"; // Žuta
    return colors.primary; // Zelena/plava/žuta zavisno od tipa
  };

  const levelColor = getLevelColor();

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width, height }}>
        <svg
          viewBox="0 0 100 150"
          className="w-full h-full drop-shadow-lg"
          style={{ filter: "drop-shadow(0 4px 6px rgba(0, 0, 0, 0.3))" }}
        >
          <defs>
            {/* Gradijent za bidon telo */}
            <linearGradient id={`bidonBody-${name}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#525252" />
              <stop offset="30%" stopColor="#737373" />
              <stop offset="50%" stopColor="#a3a3a3" />
              <stop offset="70%" stopColor="#737373" />
              <stop offset="100%" stopColor="#525252" />
            </linearGradient>

            {/* Gradijent za gorivo */}
            <linearGradient id={`fuelGradient-${name}`} x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor={levelColor} />
              <stop offset="100%" stopColor={levelColor} stopOpacity="0.7" />
            </linearGradient>

            {/* Animirani talas pattern */}
            <pattern
              id={`wave-${name}`}
              x="0"
              y="0"
              width="100"
              height="10"
              patternUnits="userSpaceOnUse"
            >
              <motion.path
                d="M0 5 Q 12.5 0, 25 5 T 50 5 T 75 5 T 100 5 V 10 H 0 Z"
                fill={levelColor}
                animate={{
                  d: [
                    "M0 5 Q 12.5 0, 25 5 T 50 5 T 75 5 T 100 5 V 10 H 0 Z",
                    "M0 5 Q 12.5 10, 25 5 T 50 5 T 75 5 T 100 5 V 10 H 0 Z",
                    "M0 5 Q 12.5 0, 25 5 T 50 5 T 75 5 T 100 5 V 10 H 0 Z",
                  ],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </pattern>

            {/* Clip path za gorivo */}
            <clipPath id={`bidonClip-${name}`}>
              <path d="M15 45 L15 130 Q15 140 25 140 L75 140 Q85 140 85 130 L85 45 Z" />
            </clipPath>

            {/* Sjaj */}
            <linearGradient id={`shine-${name}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="white" stopOpacity="0" />
              <stop offset="50%" stopColor="white" stopOpacity="0.3" />
              <stop offset="100%" stopColor="white" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Ručka bidona */}
          <path
            d="M30 10 L30 25 L70 25 L70 10 Q70 5 65 5 L35 5 Q30 5 30 10 Z"
            fill={`url(#bidonBody-${name})`}
            stroke="#404040"
            strokeWidth="1"
          />

          {/* Čep */}
          <ellipse cx="50" cy="8" rx="12" ry="4" fill="#404040" />
          <ellipse cx="50" cy="6" rx="10" ry="3" fill="#525252" />

          {/* Izliv */}
          <path
            d="M70 30 L88 18 Q92 15 92 20 L92 38 Q92 43 88 40 L70 32 Z"
            fill={`url(#bidonBody-${name})`}
            stroke="#404040"
            strokeWidth="1"
          />

          {/* Telo bidona */}
          <path
            d="M15 45 Q15 30 30 25 L70 25 Q85 30 85 45 L85 130 Q85 140 75 140 L25 140 Q15 140 15 130 Z"
            fill={`url(#bidonBody-${name})`}
            stroke="#404040"
            strokeWidth="1.5"
          />

          {/* Gorivo sa animacijom */}
          <g clipPath={`url(#bidonClip-${name})`}>
            <motion.rect
              x="15"
              y={140 - (displayLevel / 100) * 95}
              width="70"
              height={(displayLevel / 100) * 95}
              fill={`url(#fuelGradient-${name})`}
              initial={{ y: 140 }}
              animate={{ y: 140 - (displayLevel / 100) * 95 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
            />

            {/* Animirani talas na vrhu goriva */}
            {displayLevel > 5 && (
              <motion.rect
                x="15"
                y={140 - (displayLevel / 100) * 95 - 5}
                width="70"
                height="10"
                fill={`url(#wave-${name})`}
                initial={{ y: 135 }}
                animate={{ y: 140 - (displayLevel / 100) * 95 - 5 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
              />
            )}
          </g>

          {/* Sjaj na bidonu */}
          <path
            d="M20 50 L20 125 Q20 130 25 130 L30 130 Q35 130 35 125 L35 50 Q35 45 30 45 L25 45 Q20 45 20 50 Z"
            fill={`url(#shine-${name})`}
          />

          {/* Skala na bidonu */}
          {[25, 50, 75].map((mark) => (
            <g key={mark}>
              <line
                x1="80"
                y1={140 - (mark / 100) * 95}
                x2="85"
                y2={140 - (mark / 100) * 95}
                stroke="#404040"
                strokeWidth="1"
              />
            </g>
          ))}
        </svg>

        {/* Procenat overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <motion.span
            className={`font-bold text-white drop-shadow-lg ${size === "sm" ? "text-lg" : size === "md" ? "text-2xl" : "text-3xl"}`}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            {Math.round(displayLevel)}%
          </motion.span>
        </div>
      </div>

      {showDetails && (
        <div className="text-center">
          {name && <p className={`font-semibold text-foreground ${fontSize}`}>{name}</p>}
          <p className={`text-muted-foreground ${fontSize}`}>
            {currentLevel.toFixed(1)} / {capacity.toFixed(1)} L
          </p>
          <span
            className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium mt-1`}
            style={{
              backgroundColor: `${colors.primary}20`,
              color: colors.dark,
            }}
          >
            {fuelType.charAt(0).toUpperCase() + fuelType.slice(1)}
          </span>
        </div>
      )}
    </div>
  );
}
