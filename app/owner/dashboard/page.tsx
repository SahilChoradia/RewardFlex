"use client";

import { RouteGuard } from "@/components/auth/route-guard";
import { useAuth } from "@/contexts/auth-context";
import { useQuery } from "@tanstack/react-query";
import { mockAPI } from "@/lib/mock-api";
import { StatCard } from "@/components/reusable/stat-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import Link from "next/link";
import { Users, TrendingUp, Calendar, Target, Plus, BarChart3 } from "lucide-react";

export default function OwnerDashboard() {
  const { user } = useAuth();

  const { data: memberInsights, isLoading: insightsLoading } = useQuery({
    queryKey: ["memberInsights"],
    queryFn: () => mockAPI.fetchMemberInsights(),
  });

  const { data: events, isLoading: eventsLoading } = useQuery({
    queryKey: ["events"],
    queryFn: () => mockAPI.fetchEvents(),
  });

  // Mock stats - in real app, these would come from API
  const stats = {
    totalMembers: memberInsights?.length || 0,
    activeStreakers: memberInsights?.filter((m) => m.currentStreak > 0).length || 0,
    averageStreak: memberInsights
      ? Math.round(
          memberInsights.reduce((sum, m) => sum + m.currentStreak, 0) / memberInsights.length
        )
      : 0,
    upcomingEvents: events?.length || 0,
  };

  const quickActions = [
    { href: "/owner/events", label: "Create Event/Offer", icon: Plus },
    { href: "/owner/trainers", label: "Add Trainer", icon: Users },
    { href: "/owner/members", label: "View Member Insights", icon: BarChart3 },
  ];

  return (
    <RouteGuard allowedRoles={["owner"]}>
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold mb-2">Owner Dashboard</h1>
          <p className="text-muted-foreground mb-8">Welcome back, {user?.name}</p>
        </motion.div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Members"
            value={stats.totalMembers}
            icon={Users}
            delay={0.1}
          />
          <StatCard
            title="Active Streakers"
            value={stats.activeStreakers}
            icon={TrendingUp}
            delay={0.2}
          />
          <StatCard
            title="Average Streak"
            value={`${stats.averageStreak} days`}
            icon={Target}
            delay={0.3}
          />
          <StatCard
            title="Upcoming Events"
            value={stats.upcomingEvents}
            icon={Calendar}
            delay={0.4}
          />
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <motion.div
                  key={action.href}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                >
                  <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
                    <Link href={action.href}>
                      <CardHeader>
                        <Icon className="h-8 w-8 text-primary mb-2" />
                        <CardTitle className="text-lg">{action.label}</CardTitle>
                      </CardHeader>
                    </Link>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Recent Events */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Recent Events</h2>
            <Button asChild variant="outline">
              <Link href="/owner/events">Manage Events</Link>
            </Button>
          </div>
          {eventsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-48" />
              ))}
            </div>
          ) : events && events.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.slice(0, 3).map((event, index) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle>{event.title}</CardTitle>
                      <CardDescription>{event.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        {new Date(event.date).toLocaleDateString()}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No events yet. Create your first event!
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>
    </RouteGuard>
  );
}



