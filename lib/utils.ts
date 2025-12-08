import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getRankTier(streak: number): "Bronze" | "Silver" | "Gold" | "Platinum" {
  if (streak >= 90) return "Platinum";
  if (streak >= 31) return "Gold";
  if (streak >= 8) return "Silver";
  return "Bronze";
}

export function getRankColor(tier: "Bronze" | "Silver" | "Gold" | "Platinum"): string {
  switch (tier) {
    case "Bronze":
      return "text-amber-600";
    case "Silver":
      return "text-gray-400";
    case "Gold":
      return "text-yellow-500";
    case "Platinum":
      return "text-cyan-400";
    default:
      return "text-gray-400";
  }
}

