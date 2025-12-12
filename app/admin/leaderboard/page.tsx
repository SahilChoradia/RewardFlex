"use client";
/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/auth-context";
import API_BASE from "@/lib/api";

interface AdminUser {
  _id: string;
  name: string;
  email: string;
  streak: number;
  rank: string;
  role: string;
}

export default function AdminLeaderboardPage() {
  const { user, hydrated, loading: authLoading } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<AdminUser[]>([]);

  useEffect(() => {
    // DO NOT check auth until loading === false
    if (authLoading || !hydrated) return;
    const token = localStorage.getItem("streakfitx_token") || localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    if (!user || user.role !== "admin") {
      router.push("/login");
      return;
    }
    fetchData(token);
  }, [hydrated, user, router, authLoading]);

  const fetchData = async (token: string) => {
    const res = await fetch(`${API_BASE}/admin/leaderboard`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (res.ok && data.success) setUsers(data.users || []);
  };

  if (authLoading || !hydrated) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Admin Leaderboard</h1>
      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 gap-3 text-sm font-semibold mb-2">
            <span>Name</span>
            <span>Email</span>
            <span>Streak</span>
            <span>Rank</span>
            <span>Role</span>
          </div>
          {users.map((u) => (
            <div key={u._id} className="grid grid-cols-5 gap-3 py-2 border-b text-sm">
              <span>{u.name}</span>
              <span className="truncate">{u.email}</span>
              <span>{u.streak}</span>
              <span>{u.rank}</span>
              <span className="uppercase">{u.role}</span>
            </div>
          ))}
          {users.length === 0 && <p className="text-muted-foreground text-sm">No users found.</p>}
        </CardContent>
      </Card>
    </div>
  );
}





