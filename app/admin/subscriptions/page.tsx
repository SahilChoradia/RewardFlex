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
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface SubscriptionPlan {
  _id: string;
  name: string;
  slug: string;
  price: number;
  currency: string;
  durationDays: number;
  features: string[];
  discountLabel?: string | null;
  active: boolean;
}

export default function AdminSubscriptionsPage() {
  const { user, hydrated, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    price: 0,
    currency: "INR",
    durationDays: 30,
    features: "",
    discountLabel: "",
    active: true,
  });

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const res = await adminFetch("/subscription/admin/all");
      const data = await res.json();
      if (res.ok && data.success) setPlans(data.plans || []);
    } catch (err) {
      toast({ title: "Error", description: "Failed to load subscription plans", variant: "destructive" });
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
    fetchPlans();
  }, [hydrated, user, router, authLoading]);

  const handleSubmit = async () => {
    if (!formData.name || !formData.slug || !formData.price || !formData.durationDays) {
      toast({
        title: "Missing fields",
        description: "Name, slug, price, and duration are required.",
        variant: "destructive",
      });
      return;
    }
    try {
      const url = editingPlan
        ? `/subscription/admin/${editingPlan._id}`
        : `/subscription/admin/create`;
      const method = editingPlan ? "PUT" : "POST";
      const featuresArray = formData.features
        .split(/[\n,]/)
        .map((f) => f.trim())
        .filter(Boolean);
      const res = await adminFetch(url, {
        method,
        body: JSON.stringify({
          name: formData.name,
          slug: formData.slug,
          price: formData.price,
          currency: formData.currency,
          durationDays: formData.durationDays,
          features: featuresArray,
          discountLabel: formData.discountLabel || null,
          active: formData.active,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Operation failed");
      toast({ title: "Success", description: `Plan ${editingPlan ? "updated" : "created"} successfully` });
      resetForm();
      setIsDialogOpen(false);
      fetchPlans();
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Operation failed", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this subscription plan?")) return;
    try {
      const res = await adminFetch(`/subscription/admin/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Delete failed");
      toast({ title: "Success", description: "Plan deleted successfully" });
      fetchPlans();
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Delete failed", variant: "destructive" });
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      slug: "",
      price: 0,
      currency: "INR",
      durationDays: 30,
      features: "",
      discountLabel: "",
      active: true,
    });
    setEditingPlan(null);
  };

  const openEditDialog = (plan: SubscriptionPlan) => {
    setEditingPlan(plan);
    setFormData({
      name: plan.name,
      slug: plan.slug,
      price: plan.price,
      currency: plan.currency,
      durationDays: plan.durationDays,
      features: plan.features.join("\n"),
      discountLabel: plan.discountLabel || "",
      active: plan.active,
    });
    setIsDialogOpen(true);
  };

  if (authLoading || !hydrated || loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Subscription Plans Management</h1>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="mr-2 h-4 w-4" />
              Add Plan
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingPlan ? "Edit Plan" : "Create Plan"}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <Input
                placeholder="Plan Name *"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
              <Input
                placeholder="Slug (unique) *"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              />
              <Input
                type="number"
                placeholder="Price *"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
              />
              <Input
                placeholder="Currency"
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
              />
              <Input
                type="number"
                placeholder="Duration (days) *"
                value={formData.durationDays}
                onChange={(e) => setFormData({ ...formData, durationDays: Number(e.target.value) })}
              />
              <Textarea
                placeholder="Features (comma or newline separated)"
                value={formData.features}
                onChange={(e) => setFormData({ ...formData, features: e.target.value })}
              />
              <Input
                placeholder="Discount label (optional, e.g. 15% OFF)"
                value={formData.discountLabel}
                onChange={(e) => setFormData({ ...formData, discountLabel: e.target.value })}
              />
              <div className="flex items-center space-x-2">
                <Switch
                  id="active"
                  checked={formData.active}
                  onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
                />
                <Label htmlFor="active">Active</Label>
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
                {editingPlan ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {plans.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No subscription plans found. Create your first plan!
            </CardContent>
          </Card>
        ) : (
          plans.map((plan) => (
            <Card key={plan._id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-lg">{plan.name}</h3>
                      {plan.active ? (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Active</span>
                      ) : (
                        <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">Inactive</span>
                      )}
                    </div>
                    <div className="flex gap-4 text-sm">
                      <span className="font-semibold">{plan.currency} {plan.price}</span>
                      <span className="text-muted-foreground">{plan.durationDays} days</span>
                      <span className="text-muted-foreground lowercase">slug: {plan.slug}</span>
                      {plan.discountLabel && <span className="text-muted-foreground">{plan.discountLabel}</span>}
                    </div>
                    {plan.features.length > 0 && (
                      <ul className="text-sm text-muted-foreground list-disc list-inside">
                        {plan.features.map((feature, idx) => (
                          <li key={idx}>{feature}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => openEditDialog(plan)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(plan._id)}>
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
