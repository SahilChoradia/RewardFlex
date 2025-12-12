"use client";
/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { Badge } from "@/components/ui/badge";
import { Users, Calendar, Gift, CreditCard, ListTodo, Trophy, Droplet } from "lucide-react";
import API_BASE from "@/lib/api";

export default function AdminDashboardPage() {
  const { user, hydrated, loading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({
    events: 0,
    offers: 0,
    plans: 0,
    templates: 0,
    pendingWater: 0,
    users: 0,
  });
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    if (loading || !hydrated) return;
    const token = localStorage.getItem("streakfitx_token") || localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    if (!user || user.role !== "admin") {
      router.push("/login");
      return;
    }

    // Fetch stats
    const fetchStats = async () => {
      try {
        setLoadingStats(true);
        const [eventsRes, offersRes, plansRes, templatesRes, waterRes, usersRes] = await Promise.all([
          fetch(`${API_BASE}/admin/events`, { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, credentials: 'include' }),
          fetch(`${API_BASE}/admin/offers`, { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, credentials: 'include' }),
          fetch(`${API_BASE}/admin/subscription-plans`, { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, credentials: 'include' }),
          fetch(`${API_BASE}/admin/task-templates`, { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, credentials: 'include' }),
          fetch(`${API_BASE}/admin/water-pending`, { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, credentials: 'include' }),
          fetch(`${API_BASE}/admin/users`, { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, credentials: 'include' }),
        ]);

        const [eventsData, offersData, plansData, templatesData, waterData, usersData] = await Promise.all([
          eventsRes.json(),
          offersRes.json(),
          plansRes.json(),
          templatesRes.json(),
          waterRes.json(),
          usersRes.json(),
        ]);

        setStats({
          events: eventsData.events?.length || 0,
          offers: offersData.offers?.length || 0,
          plans: plansData.plans?.length || 0,
          templates: templatesData.templates?.length || 0,
          pendingWater: waterData.tasks?.length || 0,
          users: usersData.users?.length || 0,
        });
      } catch (err) {
        console.error("Failed to fetch stats:", err);
      } finally {
        setLoadingStats(false);
      }
    };

    fetchStats();
  }, [hydrated, user, router, loading]);

  if (loading || !hydrated) {
    return <div className="p-6">Loading...</div>;
  }

  const managementSections = [
    {
      title: "Events Manager",
      description: "Create, edit, and delete events",
      icon: Calendar,
      href: "/admin/events",
      count: stats.events,
      color: "bg-blue-500",
    },
    {
      title: "Offers Manager",
      description: "Manage promotional offers and discounts",
      icon: Gift,
      href: "/admin/offers",
      count: stats.offers,
      color: "bg-purple-500",
    },
    {
      title: "Subscription Plans",
      description: "Manage subscription plans and pricing",
      icon: CreditCard,
      href: "/admin/subscriptions",
      count: stats.plans,
      color: "bg-green-500",
    },
    {
      title: "Task Templates",
      description: "Create and manage task templates",
      icon: ListTodo,
      href: "/admin/tasks",
      count: stats.templates,
      color: "bg-orange-500",
    },
    {
      title: "User Management",
      description: "View, edit, and manage all users",
      icon: Users,
      href: "/admin/members",
      count: stats.users,
      color: "bg-indigo-500",
    },
    {
      title: "Water Verification",
      description: "Review and approve water task submissions",
      icon: Droplet,
      href: "/admin/water",
      count: stats.pendingWater,
      color: "bg-cyan-500",
      badge: stats.pendingWater > 0 ? "pending" : undefined,
    },
    {
      title: "Rank & Leaderboard",
      description: "Manage rankings and view leaderboard",
      icon: Trophy,
      href: "/admin/rank",
      color: "bg-yellow-500",
    },
  ];

  return (
    <div className="min-h-[calc(100vh-200px)] px-4 py-10">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground mt-2">
              Full control panel for managing all platform features and content.
            </p>
          </div>
        </div>

        {loadingStats ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading dashboard stats...</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {managementSections.map((section, index) => {
              const Icon = section.icon;
              return (
                <motion.div
                  key={section.href}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="h-full hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className={`p-3 rounded-lg ${section.color} text-white`}>
                          <Icon className="h-6 w-6" />
                        </div>
                        {section.count !== undefined && (
                          <Badge variant="secondary">{section.count}</Badge>
                        )}
                        {section.badge && (
                          <Badge variant="destructive">{section.badge}</Badge>
                        )}
                      </div>
                      <CardTitle className="mt-4">{section.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground">{section.description}</p>
                      <Button asChild className="w-full">
                        <Link href={section.href}>Manage</Link>
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
