"use client";

/* eslint-disable react/no-unescaped-entities */

import { RouteGuard } from "@/components/auth/route-guard";
import { useAuth } from "@/contexts/auth-context";
import { useQuery } from "@tanstack/react-query";
import { mockAPI } from "@/lib/mock-api";
import { RewardCard } from "@/components/reusable/reward-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Gift } from "lucide-react";

export default function RewardsPage() {
  const { user } = useAuth();
  const [claimDialogOpen, setClaimDialogOpen] = useState(false);
  const [selectedReward, setSelectedReward] = useState<string | null>(null);
  const { toast } = useToast();

  const { data: rewards, isLoading } = useQuery({
    queryKey: ["rewards", user?.streak],
    queryFn: () => mockAPI.fetchRewards(user?.streak || 0),
    enabled: !!user,
  });

  const handleClaim = (rewardId: string) => {
    setSelectedReward(rewardId);
    setClaimDialogOpen(true);
  };

  const confirmClaim = () => {
    // In a real app, this would call an API
    toast({
      title: "Reward Claimed!",
      description: "Your claim will be verified by the gym owner. You'll be notified soon.",
    });
    setClaimDialogOpen(false);
    setSelectedReward(null);
  };

  return (
    <RouteGuard allowedRoles={["member"]}>
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold mb-2">Rewards</h1>
          <p className="text-muted-foreground mb-8">
            Unlock exclusive rewards as you build your streak
          </p>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-64" />
              ))}
            </div>
          ) : rewards && rewards.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {rewards.map((reward, index) => (
                  <RewardCard
                    key={reward.id}
                    reward={reward}
                    onClaim={handleClaim}
                    delay={index * 0.1}
                  />
                ))}
              </div>

              <Dialog open={claimDialogOpen} onOpenChange={setClaimDialogOpen}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Gift className="h-5 w-5 text-primary" />
                      Claim Reward
                    </DialogTitle>
                    <DialogDescription>
                      Your claim will be verified by the gym owner. Once verified, you'll receive
                      instructions on how to redeem your reward.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="flex gap-4 mt-4">
                    <Button onClick={confirmClaim} className="flex-1">
                      Confirm Claim
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setClaimDialogOpen(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Gift className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No rewards available at the moment.</p>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>
    </RouteGuard>
  );
}






