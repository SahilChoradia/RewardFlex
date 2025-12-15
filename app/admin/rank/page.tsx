"use client";
/* eslint-disable react-hooks/exhaustive-deps */

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/hooks/use-toast";
import { adminFetch } from "@/lib/fetch";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { RankBadge } from "@/components/reusable/rank-badge";
import { Flame } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Pencil } from "lucide-react";

interface LeaderboardUser {
  _id: string;
  name: string;
  email: string;
  streak: number;
  rank: "Bronze" | "Silver" | "Gold" | "Platinum";
  role: string;
}

export default function AdminRankPage() {
  const { user, hydrated, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<LeaderboardUser | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    streak: 0,
    rank: "Bronze" as "Bronze" | "Silver" | "Gold" | "Platinum",
  });

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const res = await adminFetch("/admin/leaderboard");
      const data = await res.json();
      if (res.ok && data.success) {
        const sorted = (data.users || []).sort((a: LeaderboardUser, b: LeaderboardUser) => b.streak - a.streak);
        setUsers(sorted);
      }
    } catch (err) {
      toast({ title: "Error", description: "Failed to load leaderboard", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading || !hydrated) return;
    if (!user || user.role !== "admin") {
      router.replace("/login");
      return;
    }
    fetchLeaderboard();
  }, [hydrated, user, router, authLoading]);

  const handleUpdateRank = async () => {
    if (!editingUser) return;
    try {
      const res = await adminFetch(`/admin/users/${editingUser._id}`, {
        method: "PUT",
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Update failed");
      toast({ title: "Success", description: "User rank updated successfully" });
      setIsDialogOpen(false);
      setEditingUser(null);
      fetchLeaderboard();
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Update failed", variant: "destructive" });
    }
  };

  const openEditDialog = (user: LeaderboardUser) => {
    setEditingUser(user);
    setFormData({
      streak: user.streak,
      rank: user.rank,
    });
    setIsDialogOpen(true);
  };

  const highestStreak = users.length > 0 ? Math.max(...users.map((u) => u.streak), 1) : 1;

  if (authLoading || !hydrated || loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Rank & Leaderboard Management</h1>
          <p className="text-muted-foreground mt-1">
            View and manage user rankings and streaks. Click edit to update user rank manually.
          </p>
        </div>
        <Button onClick={fetchLeaderboard} variant="outline">
          Refresh
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Leaderboard</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {users.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No users found.</p>
            ) : (
              users.map((entry, index) => {
                const progress = Math.min(100, Math.round((entry.streak / highestStreak) * 100));
                return (
                  <div
                    key={entry._id}
                    className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <Avatar>
                        <AvatarFallback>{entry.name.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-lg">#{index + 1}</span>
                          <span className="font-semibold truncate">{entry.name}</span>
                          <span className="text-xs text-muted-foreground">({entry.email})</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Flame className="h-4 w-4 text-primary" />
                          <span className="text-sm font-medium">{entry.streak} days</span>
                          <RankBadge rank={entry.rank} />
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 flex-1">
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between text-xs mb-1 text-muted-foreground">
                          <span>Progress</span>
                          <span>{progress}%</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                      </div>
                      <Button variant="outline" size="sm" onClick={() => openEditDialog(entry)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        setIsDialogOpen(open);
        if (!open) setEditingUser(null);
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User Rank</DialogTitle>
          </DialogHeader>
          {editingUser && (
            <div className="space-y-4 py-4">
              <div>
                <p className="text-sm font-medium mb-2">User: {editingUser.name}</p>
                <p className="text-xs text-muted-foreground">{editingUser.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Streak</label>
                <Input
                  type="number"
                  value={formData.streak}
                  onChange={(e) => setFormData({ ...formData, streak: Number(e.target.value) })}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Rank</label>
                <Select
                  value={formData.rank}
                  onValueChange={(value: any) => setFormData({ ...formData, rank: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Bronze">Bronze</SelectItem>
                    <SelectItem value="Silver">Silver</SelectItem>
                    <SelectItem value="Gold">Gold</SelectItem>
                    <SelectItem value="Platinum">Platinum</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateRank}>Update</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
