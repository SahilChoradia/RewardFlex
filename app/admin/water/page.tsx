"use client";
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/hooks/use-toast";
import { adminFetch } from "@/lib/fetch";

interface PendingTask {
  _id: string;
  drinkWaterPhotoUrl?: string;
  imageBase64?: string;
  userId?: { name: string; email: string };
}

export default function AdminWaterPage() {
  const { user, hydrated, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [tasks, setTasks] = useState<PendingTask[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await adminFetch("/admin/water-pending");
      const data = await res.json();
      if (res.ok && data.success) setTasks(data.tasks || []);
      else throw new Error(data.error || "Failed to load tasks");
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to load tasks", variant: "destructive" });
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
    fetchData();
  }, [hydrated, user, router, authLoading]);

  const handleAction = async (taskId: string, action: "approve" | "reject") => {
    try {
      const res = await adminFetch(`/admin/${action}-water/${taskId}`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Action failed");
      toast({ title: `Task ${action}d` });
      setTasks((prev) => prev.filter((t) => t._id !== taskId));
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Action failed", variant: "destructive" });
    }
  };

  if (authLoading || !hydrated || loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-6 grid gap-4">
      <h1 className="text-2xl font-bold">Water Verification</h1>
      <div className="grid gap-4 md:grid-cols-2">
        {tasks.length === 0 && <p className="text-muted-foreground">No pending tasks.</p>}
        {tasks.map((task) => (
          <Card key={task._id}>
            <CardHeader>
              <CardTitle>{task.userId?.name || "Member"}</CardTitle>
              <p className="text-sm text-muted-foreground">{task.userId?.email}</p>
            </CardHeader>
            <CardContent className="space-y-3">
              {task.imageBase64 ? (
                <img src={`data:image/png;base64,${task.imageBase64}`} alt="submission" className="w-full rounded" />
              ) : task.drinkWaterPhotoUrl ? (
                <img src={task.drinkWaterPhotoUrl} alt="submission" className="w-full rounded" />
              ) : (
                <p className="text-sm text-muted-foreground">No photo available.</p>
              )}
              <div className="flex gap-2">
                <Button className="flex-1" onClick={() => handleAction(task._id, "approve")}>
                  Approve
                </Button>
                <Button variant="destructive" className="flex-1" onClick={() => handleAction(task._id, "reject")}>
                  Reject
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
