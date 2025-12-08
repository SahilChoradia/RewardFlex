"use client";

/* eslint-disable react/no-unescaped-entities */

import { useState } from "react";
import { RouteGuard } from "@/components/auth/route-guard";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { mockAPI } from "@/lib/mock-api";
import { Trainer } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Edit, User } from "lucide-react";

export default function OwnerTrainersPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTrainer, setEditingTrainer] = useState<Trainer | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    specialization: "",
    experience: "",
    availableSlots: "",
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: trainers, isLoading } = useQuery({
    queryKey: ["trainers"],
    queryFn: () => mockAPI.fetchTrainers(),
  });

  const createTrainer = useMutation({
    mutationFn: async (trainer: Omit<Trainer, "id">) => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return { ...trainer, id: `trainer_${Date.now()}` };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trainers"] });
      toast({ title: "Trainer added!", description: "The trainer has been added successfully." });
      setDialogOpen(false);
      resetForm();
    },
  });

  const deleteTrainer = useMutation({
    mutationFn: async (trainerId: string) => {
      await new Promise((resolve) => setTimeout(resolve, 300));
      return trainerId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trainers"] });
      toast({ title: "Trainer removed!", description: "The trainer has been removed." });
    },
  });

  const resetForm = () => {
    setFormData({ name: "", specialization: "", experience: "", availableSlots: "" });
    setEditingTrainer(null);
  };

  const handleEdit = (trainer: Trainer) => {
    setEditingTrainer(trainer);
    setFormData({
      name: trainer.name,
      specialization: trainer.specialization,
      experience: trainer.experience,
      availableSlots: trainer.availableSlots.toString(),
    });
    setDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTrainer) {
      toast({ title: "Trainer updated!", description: "The trainer information has been updated." });
    } else {
      createTrainer.mutate({
        name: formData.name,
        specialization: formData.specialization,
        experience: formData.experience,
        availableSlots: parseInt(formData.availableSlots),
      });
    }
  };

  return (
    <RouteGuard allowedRoles={["owner"]}>
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold mb-2">Manage Trainers</h1>
              <p className="text-muted-foreground">Add and manage trainers for your gym</p>
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Trainer
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingTrainer ? "Edit Trainer" : "Add New Trainer"}</DialogTitle>
                  <DialogDescription>
                    Fill in the trainer's information to add them to your gym.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="specialization">Specialization</Label>
                    <Input
                      id="specialization"
                      value={formData.specialization}
                      onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="experience">Experience</Label>
                    <Input
                      id="experience"
                      value={formData.experience}
                      onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="availableSlots">Available Slots</Label>
                    <Input
                      id="availableSlots"
                      type="number"
                      min="0"
                      value={formData.availableSlots}
                      onChange={(e) => setFormData({ ...formData, availableSlots: e.target.value })}
                      required
                    />
                  </div>
                  <div className="flex gap-4">
                    <Button type="submit" className="flex-1">
                      {editingTrainer ? "Update" : "Add"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setDialogOpen(false);
                        resetForm();
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-48" />
              ))}
            </div>
          ) : trainers && trainers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trainers.map((trainer, index) => (
                <motion.div
                  key={trainer.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02, y: -5 }}
                >
                  <Card>
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <User className="h-10 w-10 text-primary" />
                        <div>
                          <CardTitle>{trainer.name}</CardTitle>
                          <CardDescription>{trainer.specialization}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 mb-4">
                        <div className="text-sm">
                          <span className="text-muted-foreground">Experience: </span>
                          <span className="font-semibold">{trainer.experience}</span>
                        </div>
                        <div className="text-sm">
                          <span className="text-muted-foreground">Available Slots: </span>
                          <span className="font-semibold">{trainer.availableSlots}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(trainer)}
                          className="flex-1"
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => deleteTrainer.mutate(trainer.id)}
                          className="flex-1"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No trainers yet. Add your first trainer!</p>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>
    </RouteGuard>
  );
}






