"use client";

import { useAuth } from "@/contexts/auth-context";
import { PlanCard } from "@/components/reusable/plan-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { SubscriptionPlan } from "@/types";

export default function SubscriptionPage() {
  const { isAuthenticated, user, refreshUser } = useAuth();
  const { toast } = useToast();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  useEffect(() => {
    const fetchPlans = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API}/subscription/plans`);
        const data = await res.json();
        if (res.ok && data.success) {
          setPlans(data.plans || []);
        } else {
          toast({
            title: "Unable to load plans",
            description: data.error || "Please try again later.",
            variant: "destructive",
          });
        }
      } catch (err: any) {
        console.error("plans fetch", err);
        toast({
          title: "Network error",
          description: "Failed to fetch subscription plans.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, [API, toast]);

  const handleSubscribe = (planId: string) => {
    if (!isAuthenticated) {
      toast({
        title: "Login Required",
        description: "Please login to subscribe to a plan.",
      });
      return;
    }
    const token = localStorage.getItem("token") || localStorage.getItem("streakfitx_token");
    if (!token) {
      toast({ title: "Unauthorized", description: "Please login again.", variant: "destructive" });
      return;
    }

    fetch(`${API}/subscription/purchase`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ planId }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.error || "Failed to purchase plan");
        toast({
          title: "Subscription Started!",
          description: "Your subscription has been activated.",
        });
        await refreshUser();
      })
      .catch((err: any) => {
        toast({
          title: "Purchase failed",
          description: err.message || "Could not start subscription.",
          variant: "destructive",
        });
      });
  };

  const currentPlanId = useMemo(() => user?.subscription?.plan?.toString() || null, [user?.subscription]);

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-bold mb-2">Subscription Plans</h1>
        <p className="text-muted-foreground mb-8">
          Choose the plan that works best for you
        </p>

        {isAuthenticated && user?.subscription?.endDate && (
          <Card className="mb-8 border-primary">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                Current Subscription
              </CardTitle>
              <CardDescription>
                Your subscription expires on{" "}
                {new Date(user.subscription.endDate).toLocaleDateString()}
              </CardDescription>
            </CardHeader>
          </Card>
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2].map((i) => (
              <Skeleton key={i} className="h-96" />
            ))}
          </div>
        ) : plans && plans.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {plans.map((plan, index) => (
              <PlanCard
                key={plan._id || plan.id}
                plan={plan}
                isCurrent={currentPlanId === (plan._id || plan.id)}
                onSubscribe={handleSubscribe}
                delay={index * 0.1}
              />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              No plans available at the moment.
            </CardContent>
          </Card>
        )}

        {!isAuthenticated && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8 text-center"
          >
            <p className="text-muted-foreground mb-4">
              Already have an account?{" "}
              <Link href="/login" className="text-primary hover:underline">
                Login
              </Link>
            </p>
            <Button asChild>
              <Link href="/signup">Sign Up Now</Link>
            </Button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}



















