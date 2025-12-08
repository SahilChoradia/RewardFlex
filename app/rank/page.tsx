"use client";

import { RouteGuard } from "@/components/auth/route-guard";
import { useAuth } from "@/contexts/auth-context";
import { RankBadge } from "@/components/reusable/rank-badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, TrendingUp, Award, Flame } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const rankTiers = [
  { name: "Bronze", minDays: 1, maxDays: 7, color: "from-amber-600 to-amber-800" },
  { name: "Silver", minDays: 8, maxDays: 30, color: "from-gray-400 to-gray-600" },
  { name: "Gold", minDays: 31, maxDays: 90, color: "from-yellow-500 to-yellow-700" },
  { name: "Platinum", minDays: 90, maxDays: Infinity, color: "from-cyan-400 to-cyan-600" },
];

export default function RankPage() {
  const { user } = useAuth();
  const currentStreak = user?.streak || 0;
  const currentRank = user?.rank || "Bronze";
  const [leaderboard, setLeaderboard] = useState<
    { id: string; name: string; streak: number; rank: "Bronze" | "Silver" | "Gold" | "Platinum" }[]
  >([]);
  const [isLoadingBoard, setIsLoadingBoard] = useState(true);

  const currentTier = rankTiers.find((tier) => tier.name === currentRank);
  const nextTier = rankTiers[rankTiers.findIndex((tier) => tier.name === currentRank) + 1];

  const progressInTier = currentTier
    ? Math.min(
        100,
        ((currentStreak - currentTier.minDays + 1) /
          (currentTier.maxDays - currentTier.minDays + 1)) *
          100
      )
    : 100;

  const daysToNextRank = nextTier
    ? Math.max(0, nextTier.minDays - currentStreak)
    : 0;

  // Mock fetch leaderboard (replace with real /api/leaderboard)
  useEffect(() => {
    const mock = [
      { id: "1", name: "Sahil Mehta", streak: 84, rank: "Gold" as const },
      { id: "2", name: "Rohan Gupta", streak: 56, rank: "Silver" as const },
      { id: "3", name: "Abhishek Rao", streak: 32, rank: "Bronze" as const },
      { id: "4", name: "You", streak: currentStreak, rank: currentRank as any },
    ];
    const sorted = mock.sort((a, b) => b.streak - a.streak);
    setLeaderboard(sorted);
    setIsLoadingBoard(false);
  }, [currentRank, currentStreak]);

  const highestStreak = useMemo(
    () => Math.max(...leaderboard.map((u) => u.streak), 1),
    [leaderboard]
  );

  const progressFor = (streak: number) => Math.min(100, Math.round((streak / highestStreak) * 100));

  return (
    <RouteGuard allowedRoles={["member"]}>
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold mb-2">Your Rank</h1>
          <p className="text-muted-foreground mb-8">Track your progress and climb the ranks</p>

          {/* Current Rank Display */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Current Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row items-center gap-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", delay: 0.2 }}
                  className="flex flex-col items-center"
                >
                  <RankBadge rank={currentRank} size="lg" showGlow />
                  <div className="mt-4 text-center">
                    <div className="text-4xl font-bold">{currentStreak}</div>
                    <div className="text-sm text-muted-foreground">Days Streak</div>
                  </div>
                </motion.div>
                <div className="flex-1 space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Progress in {currentRank}</span>
                      <span className="font-semibold">{Math.round(progressInTier)}%</span>
                    </div>
                    <Progress value={progressInTier} className="h-3" />
                  </div>
                  {nextTier && (
                    <div className="p-4 bg-muted rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="h-5 w-5 text-primary" />
                        <span className="font-semibold">Next Rank: {nextTier.name}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {daysToNextRank > 0
                          ? `You need ${daysToNextRank} more day${daysToNextRank > 1 ? "s" : ""} to reach ${nextTier.name}`
                          : `You've reached ${nextTier.name}!`}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Rank Tiers */}
          <div>
            <h2 className="text-2xl font-bold mb-6">Rank Tiers</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {rankTiers.map((tier, index) => {
                const isCurrent = tier.name === currentRank;
                const isUnlocked = currentStreak >= tier.minDays;

                return (
                  <motion.div
                    key={tier.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    whileHover={{ scale: 1.05, y: -5 }}
                  >
                    <Card
                      className={`relative overflow-hidden ${
                        isCurrent ? "border-primary shadow-lg shadow-primary/20" : ""
                      } ${!isUnlocked ? "opacity-60" : ""}`}
                    >
                      {isCurrent && (
                        <div className="absolute top-2 right-2">
                          <Award className="h-6 w-6 text-primary" />
                        </div>
                      )}
                      <CardHeader>
                        <div
                          className={`w-16 h-16 rounded-full bg-gradient-to-br ${tier.color} flex items-center justify-center mx-auto mb-4`}
                        >
                          <Trophy className="h-8 w-8 text-white" />
                        </div>
                        <CardTitle className="text-center">{tier.name}</CardTitle>
                        <CardDescription className="text-center">
                          {tier.minDays} - {tier.maxDays === Infinity ? "∞" : tier.maxDays} days
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2 text-sm">
                          <li className="flex items-center gap-2">
                            <span className="text-primary">✓</span>
                            <span>Rank badge</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <span className="text-primary">✓</span>
                            <span>Exclusive rewards</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <span className="text-primary">✓</span>
                            <span>Priority support</span>
                          </li>
                        </ul>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Leaderboard */}
          <div className="mt-12">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">Leaderboard</h2>
              <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
                Refresh
              </Button>
            </div>
            <div className="space-y-3">
              <AnimatePresence>
                {isLoadingBoard ? (
                  <p className="text-muted-foreground text-sm">Loading leaderboard...</p>
                ) : (
                  leaderboard.map((entry, index) => {
                    const progress = progressFor(entry.streak);
                    return (
                      <motion.div
                        key={entry.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Card className="overflow-hidden">
                          <CardContent className="p-4 flex items-center gap-4">
                            <div className="flex items-center gap-3 w-1/3">
                              <Avatar>
                                <AvatarFallback>{entry.name.charAt(0).toUpperCase()}</AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-semibold">{entry.name}</div>
                                <div className="text-xs text-muted-foreground">#{index + 1}</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 w-1/3">
                              <Flame className="h-4 w-4 text-primary" />
                              <span className="text-sm font-medium">{entry.streak} days</span>
                              <RankBadge rank={entry.rank} />
                            </div>
                            <div className="w-1/3">
                              <div className="flex justify-between text-xs mb-1 text-muted-foreground">
                                <span>Progress</span>
                                <span>{progress}%</span>
                              </div>
                              <div className="h-2 rounded-full bg-muted">
                                <div
                                  className="h-2 rounded-full bg-primary transition-all"
                                  style={{ width: `${progress}%` }}
                                />
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </div>
    </RouteGuard>
  );
}






