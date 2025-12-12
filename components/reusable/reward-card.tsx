"use client";

import { Reward } from "@/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Lock, Gift, CheckCircle2 } from "lucide-react";
import { RankBadge } from "./rank-badge";

interface RewardCardProps {
  reward: Reward;
  onClaim: (rewardId: string) => void;
  delay?: number;
}

export function RewardCard({ reward, onClaim, delay = 0 }: RewardCardProps) {
  const isLocked = reward.status === "locked";
  const isClaimed = reward.status === "claimed";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      whileHover={{ scale: 1.02, y: -5 }}
    >
      <Card
        className={`relative overflow-hidden ${
          reward.status === "unlocked"
            ? "border-primary/50 bg-primary/5 shadow-lg shadow-primary/20"
            : isLocked
            ? "opacity-60"
            : ""
        }`}
      >
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="flex items-center gap-2">
                {isLocked ? (
                  <Lock className="h-5 w-5 text-muted-foreground" />
                ) : isClaimed ? (
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                ) : (
                  <Gift className="h-5 w-5 text-primary" />
                )}
                {reward.title}
              </CardTitle>
              <CardDescription className="mt-2">{reward.description}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Requires:</span>
            <span className="font-semibold text-foreground">{reward.requiredStreak} days streak</span>
          </div>
        </CardContent>
        <CardFooter>
          {isLocked ? (
            <Button disabled variant="outline" className="w-full">
              Locked
            </Button>
          ) : isClaimed ? (
            <Button disabled variant="secondary" className="w-full">
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Claimed
            </Button>
          ) : (
            <Button onClick={() => onClaim(reward.id)} className="w-full">
              <Gift className="h-4 w-4 mr-2" />
              Claim Reward
            </Button>
          )}
        </CardFooter>
      </Card>
    </motion.div>
  );
}







