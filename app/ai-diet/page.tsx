 "use client";

import { useState } from "react";
import { RouteGuard } from "@/components/auth/route-guard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AIDietPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    age: "",
    weight: "",
    height: "",
    gender: "",
    activityLevel: "",
    goal: "",
    dietPreference: "",
    allergies: "",
  });
  const [dietPlan, setDietPlan] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const handleGenerateDiet = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setDietPlan(null);

    // Strict validation
    const ageNum = Number(formData.age);
    const weightNum = Number(formData.weight);
    const heightNum = Number(formData.height);

    if (!ageNum || !weightNum || !heightNum) {
      toast({
        title: "Invalid input",
        description: "All values must be greater than zero.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    if (ageNum < 16) {
      toast({
        title: "Invalid age",
        description: "Age must be at least 16 years.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    if (weightNum <= 30) {
      toast({
        title: "Invalid weight",
        description: "Weight must be greater than 30 kg.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    if (heightNum <= 100) {
      toast({
        title: "Invalid height",
        description: "Height must be above 100 cm.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/ai/diet`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          age: ageNum,
          weight: weightNum,
          height: heightNum,
          gender: formData.gender,
          goal: formData.goal,
          activityLevel: formData.activityLevel,
          foodPreference: formData.dietPreference === "veg" ? "Vegetarian" : formData.dietPreference === "vegan" ? "Vegan" : "Non-Vegetarian",
          allergies: formData.allergies || "",
        }),
      });

      const data = await res.json();
      setIsLoading(false);

      if (!data.success) {
        toast({
          title: "Error",
          description: data.error || "AI diet generation failed",
          variant: "destructive",
        });
        return;
      }

      setDietPlan(data.diet);
      toast({
        title: "Diet Plan Generated!",
        description: "Your personalized AI diet plan is ready.",
      });
    } catch (err: any) {
      setIsLoading(false);
      console.error("Diet error:", err);
      toast({
        title: "Network Error",
        description: "Network error — AI request failed. Please check your connection.",
        variant: "destructive",
      });
    }
  };

  const handleRegenerate = async () => {
    setDietPlan(null);
    setIsLoading(true);
    
    const ageNum = Number(formData.age);
    const weightNum = Number(formData.weight);
    const heightNum = Number(formData.height);

    if (!ageNum || !weightNum || !heightNum || ageNum < 16 || weightNum <= 30 || heightNum <= 100) {
      toast({
        title: "Invalid Input",
        description: "Please fill all fields with valid values before regenerating.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/ai/diet`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          age: ageNum,
          weight: weightNum,
          height: heightNum,
          gender: formData.gender,
          goal: formData.goal,
          activityLevel: formData.activityLevel,
          foodPreference: formData.dietPreference === "veg" ? "Vegetarian" : formData.dietPreference === "vegan" ? "Vegan" : "Non-Vegetarian",
          allergies: formData.allergies || "",
        }),
      });

      const data = await res.json();
      setIsLoading(false);

      if (!data.success) {
        toast({
          title: "Error",
          description: data.error || "AI diet generation failed",
          variant: "destructive",
        });
        return;
      }

      setDietPlan(data.diet);
      toast({
        title: "Diet Plan Regenerated!",
        description: "A new personalized AI diet plan has been generated.",
      });
    } catch (err: any) {
      setIsLoading(false);
      console.error("Diet error:", err);
      toast({
        title: "Network Error",
        description: "Network error — AI request failed. Please check your connection.",
        variant: "destructive",
      });
    }
  };

  return (
    <RouteGuard allowedRoles={["member"]}>
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-3 mb-8">
            <Sparkles className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-4xl font-bold">AI Diet Planner</h1>
              <p className="text-muted-foreground">Get a personalized diet plan based on your goals</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Your Information</CardTitle>
                <CardDescription>Fill in your details to generate a personalized diet plan</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleGenerateDiet} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="age">Age</Label>
                      <Input
                        id="age"
                        type="number"
                        placeholder="25"
                        value={formData.age}
                        onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="weight">Weight (kg)</Label>
                      <Input
                        id="weight"
                        type="number"
                        placeholder="70"
                        value={formData.weight}
                        onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="height">Height (cm)</Label>
                    <Input
                      id="height"
                      type="number"
                      placeholder="175"
                      value={formData.height}
                      onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender</Label>
                    <Select
                      value={formData.gender}
                      onValueChange={(value) => setFormData({ ...formData, gender: value })}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="activityLevel">Activity Level</Label>
                    <Select
                      value={formData.activityLevel}
                      onValueChange={(value) => setFormData({ ...formData, activityLevel: value })}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select activity level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sedentary">Sedentary</SelectItem>
                        <SelectItem value="light">Lightly Active</SelectItem>
                        <SelectItem value="moderate">Moderately Active</SelectItem>
                        <SelectItem value="active">Very Active</SelectItem>
                        <SelectItem value="very-active">Extremely Active</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="goal">Goal</Label>
                    <Select
                      value={formData.goal}
                      onValueChange={(value) => setFormData({ ...formData, goal: value })}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select goal" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="lose">Lose Weight</SelectItem>
                        <SelectItem value="gain">Gain Weight</SelectItem>
                        <SelectItem value="maintain">Maintain Weight</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dietPreference">Diet Preference</Label>
                    <Select
                      value={formData.dietPreference}
                      onValueChange={(value) => setFormData({ ...formData, dietPreference: value })}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select preference" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="veg">Vegetarian</SelectItem>
                        <SelectItem value="non-veg">Non-Vegetarian</SelectItem>
                        <SelectItem value="vegan">Vegan</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="allergies">Allergies (optional)</Label>
                    <Textarea
                      id="allergies"
                      placeholder="List any food allergies or restrictions"
                      value={formData.allergies}
                      onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating Plan...
                      </>
                    ) : (
                      "Generate Diet Plan"
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <div>
              {isLoading ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Generating Your Diet Plan</CardTitle>
                    <CardDescription>Please wait while we create your personalized plan</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Skeleton className="h-32" />
                    <Skeleton className="h-32" />
                    <Skeleton className="h-32" />
                    <Skeleton className="h-32" />
                  </CardContent>
                </Card>
              ) : dietPlan ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle>Your AI-Generated Diet Plan</CardTitle>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={handleRegenerate}>
                            Regenerate
                          </Button>
                          <Button variant="default" size="sm" onClick={() => router.push("/tasks")}>
                            Back to Tasks
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="prose prose-sm max-w-none whitespace-pre-wrap text-muted-foreground">
                        {dietPlan}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ) : (
                <Card>
                  <CardContent className="py-12 text-center text-muted-foreground">
                    <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Fill in the form to generate your personalized diet plan</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </RouteGuard>
  );
}


