"use client";

import { useAuth } from "@/contexts/auth-context";
import { useQuery } from "@tanstack/react-query";
import { mockAPI } from "@/lib/mock-api";
import { PlanCard } from "@/components/reusable/plan-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2 } from "lucide-react";

export default function SubscriptionPage() {
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();

  const { data: plans, isLoading } = useQuery({
    queryKey: ["subscriptionPlans"],
    queryFn: () => mockAPI.fetchSubscriptionPlans(),
  });

  const handleSubscribe = (planId: string) => {
    if (!isAuthenticated) {
      toast({
        title: "Login Required",
        description: "Please login to subscribe to a plan.",
      });
      return;
    }
    // In a real app, this would call an API
    toast({
      title: "Subscription Started!",
      description: "Your subscription has been activated. Welcome!",
    });
  };

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

        {isAuthenticated && user?.subscriptionExpiry && (
          <Card className="mb-8 border-primary">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                Current Subscription
              </CardTitle>
              <CardDescription>
                Your subscription expires on{" "}
                {new Date(user.subscriptionExpiry).toLocaleDateString()}
              </CardDescription>
            </CardHeader>
          </Card>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2].map((i) => (
              <Skeleton key={i} className="h-96" />
            ))}
          </div>
        ) : plans && plans.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {plans.map((plan, index) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                isCurrent={false}
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




