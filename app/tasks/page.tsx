"use client";

/* eslint-disable react/no-unescaped-entities */

import { useState, useEffect, useCallback } from "react";
import { RouteGuard } from "@/components/auth/route-guard";
import { Task } from "@/types";
import { TaskCardEnhanced } from "@/components/reusable/task-card-enhanced";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2 } from "lucide-react";
import { getTodayDiet } from "@/lib/diet-storage";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import API_BASE from "@/lib/api";

export default function TasksPage() {
  const { loading: authLoading, hydrated } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [todayDiet, setTodayDiet] = useState<any>(null);
  const [isWakeUpDisabled, setIsWakeUpDisabled] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  // Check wake-up time validation on mount and every minute
  useEffect(() => {
    const checkWakeUpTime = () => {
      const now = new Date();
      const currentHour = now.getHours();
      setIsWakeUpDisabled(currentHour > 8);
    };

    checkWakeUpTime();
    const interval = setInterval(checkWakeUpTime, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  // Load today's diet from storage
  useEffect(() => {
    const diet = getTodayDiet();
    if (diet) {
      setTodayDiet(diet);
    }
  }, []);

  // Listen for diet generation from AI Diet page
  useEffect(() => {
    const handleStorageChange = () => {
      const diet = getTodayDiet();
      if (diet) {
        setTodayDiet(diet);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    // Also check on focus (when returning from AI Diet page)
    window.addEventListener("focus", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("focus", handleStorageChange);
    };
  }, []);

  const mapTaskDoc = useCallback((doc: any): Task[] => {
    return [
      {
        id: "wakeup",
        title: "Wake Up",
        description: "Start your day right with an early wake-up",
        type: "wakeup",
        completed: !!doc.wakeupCompleted,
      },
      {
        id: "water",
        title: "Drink Water",
        description: "Stay hydrated! Drink at least 8 glasses of water",
        type: "water",
        completed: !!doc.drinkWaterVerified,
      },
      {
        id: "exercise",
        title: "Exercise / Pushups",
        description: "Complete your daily workout routine",
        type: "exercise",
        completed: !!doc.exerciseCompleted,
        link: doc.exerciseLink || "",
      },
      {
        id: "diet",
        title: "Diet Followed",
        description: "Stick to your meal plan for the day",
        type: "diet",
        completed: !!doc.dietCompleted,
      },
    ];
  }, []);

  const fetchTodayTask = useCallback(async () => {
    // DO NOT check auth until loading === false
    if (authLoading || !hydrated) return;
    try {
      setLoading(true);
      const token = localStorage.getItem("streakfitx_token") || localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }
      const res = await fetch(`${API_BASE}/tasks/today`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to load tasks");
      }
      setTasks(mapTaskDoc(data.task));
    } catch (error: any) {
      console.error("Load tasks error:", error);
      toast({ title: "Error", description: error?.message || "Failed to load tasks", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [API_BASE, mapTaskDoc, router, toast, authLoading, hydrated]);

  useEffect(() => {
    fetchTodayTask();
  }, [fetchTodayTask]);

  /**
   * Handle task completion with validation
   * Calls backend endpoints and updates task state from server response
   */
  const handleComplete = async (taskId: string, validationData?: any) => {
    try {
      const token = localStorage.getItem("streakfitx_token") || localStorage.getItem("token");
      if (!token) {
        toast({ title: "Not authenticated", description: "Please login again.", variant: "destructive" });
        return;
      }

      const task = tasks.find((t) => t.id === taskId);
      if (!task) return;

      let res;
      let data;

      if (task.type === "wakeup") {
        res = await fetch(`${API_BASE}/tasks/wakeup`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        });
        data = await res.json();
      } else if (task.type === "water") {
        if (!validationData?.imageBlob) {
          toast({ title: "Photo required", description: "Please capture a water photo first.", variant: "destructive" });
          return;
        }
        const formData = new FormData();
        formData.append("photo", validationData.imageBlob, "water-task.png");
        res = await fetch(`${API_BASE}/tasks/drink-water`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });
        data = await res.json();
      } else if (task.type === "exercise") {
        if (!validationData?.link) {
          toast({ title: "Link required", description: "Enter a valid exercise link.", variant: "destructive" });
          return;
        }
        res = await fetch(`${API_BASE}/tasks/exercise`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ link: validationData.link }),
        });
        data = await res.json();
      } else if (task.type === "diet") {
        res = await fetch(`${API_BASE}/tasks/diet-complete`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        });
        data = await res.json();
      }

      if (!res?.ok || !data?.success) {
        throw new Error(data?.error || "Task update failed");
      }

      if (data.task) {
        setTasks(mapTaskDoc(data.task));
      }

      toast({ title: "Task updated", description: "Progress saved successfully." });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "Could not update task.",
        variant: "destructive",
      });
    }
  };

  const handleLinkSave = (_taskId: string, _link: string) => {
    // handled via backend in handleComplete
  };

  const completedCount = tasks.filter((t) => t.completed).length;
  const totalCount = tasks.length;
  const progressPercent = totalCount ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <RouteGuard allowedRoles={["member"]}>
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-2">Daily Tasks</h1>
          <p className="text-muted-foreground mb-6">
            Complete all tasks with validations to maintain your streak!
          </p>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Today's Progress</CardTitle>
              <CardDescription>
                {completedCount}/{totalCount || 4} tasks completed
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span className="font-semibold">
                    {progressPercent}%
                  </span>
                </div>
                <div className="w-full bg-secondary rounded-full h-3">
                  <motion.div
                    className="bg-primary h-3 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercent}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>
              {completedCount === totalCount && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mt-4 flex items-center gap-2 text-primary font-semibold"
                >
                  <CheckCircle2 className="h-5 w-5" />
                  <span>All tasks completed! Your streak is safe.</span>
                </motion.div>
              )}
            </CardContent>
          </Card>

          {loading ? (
            <p className="text-muted-foreground">Loading tasks...</p>
          ) : (
            <div className="space-y-4">
              {tasks.map((task, index) => (
                <TaskCardEnhanced
                  key={task.id}
                  task={task}
                  onComplete={handleComplete}
                  onLinkSave={handleLinkSave}
                  delay={index * 0.1}
                  isWakeUpDisabled={isWakeUpDisabled}
                  todayDiet={todayDiet}
                  onDietGenerated={() => {
                    const diet = getTodayDiet();
                    if (diet) setTodayDiet(diet);
                  }}
                />
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </RouteGuard>
  );
}
