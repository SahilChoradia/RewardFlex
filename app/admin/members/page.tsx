"use client";
/* eslint-disable react-hooks/exhaustive-deps */

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/hooks/use-toast";
import { adminFetch } from "@/lib/fetch";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Pencil, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";

interface UserData {
  _id: string;
  name: string;
  email: string;
  role: string;
  streak: number;
}

export default function AdminMembersPage() {
  const { user, hydrated, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<UserData | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "member",
    streak: 0,
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await adminFetch("/admin/users");
      const data = await res.json();
      if (res.ok && data.success) setUsers(data.users || []);
    } catch (err) {
      toast({ title: "Error", description: "Failed to load users", variant: "destructive" });
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
    fetchData();
  }, [hydrated, user, router, authLoading]);

  const handleUpdate = async () => {
    if (!editingUser) return;
    try {
      const res = await adminFetch(`/admin/users/${editingUser._id}`, {
        method: "PUT",
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Update failed");
      toast({ title: "Success", description: "User updated successfully" });
      setIsDialogOpen(false);
      setEditingUser(null);
      fetchData();
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Update failed", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    try {
      const res = await adminFetch(`/admin/users/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        toast({ title: "Success", description: "User deleted successfully" });
        fetchData();
      } else {
        toast({ title: "Error", description: data.error || "Delete failed", variant: "destructive" });
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Delete failed", variant: "destructive" });
    }
  };

  const openEditDialog = (user: UserData) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      streak: user.streak,
    });
    setIsDialogOpen(true);
  };

  if (authLoading || !hydrated || loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">User Management</h1>
      </div>

      <div className="grid gap-4">
        {users.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No users found.
            </CardContent>
          </Card>
        ) : (
          users.map((u) => (
            <Card key={u._id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-lg">{u.name}</h3>
                      <span className={`text-xs px-2 py-1 rounded ${u.role === "admin" ? "bg-purple-100 text-purple-800" : "bg-gray-100 text-gray-800"}`}>
                        {u.role}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{u.email}</p>
                    <p className="text-xs text-muted-foreground">Streak: {u.streak} days</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => openEditDialog(u)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(u._id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        setIsDialogOpen(open);
        if (!open) setEditingUser(null);
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          {editingUser && (
            <div className="space-y-4 py-4">
              <Input
                placeholder="Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
              <Input
                placeholder="Email"
                value={formData.email}
                disabled
              />
              <Select
                value={formData.role}
                onValueChange={(value) => setFormData({ ...formData, role: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="member">Member</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
              <Input
                type="number"
                placeholder="Streak"
                value={formData.streak}
                onChange={(e) => setFormData({ ...formData, streak: Number(e.target.value) })}
              />
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdate}>Update</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
