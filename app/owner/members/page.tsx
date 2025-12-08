"use client";

import { useState } from "react";
import { RouteGuard } from "@/components/auth/route-guard";
import { useQuery } from "@tanstack/react-query";
import { mockAPI } from "@/lib/mock-api";
import { MemberInsight } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { StatCard } from "@/components/reusable/stat-card";
import { RankBadge } from "@/components/reusable/rank-badge";
import { motion } from "framer-motion";
import { Users, TrendingUp, Target } from "lucide-react";

export default function OwnerMembersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [rankFilter, setRankFilter] = useState<string>("all");

  const { data: members, isLoading } = useQuery({
    queryKey: ["memberInsights"],
    queryFn: () => mockAPI.fetchMemberInsights(),
  });

  const filteredMembers = members?.filter((member) => {
    const matchesSearch =
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRank = rankFilter === "all" || member.rank === rankFilter;
    return matchesSearch && matchesRank;
  });

  const stats = {
    total: members?.length || 0,
    activeStreakers: members?.filter((m) => m.currentStreak > 0).length || 0,
    averageStreak: members
      ? Math.round(members.reduce((sum, m) => sum + m.currentStreak, 0) / members.length)
      : 0,
  };

  return (
    <RouteGuard allowedRoles={["owner"]}>
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold mb-2">Member Insights</h1>
          <p className="text-muted-foreground mb-8">View and analyze your members' progress</p>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <StatCard title="Total Members" value={stats.total} icon={Users} delay={0.1} />
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
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Search by name or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Select value={rankFilter} onValueChange={setRankFilter}>
                  <SelectTrigger className="w-full sm:w-[200px]">
                    <SelectValue placeholder="Filter by rank" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Ranks</SelectItem>
                    <SelectItem value="Bronze">Bronze</SelectItem>
                    <SelectItem value="Silver">Silver</SelectItem>
                    <SelectItem value="Gold">Gold</SelectItem>
                    <SelectItem value="Platinum">Platinum</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Members Table */}
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-20" />
              ))}
            </div>
          ) : filteredMembers && filteredMembers.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>Members List</CardTitle>
                <CardDescription>
                  Showing {filteredMembers.length} of {members?.length || 0} members
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-4 font-semibold">Name</th>
                        <th className="text-left p-4 font-semibold">Email</th>
                        <th className="text-left p-4 font-semibold">Current Streak</th>
                        <th className="text-left p-4 font-semibold">Rank</th>
                        <th className="text-left p-4 font-semibold">Subscription</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredMembers.map((member, index) => (
                        <motion.tr
                          key={member.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="border-b hover:bg-muted/50 transition-colors"
                        >
                          <td className="p-4 font-medium">{member.name}</td>
                          <td className="p-4 text-muted-foreground">{member.email}</td>
                          <td className="p-4">
                            <span className="font-semibold">{member.currentStreak}</span> days
                          </td>
                          <td className="p-4">
                            <RankBadge rank={member.rank} size="sm" />
                          </td>
                          <td className="p-4">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                member.subscriptionStatus === "active"
                                  ? "bg-primary/20 text-primary"
                                  : member.subscriptionStatus === "expired"
                                  ? "bg-destructive/20 text-destructive"
                                  : "bg-muted text-muted-foreground"
                              }`}
                            >
                              {member.subscriptionStatus}
                            </span>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No members found matching your criteria.</p>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>
    </RouteGuard>
  );
}



