"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Pencil, Trash2, Plus } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface TaskTemplate {
  _id: string;
  title: string;
  description: string;
  type: "water" | "exercise" | "diet" | "wakeup";
  points: number;
  requiresVerification: boolean;
  isActive: boolean;
}

export default function AdminTasksPage() {
  const { user, hydrated, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [templates, setTemplates] = useState<TaskTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<TaskTemplate | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "water" as "water" | "exercise" | "diet" | "wakeup",
    points: 1,
    requiresVerification: false,
    isActive: true,
  });
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  useEffect(() => {
    if (authLoading || !hydrated) return;
    const token = localStorage.getItem("streakfitx_token") || localStorage.getItem("token");
    if (!token || !user || user.role !== "admin") {
      router.push("/login");
      return;
    }
    fetchTemplates();
  }, [hydrated, user, router, authLoading]);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("streakfitx_token") || localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/admin/task-templates`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.success) setTemplates(data.templates || []);
    } catch (err) {
      toast({ title: "Error", description: "Failed to load task templates", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    const token = localStorage.getItem("streakfitx_token") || localStorage.getItem("token");
    if (!token) return;
    if (!formData.title || !formData.description) {
      toast({
        title: "Missing fields",
        description: "Title and description are required.",
        variant: "destructive",
      });
      return;
    }
    try {
      const url = editingTemplate
        ? `${API_BASE}/admin/task-templates/${editingTemplate._id}`
        : `${API_BASE}/admin/task-templates`;
      const method = editingTemplate ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Operation failed");
      toast({ title: "Success", description: `Template ${editingTemplate ? "updated" : "created"} successfully` });
      resetForm();
      setIsDialogOpen(false);
      fetchTemplates();
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Operation failed", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this task template?")) return;
    const token = localStorage.getItem("streakfitx_token") || localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/admin/task-templates/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Delete failed");
      toast({ title: "Success", description: "Template deleted successfully" });
      fetchTemplates();
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Delete failed", variant: "destructive" });
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      type: "water",
      points: 1,
      requiresVerification: false,
      isActive: true,
    });
    setEditingTemplate(null);
  };

  const openEditDialog = (template: TaskTemplate) => {
    setEditingTemplate(template);
    setFormData({
      title: template.title,
      description: template.description,
      type: template.type,
      points: template.points,
      requiresVerification: template.requiresVerification,
      isActive: template.isActive,
    });
    setIsDialogOpen(true);
  };

  if (authLoading || !hydrated || loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Task Templates Management</h1>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="mr-2 h-4 w-4" />
              Add Template
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingTemplate ? "Edit Template" : "Create Template"}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <Input
                placeholder="Title *"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
              <Textarea
                placeholder="Description *"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
              <Select value={formData.type} onValueChange={(value: any) => setFormData({ ...formData, type: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Task Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="water">Water</SelectItem>
                  <SelectItem value="exercise">Exercise</SelectItem>
                  <SelectItem value="diet">Diet</SelectItem>
                  <SelectItem value="wakeup">Wake Up</SelectItem>
                </SelectContent>
              </Select>
              <Input
                type="number"
                placeholder="Points"
                value={formData.points}
                onChange={(e) => setFormData({ ...formData, points: Number(e.target.value) })}
              />
              <div className="flex items-center space-x-2">
                <Switch
                  id="requiresVerification"
                  checked={formData.requiresVerification}
                  onCheckedChange={(checked) => setFormData({ ...formData, requiresVerification: checked })}
                />
                <Label htmlFor="requiresVerification">Requires Verification</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                />
                <Label htmlFor="isActive">Active</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setIsDialogOpen(false);
                resetForm();
              }}>
                Cancel
              </Button>
              <Button onClick={handleSubmit}>
                {editingTemplate ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {templates.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No task templates found. Create your first template!
            </CardContent>
          </Card>
        ) : (
          templates.map((template) => (
            <Card key={template._id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-lg">{template.title}</h3>
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded uppercase">
                        {template.type}
                      </span>
                      {template.isActive ? (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Active</span>
                      ) : (
                        <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">Inactive</span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{template.description}</p>
                    <div className="flex gap-4 text-xs text-muted-foreground">
                      <span>Points: {template.points}</span>
                      {template.requiresVerification && <span>Requires Verification</span>}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => openEditDialog(template)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(template._id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}






