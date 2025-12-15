"use client";
/* eslint-disable react-hooks/exhaustive-deps */

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/hooks/use-toast";
import { adminFetch } from "@/lib/fetch";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Pencil, Trash2, Plus } from "lucide-react";

interface Event {
  _id: string;
  title: string;
  description: string;
  date: string;
  location: string;
}

export default function AdminEventsPage() {
  const { user, hydrated, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    location: "",
  });

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await adminFetch("/admin/events");
      const data = await res.json();
      if (res.ok && data.success) setEvents(data.events || []);
    } catch (err) {
      toast({ title: "Error", description: "Failed to load events", variant: "destructive" });
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
    fetchEvents();
  }, [hydrated, user, router, authLoading]);

  const handleSubmit = async () => {
    if (!formData.title || !formData.date) {
      toast({
        title: "Missing fields",
        description: "Title and Date are required.",
        variant: "destructive",
      });
      return;
    }
    try {
      const url = editingEvent
        ? `/admin/events/${editingEvent._id}`
        : `/admin/events`;
      const method = editingEvent ? "PUT" : "POST";
      const res = await adminFetch(url, {
        method,
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Operation failed");
      toast({ title: "Success", description: `Event ${editingEvent ? "updated" : "created"} successfully` });
      resetForm();
      setIsDialogOpen(false);
      fetchEvents();
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Operation failed", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this event?")) return;
    try {
      const res = await adminFetch(`/admin/events/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        toast({ title: "Success", description: "Event deleted successfully" });
        fetchEvents(); // refresh UI
      } else {
        toast({ title: "Error", description: data.error || "Delete failed", variant: "destructive" });
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Delete failed", variant: "destructive" });
    }
  };

  const resetForm = () => {
    setFormData({ title: "", description: "", date: "", location: "" });
    setEditingEvent(null);
  };

  const openEditDialog = (event: Event) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      description: event.description,
      date: new Date(event.date).toISOString().split("T")[0],
      location: event.location,
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
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingEvent ? "Edit Event" : "Create Event"}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <Input
                placeholder="Title *"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
              <Textarea
                placeholder="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
              <Input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
              <Input
                placeholder="Location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setIsDialogOpen(false);
                resetForm();
              }}>
                Cancel
              </Button>
              <Button onClick={handleSubmit}>
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
          events.map((event) => (
            <Card key={event._id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-2">
                    <h3 className="font-semibold text-lg">{event.title}</h3>
                    <p className="text-sm text-muted-foreground">{event.description}</p>
                    <div className="flex gap-4 text-xs text-muted-foreground">
                      <span>{new Date(event.date).toLocaleDateString()}</span>
                      <span>{event.location}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => openEditDialog(event)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(event._id)}>
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
