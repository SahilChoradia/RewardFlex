"use client";

import { useState, useEffect } from "react";
import { RouteGuard } from "@/components/auth/route-guard";
import { useAuth } from "@/contexts/auth-context";
import { Task } from "@/types";
import { TaskCardEnhanced } from "@/components/reusable/task-card-enhanced";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, Flame } from "lucide-react";
import { getTodayDiet, hasTodayDiet } from "@/lib/diet-storage";
import { useRouter } from "next/navigation";

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
  const [todayDiet, setTodayDiet] = useState<any>(null);
  const [isWakeUpDisabled, setIsWakeUpDisabled] = useState(false);
  const { user, updateStreak } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

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

  /**
   * Handle task completion with validation
   * All 4 tasks must pass their respective validations before completion
   */
  const handleComplete = (taskId: string, validationData?: any) => {
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id === taskId) {
          return { ...task, completed: true, ...validationData };
        }
        return task;
      })
    );
  };

  const handleLinkSave = (taskId: string, link: string) => {
    setTasks((prev) =>
      prev.map((task) => (task.id === taskId ? { ...task, link } : task))
    );
  };

  /**
   * Check if all tasks are completed with validations
   * Only increase streak when ALL 4 validations passed:
   * 1. Wakeup done before 8am
   * 2. Bottle detected in image
   * 3. Valid video link (YouTube/Drive)
   * 4. AI Diet generated + confirmed + not repeat within 7 days
   */
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
          <p className="text-muted-foreground mb-6">
            Complete all tasks with validations to maintain your streak!
          </p>

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
        </motion.div>
      </div>
    </RouteGuard>
  );
}
