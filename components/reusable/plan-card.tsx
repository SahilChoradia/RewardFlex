"use client";

import { SubscriptionPlan } from "@/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface PlanCardProps {
  plan: SubscriptionPlan;
  isCurrent?: boolean;
  onSubscribe?: (planId: string) => void;
  delay?: number;
}

export function PlanCard({ plan, isCurrent, onSubscribe, delay = 0 }: PlanCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      whileHover={{ scale: 1.05, y: -5 }}
    >
      <Card
        className={`relative ${isCurrent ? "border-primary shadow-lg shadow-primary/20" : ""}`}
      >
        {isCurrent && (
          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
            <Badge className="bg-primary">Current Plan</Badge>
          </div>
        )}
        {plan.discount && (
          <div className="absolute -top-3 right-4">
            <Badge variant="secondary">{plan.discount}% OFF</Badge>
          </div>
        )}
        <CardHeader>
          <CardTitle className="text-2xl">{plan.name}</CardTitle>
          <div className="mt-4">
            <span className="text-4xl font-bold">${plan.price}</span>
            <span className="text-muted-foreground">/{plan.duration === "monthly" ? "mo" : "yr"}</span>
          </div>
          {plan.duration === "annual" && (
            <CardDescription className="mt-2">
              Save ${(plan.price / 12).toFixed(2)} per month
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {plan.features.map((feature, index) => (
              <li key={index} className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                <span className="text-sm">{feature}</span>
              </li>
            ))}
          </ul>
        </CardContent>
        <CardFooter>
          {isCurrent ? (
            <Button disabled variant="outline" className="w-full">
              Current Plan
            </Button>
          ) : (
            <Button onClick={() => onSubscribe?.(plan.id)} className="w-full">
              Subscribe
            </Button>
          )}
        </CardFooter>
      </Card>
    </motion.div>
  );
}




