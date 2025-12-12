"use strict";

export function getRankFromStreak(streak) {
  if (streak > 90) return "Platinum";
  if (streak > 30) return "Gold";
  if (streak > 7) return "Silver";
  return "Bronze";
}

