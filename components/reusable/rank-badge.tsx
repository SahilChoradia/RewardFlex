"use client";

import { RankTier } from "@/types";
import { getRankColor } from "@/lib/utils";
import { motion } from "framer-motion";
import { Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

interface RankBadgeProps {
  rank: RankTier;
  size?: "sm" | "md" | "lg";
  showGlow?: boolean;
}

const rankColors = {
  Bronze: "from-amber-600 to-amber-800",
  Silver: "from-gray-400 to-gray-600",
  Gold: "from-yellow-500 to-yellow-700",
  Platinum: "from-cyan-400 to-cyan-600",
};

export function RankBadge({ rank, size = "md", showGlow = false }: RankBadgeProps) {
  const sizeClasses = {
    sm: "text-xs px-2 py-1",
    md: "text-sm px-3 py-1.5",
    lg: "text-lg px-4 py-2",
  };

  return (
    <motion.div
      className={cn(
        "inline-flex items-center gap-2 rounded-full bg-gradient-to-r font-bold text-white",
        rankColors[rank],
        sizeClasses[size],
        showGlow && "shadow-lg shadow-primary/50"
      )}
      animate={showGlow ? { scale: [1, 1.05, 1] } : {}}
      transition={{ duration: 2, repeat: Infinity }}
    >
      <Trophy className={cn(size === "sm" ? "h-3 w-3" : size === "md" ? "h-4 w-4" : "h-5 w-5")} />
      <span>{rank}</span>
    </motion.div>
  );
}



