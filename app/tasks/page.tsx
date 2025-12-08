"use client";

import { useState, useEffect } from "react";
import { RouteGuard } from "@/components/auth/route-guard";
import { useAuth } from "@/contexts/auth-context";
import { Task } from "@/types";
import { TaskCard } from "@/components/reusable/task-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, Flame } from "lucide-react";

const initialTasks: Task[] = [
  {
    id: "1",
    title: "Wake Up",
    description: "Start your day right with an early wake-up",
    type: "wakeup",
    completed: false,
  },
  {
    id: "2",
    title: "Drink Water",
    description: "Stay hydrated! Drink at least 8 glasses of water",
    type: "water",
    completed: false,
  },
  {
    id: "3",
    title: "Exercise / Pushups",
    description: "Complete your daily workout routine",
    type: "exercise",
    completed: false,
    link: "",
  },
  {
    id: "4",
    title: "Diet Followed",
    description: "Stick to your meal plan for the day",
    type: "diet",
    completed: false,
  },
];

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const { user, updateStreak } = useAuth();
  const { toast } = useToast();

  // Load tasks from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("streakfitx_tasks");
    if (stored) {
      try {
        const storedTasks = JSON.parse(stored);
        // Check if tasks are for today
        const today = new Date().toDateString();
        const lastDate = localStorage.getItem("streakfitx_tasks_date");
        if (lastDate === today) {
          setTasks(storedTasks);
        } else {
          // Reset tasks for new day
          localStorage.setItem("streakfitx_tasks", JSON.stringify(initialTasks));
          localStorage.setItem("streakfitx_tasks_date", today);
        }
      } catch (e) {
        console.error("Failed to load tasks", e);
      }
    }
  }, []);

  // Save tasks to localStorage
  useEffect(() => {
    localStorage.setItem("streakfitx_tasks", JSON.stringify(tasks));
    const today = new Date().toDateString();
    localStorage.setItem("streakfitx_tasks_date", today);
  }, [tasks]);

  const handleComplete = (taskId: string) => {
    setTasks((prev) =>
      prev.map((task) => (task.id === taskId ? { ...task, completed: true } : task))
    );
  };

  const handleLinkSave = (taskId: string, link: string) => {
    setTasks((prev) =>
      prev.map((task) => (task.id === taskId ? { ...task, link, completed: true } : task))
    );
    toast({
      title: "Link saved!",
      description: "Your exercise link has been saved.",
    });
  };

  // Check if all tasks are completed
  useEffect(() => {
    const allCompleted = tasks.every((task) => task.completed);
    if (allCompleted && tasks.length > 0) {
      const today = new Date().toDateString();
      const lastStreakDate = localStorage.getItem("streakfitx_streak_date");
      
      if (lastStreakDate !== today) {
        const newStreak = (user?.streak || 0) + 1;
        updateStreak(newStreak);
        localStorage.setItem("streakfitx_streak_date", today);
        toast({
          title: "🎉 Streak Increased!",
          description: `Your streak is now ${newStreak} days! Keep it up!`,
        });
      }
    }
  }, [tasks, user, updateStreak, toast]);

  const completedCount = tasks.filter((t) => t.completed).length;
  const totalCount = tasks.length;

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
          <p className="text-muted-foreground mb-6">Complete all tasks to maintain your streak!</p>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Today's Progress</CardTitle>
              <CardDescription>
                {completedCount}/{totalCount} tasks completed
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span className="font-semibold">
                    {Math.round((completedCount / totalCount) * 100)}%
                  </span>
                </div>
                <div className="w-full bg-secondary rounded-full h-3">
                  <motion.div
                    className="bg-primary h-3 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${(completedCount / totalCount) * 100}%` }}
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

          <div className="space-y-4">
            {tasks.map((task, index) => (
              <TaskCard
                key={task.id}
                task={task}
                onComplete={handleComplete}
                onLinkSave={handleLinkSave}
                delay={index * 0.1}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </RouteGuard>
  );
}



