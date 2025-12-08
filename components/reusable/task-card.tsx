"use client";

import { Task } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { CheckCircle2, Circle, Camera, Link as LinkIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";

interface TaskCardProps {
  task: Task;
  onComplete: (taskId: string) => void;
  onLinkSave?: (taskId: string, link: string) => void;
  delay?: number;
}

export function TaskCard({ task, onComplete, onLinkSave, delay = 0 }: TaskCardProps) {
  const [link, setLink] = useState(task.link || "");
  const [showCamera, setShowCamera] = useState(false);

  const handleOpenCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setShowCamera(true);
      // In a real app, you'd handle the video stream here
      // For now, we'll just show a placeholder
      setTimeout(() => {
        stream.getTracks().forEach((track) => track.stop());
        setShowCamera(false);
        onComplete(task.id);
      }, 2000);
    } catch (error) {
      console.error("Error accessing camera:", error);
    }
  };

  const handleSaveLink = () => {
    if (onLinkSave && link.trim()) {
      onLinkSave(task.id, link);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <Card className={task.completed ? "border-primary/50 bg-primary/5" : ""}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {task.completed ? (
                <CheckCircle2 className="h-6 w-6 text-primary" />
              ) : (
                <Circle className="h-6 w-6 text-muted-foreground" />
              )}
              <div>
                <CardTitle className="text-lg">{task.title}</CardTitle>
                <CardDescription>{task.description}</CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {task.type === "exercise" && !task.completed ? (
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  placeholder="Enter YouTube/Drive link"
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={handleSaveLink} size="sm">
                  <LinkIcon className="h-4 w-4 mr-2" />
                  Save
                </Button>
              </div>
            </div>
          ) : task.type === "water" && !task.completed ? (
            <Button onClick={handleOpenCamera} className="w-full" variant="outline">
              <Camera className="h-4 w-4 mr-2" />
              Open Camera
            </Button>
          ) : !task.completed ? (
            <Button onClick={() => onComplete(task.id)} className="w-full">
              Mark as Completed
            </Button>
          ) : (
            <div className="text-sm text-primary font-medium">Completed ✓</div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}






