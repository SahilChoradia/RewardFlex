"use client";
/* eslint-disable react-hooks/exhaustive-deps */

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/auth-context";
import { adminFetch } from "@/lib/fetch";
import { Users, Calendar, Trophy, CheckSquare, Droplets, CreditCard, Tag } from "lucide-react";
import Link from "next/link";

interface AdminStats {
  totalUsers: number;
  activeSubscriptions: number;
  pendingTasks: number;
  totalEvents: number;
}

const managementSections = [
  { title: "Members", icon: Users, href: "/admin/members", color: "text-blue-500" },
  { title: "Events", icon: Calendar, href: "/admin/events", color: "text-green-500" },
  { title: "Rank & Leaderboard", icon: Trophy, href: "/admin/rank", color: "text-yellow-500" },
  { title: "Task Templates", icon: CheckSquare, href: "/admin/tasks", color: "text-purple-500" },
  { title: "Water Verification", icon: Droplets, href: "/admin/water", color: "text-cyan-500" },
  { title: "Subscriptions", icon: CreditCard, href: "/admin/subscriptions", color: "text-pink-500" },
  { title: "Offers", icon: Tag, href: "/admin/offers", color: "text-red-500" },
];

export default function AdminDashboardPage() {
  const { user, hydrated, loading: authLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    activeSubscriptions: 0,
    pendingTasks: 0,
    totalEvents: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading || !hydrated) return;

    if (!user || user.role !== "admin") {
      router.replace("/login");
      return;
    }

    const fetchStats = async () => {
      try {
        const res = await adminFetch("/admin/stats");
        const data = await res.json();
        if (res.ok && data.success) {
          setStats(data.stats);
        }
      } catch (err) {
        console.error("Failed to fetch stats", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [hydrated, authLoading, user?.role]);

  if (authLoading || !hydrated || loading) {
    return <div className="p-8 flex justify-center">Loading dashboard...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Subs</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeSubscriptions}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Tasks</CardTitle>
            <CheckSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingTasks}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEvents}</div>
          </CardContent>
        </Card>
      </div>

      {/* Management Sections */}
      <h2 className="text-xl font-semibold mt-8">Management</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {managementSections.map((section) => (
          <Link key={section.href} href={section.href}>
            <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
              <CardHeader className="flex flex-row items-center space-y-0 pb-2 gap-3">
                <section.icon className={`h-6 w-6 ${section.color}`} />
                <CardTitle className="text-base font-medium">{section.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Manage {section.title.toLowerCase()}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
