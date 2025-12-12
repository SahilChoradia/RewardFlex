"use client";
/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Pencil, Trash2, Plus } from "lucide-react";
import API_BASE from "@/lib/api";

interface AdminEvent {
  _id: string;
  title: string;
  description: string;
  shortDescription?: string;
  fullDescription?: string;
  date: string;
  location?: string;
  image?: string;
  discountPercent?: number;
}

export default function AdminEventsPage() {
  const { user, hydrated, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [events, setEvents] = useState<AdminEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<AdminEvent | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    shortDescription: "",
    fullDescription: "",
    date: "",
    location: "",
    image: "",
    discountPercent: 0,
  });

  useEffect(() => {
    if (authLoading || !hydrated) return;
    const token = localStorage.getItem("streakfitx_token") || localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    if (!user || user.role !== "admin") {
      router.push("/login");
      return;
    }
    fetchEvents();
  }, [hydrated, user, router, authLoading]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("streakfitx_token") || localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/admin/events`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.success) setEvents(data.events || []);
    } catch (err) {
      toast({ title: "Error", description: "Failed to load events", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    const token = localStorage.getItem("streakfitx_token") || localStorage.getItem("token");
    if (!token) return;
    if (!formData.title || !formData.description || !formData.date) {
      toast({
        title: "Missing fields",
        description: "Title, description, and date are required.",
        variant: "destructive",
      });
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/admin/events`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Create failed");
      toast({ title: "Success", description: "Event created successfully" });
      resetForm();
      setIsDialogOpen(false);
      fetchEvents();
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Create failed", variant: "destructive" });
    }
  };

  const handleUpdate = async () => {
    if (!editingEvent) return;
    const token = localStorage.getItem("streakfitx_token") || localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/admin/events/${editingEvent._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Update failed");
      toast({ title: "Success", description: "Event updated successfully" });
      resetForm();
      setIsDialogOpen(false);
      setEditingEvent(null);
      fetchEvents();
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Update failed", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this event?")) return;
    const token = localStorage.getItem("streakfitx_token") || localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/admin/events/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Delete failed");
      toast({ title: "Success", description: "Event deleted successfully" });
      fetchEvents();
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Delete failed", variant: "destructive" });
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      shortDescription: "",
      fullDescription: "",
      date: "",
      location: "",
      image: "",
      discountPercent: 0,
    });
    setEditingEvent(null);
  };

  const openEditDialog = (event: AdminEvent) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      description: event.description,
      shortDescription: event.shortDescription || "",
      fullDescription: event.fullDescription || "",
      date: event.date ? new Date(event.date).toISOString().split("T")[0] : "",
      location: event.location || "",
      image: event.image || "",
      discountPercent: event.discountPercent || 0,
    });
    setIsDialogOpen(true);
  };

  if (authLoading || !hydrated || loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Events Management</h1>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="mr-2 h-4 w-4" />
              Add Event
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingEvent ? "Edit Event" : "Create Event"}</DialogTitle>
              <DialogDescription>
                {editingEvent ? "Update event details" : "Add a new event to the platform"}
              </DialogDescription>
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
              <Textarea
                placeholder="Short Description (optional)"
                value={formData.shortDescription}
                onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
              />
              <Textarea
                placeholder="Full Description (optional)"
                value={formData.fullDescription}
                onChange={(e) => setFormData({ ...formData, fullDescription: e.target.value })}
              />
              <Input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
              <Input
                placeholder="Location (optional)"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
              <Input
                placeholder="Image URL (optional)"
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              />
              <Input
                type="number"
                placeholder="Discount % (optional)"
                value={formData.discountPercent}
                onChange={(e) => setFormData({ ...formData, discountPercent: Number(e.target.value) })}
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setIsDialogOpen(false);
                resetForm();
              }}>
                Cancel
              </Button>
              <Button onClick={editingEvent ? handleUpdate : handleCreate}>
                {editingEvent ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {events.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No events found. Create your first event!
            </CardContent>
          </Card>
        ) : (
          events.map((ev) => (
            <Card key={ev._id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-2">
                    <h3 className="font-semibold text-lg">{ev.title}</h3>
                    <p className="text-sm text-muted-foreground">{ev.description}</p>
                    <div className="flex gap-4 text-xs text-muted-foreground">
                      {ev.date && <span>Date: {new Date(ev.date).toLocaleDateString()}</span>}
                      {ev.location && <span>Location: {ev.location}</span>}
                      {ev.discountPercent && <span>Discount: {ev.discountPercent}%</span>}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => openEditDialog(ev)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(ev._id)}>
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
