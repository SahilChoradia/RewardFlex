"use client";

import { Task } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { CheckCircle2, Circle, Camera, Link as LinkIcon, Sparkles, Loader2 } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { CameraModal } from "@/components/reusable/camera-modal";

interface TaskCardEnhancedProps {
  task: Task;
  onComplete: (taskId: string, validationData?: any) => void;
  onLinkSave?: (taskId: string, link: string) => void;
  delay?: number;
  isWakeUpDisabled?: boolean;
  todayDiet?: any;
  onDietGenerated?: () => void;
}

/**
 * Enhanced Task Card with strict validation rules
 */
export function TaskCardEnhanced({
  task,
  onComplete,
  onLinkSave,
  delay = 0,
  isWakeUpDisabled = false,
  todayDiet = null,
  onDietGenerated,
}: TaskCardEnhancedProps) {
  const [link, setLink] = useState(task.link || "");
  const [linkError, setLinkError] = useState("");
  const [cameraOpen, setCameraOpen] = useState(false);
  const [isProcessingCapture, setIsProcessingCapture] = useState(false);
  const [isOpeningCamera, setIsOpeningCamera] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  /**
   * VALIDATION 1: Wake Up Task - Time Check
   * Only completable before 8:00 AM
   */
  const handleWakeUpComplete = () => {
    const now = new Date();
    const currentHour = now.getHours();
    
    if (currentHour > 8) {
      toast({
        title: "Too Late!",
        description: "Wake up task can only be completed before 8:00 AM.",
        variant: "destructive",
      });
      return;
    }
    
    onComplete(task.id);
    toast({
      title: "Wake Up Task Completed!",
      description: "Great start to your day!",
    });
  };

  /**
   * VALIDATION 2: Drink Water Task - Camera Only Bottle Detection
   * NO GALLERY UPLOAD - Camera capture only
   * Validate captured image contains bottle using TensorFlow.js
   */
  const handleCameraOpen = () => {
    setIsOpeningCamera(true);
    setCameraOpen(true);
    // small delay to allow modal mount before removing opening state
    setTimeout(() => setIsOpeningCamera(false), 300);
  };

  const handleCameraCapture = async (imageBlob: Blob) => {
    setIsProcessingCapture(true);
    try {
      // No bottle validation: admin will verify later
      onComplete(task.id, { imageBlob });
      setCameraOpen(false);
      toast({
        title: "Photo Captured",
        description: "Submission received. Admin will verify the bottle.",
      });
    } catch (error) {
      console.error("Capture error:", error);
      toast({
        title: "Capture Failed",
        description: "Failed to save photo. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessingCapture(false);
    }
  };

  /**
   * VALIDATION 3: Exercise Task - Link Validation
   * Only YouTube or Google Drive links allowed
   */
  const validateExerciseLink = (url: string): boolean => {
    const validPattern = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be|drive\.google\.com)\/.+$/;
    return validPattern.test(url.trim());
  };

  const handleLinkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLink(value);
    
    if (value.trim() && !validateExerciseLink(value)) {
      setLinkError("Only Google Drive or YouTube links are accepted.");
    } else {
      setLinkError("");
    }
  };

  const handleSaveLink = () => {
    if (!link.trim()) {
      toast({
        title: "Link Required",
        description: "Please enter a valid link.",
        variant: "destructive",
      });
      return;
    }

    if (!validateExerciseLink(link)) {
      toast({
        title: "Invalid Link",
        description: "Only Google Drive or YouTube links are accepted.",
        variant: "destructive",
      });
      return;
    }

    if (onLinkSave) {
      onLinkSave(task.id, link);
      onComplete(task.id, { link });
      toast({
        title: "Exercise Task Completed!",
        description: "Your exercise link has been saved.",
      });
    }
  };

  /**
   * VALIDATION 4: Diet Task - AI Generation with 7-day Rotation
   * Redirect to AI Diet Planner, then check for today's diet
   */
  const handleDietGeneration = () => {
    router.push("/ai-diet");
  };

  const handleDietComplete = () => {
    if (!todayDiet) {
      toast({
        title: "Diet Not Generated",
        description: "Please generate today's diet first using the AI Diet Planner.",
        variant: "destructive",
      });
      return;
    }

    onComplete(task.id, { diet: todayDiet });
    toast({
      title: "Diet Task Completed!",
      description: "Great job following your meal plan!",
    });
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
          {/* WAKE UP TASK */}
          {task.type === "wakeup" && !task.completed && (
            <div className="space-y-2">
              <Button
                onClick={handleWakeUpComplete}
                className="w-full"
                disabled={isWakeUpDisabled}
              >
                {isWakeUpDisabled ? "Too Late - Task Locked" : "Mark as Completed"}
              </Button>
              {isWakeUpDisabled && (
                <p className="text-sm text-destructive">
                  Wake up task can only be completed before 8:00 AM.
                </p>
              )}
            </div>
          )}

          {/* DRINK WATER TASK - CAMERA ONLY */}
          {task.type === "water" && !task.completed && (
            <div className="space-y-4">
              <Button
                onClick={handleCameraOpen}
                className="w-full"
                variant="outline"
                disabled={isProcessingCapture || isOpeningCamera}
              >
                {isOpeningCamera ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Opening Camera...
                  </>
                ) : (
                  <>
                    <Camera className="h-4 w-4 mr-2" />
                    Open Camera
                  </>
                )}
              </Button>
              <p className="text-xs text-muted-foreground">
                Camera access required. No gallery upload allowed. Admin will verify the photo.
              </p>
              
              {/* Camera Modal */}
              <CameraModal
                open={cameraOpen}
                onOpenChange={setCameraOpen}
                onCapture={handleCameraCapture}
                isProcessing={isProcessingCapture}
              />
            </div>
          )}

          {/* EXERCISE TASK */}
          {task.type === "exercise" && !task.completed && (
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  placeholder="Enter YouTube or Google Drive link"
                  value={link}
                  onChange={handleLinkChange}
                  className={`flex-1 ${linkError ? "border-destructive" : ""}`}
                />
                <Button
                  onClick={handleSaveLink}
                  size="sm"
                  disabled={!!linkError || !link.trim()}
                >
                  <LinkIcon className="h-4 w-4 mr-2" />
                  Save
                </Button>
              </div>
              {linkError && (
                <p className="text-sm text-destructive">{linkError}</p>
              )}
            </div>
          )}

          {/* DIET TASK */}
          {task.type === "diet" && !task.completed && (
            <div className="space-y-4">
              {!todayDiet ? (
                <>
                  <Button onClick={handleDietGeneration} className="w-full">
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate Today's Diet using AI
                  </Button>
                  <p className="text-sm text-muted-foreground">
                    Generate your personalized diet plan first, then mark as completed.
                  </p>
                </>
              ) : (
                <>
                  <div className="space-y-2 p-4 bg-card rounded-md border">
                    <h4 className="font-semibold text-sm">Today's Diet Plan:</h4>
                    <div className="text-sm space-y-1">
                      <p><strong>Breakfast:</strong> {todayDiet.breakfast}</p>
                      <p><strong>Lunch:</strong> {todayDiet.lunch}</p>
                      <p><strong>Snack:</strong> {todayDiet.snack}</p>
                      <p><strong>Dinner:</strong> {todayDiet.dinner}</p>
                    </div>
                  </div>
                  <Button onClick={handleDietComplete} className="w-full">
                    Mark Diet as Followed
                  </Button>
                </>
              )}
            </div>
          )}

          {/* Completed State */}
          {task.completed && (
            <div className="text-sm text-primary font-medium">Completed ✓</div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

