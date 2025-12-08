"use client";

import { RouteGuard } from "@/components/auth/route-guard";
import { useAuth } from "@/contexts/auth-context";
import { useQuery } from "@tanstack/react-query";
import { mockAPI } from "@/lib/mock-api";
import { StatCard } from "@/components/reusable/stat-card";
import { EventCard } from "@/components/reusable/event-card";
import { RankBadge } from "@/components/reusable/rank-badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Target,
  Trophy,
  Gift,
  Sparkles,
  Calendar,
  TrendingUp,
  Flame,
} from "lucide-react";

export default function MemberDashboard() {
  const { user } = useAuth();

  const { data: events, isLoading: eventsLoading } = useQuery({
    queryKey: ["events"],
    queryFn: () => mockAPI.fetchEvents(),
  });

  const completedTasks = 0; // This would come from tasks context/state
  const totalTasks = 4;

  const quickLinks = [
    { href: "/tasks", label: "Go to Tasks", icon: Target },
    { href: "/rank", label: "View Rank & Progress", icon: Trophy },
    { href: "/rewards", label: "Check Rewards", icon: Gift },
    { href: "/ai-diet", label: "AI Diet Planner", icon: Sparkles },
  ];

  return (
    <RouteGuard allowedRoles={["member"]}>
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold mb-2">Welcome back, {user?.name}!</h1>
          <p className="text-muted-foreground mb-8">Here's your fitness overview</p>
        </motion.div>

        {/* Today's Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Today's Tasks</CardTitle>
                <CardDescription>Your daily fitness checklist</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Progress</span>
                      <span className="font-semibold">
                        {completedTasks}/{totalTasks} completed
                      </span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${(completedTasks / totalTasks) * 100}%` }}
                      />
                    </div>
                  </div>
                  <Button asChild className="w-full">
                    <Link href="/tasks">View All Tasks</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Current Streak</CardTitle>
                <CardDescription>Keep it going!</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Flame className="h-12 w-12 text-primary" />
                    <div>
                      <div className="text-3xl font-bold">{user?.streak || 0} days</div>
                      <div className="text-sm text-muted-foreground">Streak</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Rank:</span>
                    <RankBadge rank={user?.rank || "Bronze"} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Quick Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickLinks.map((link, index) => {
              const Icon = link.icon;
              return (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                >
                  <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
                    <Link href={link.href}>
                      <CardHeader>
                        <Icon className="h-8 w-8 text-primary mb-2" />
                        <CardTitle className="text-lg">{link.label}</CardTitle>
                      </CardHeader>
                    </Link>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Offers & Events */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-2xl font-bold mb-4">Upcoming Events & Offers</h2>
          {eventsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-48" />
              ))}
            </div>
          ) : events && events.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event, index) => (
                <EventCard key={event.id} event={event} delay={index * 0.1} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No upcoming events at the moment.
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>
    </RouteGuard>
  );
}



