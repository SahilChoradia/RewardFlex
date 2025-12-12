"use client";
/* eslint-disable react-hooks/exhaustive-deps */

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/hooks/use-toast";
import API_BASE from "@/lib/api";
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

interface Offer {
  _id: string;
  title: string;
  description: string;
  discountPercent: number;
  validFrom?: string;
  validUntil?: string;
  active: boolean;
}

export default function AdminOffersPage() {
  const { user, hydrated, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    discountPercent: 0,
    validFrom: "",
    validUntil: "",
    active: true,
  });

  useEffect(() => {
    if (authLoading || !hydrated) return;
    const token = localStorage.getItem("streakfitx_token") || localStorage.getItem("token");
    if (!token || !user || user.role !== "admin") {
      router.push("/login");
      return;
    }
    fetchOffers();
  }, [hydrated, user, router, authLoading]);

  const fetchOffers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/offers/admin/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.success) setOffers(data.offers || []);
    } catch (err) {
      toast({ title: "Error", description: "Failed to load offers", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    const token = localStorage.getItem("streakfitx_token") || localStorage.getItem("token");
    if (!token) return;
    if (!formData.title) {
      toast({
        title: "Missing fields",
        description: "Title is required.",
        variant: "destructive",
      });
      return;
    }
    try {
      const url = editingOffer
        ? `${API_BASE}/offers/admin/${editingOffer._id}`
        : `${API_BASE}/offers/admin/create`;
      const method = editingOffer ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          discountPercent: formData.discountPercent,
          validFrom: formData.validFrom || null,
          validUntil: formData.validUntil || null,
          active: formData.active,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Operation failed");
      toast({ title: "Success", description: `Offer ${editingOffer ? "updated" : "created"} successfully` });
      resetForm();
      setIsDialogOpen(false);
      fetchOffers();
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Operation failed", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this offer?")) return;
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/offers/admin/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        toast({ title: "Success", description: "Offer deleted successfully" });
        fetchOffers(); // refresh UI
      } else {
        toast({ title: "Error", description: data.error || "Delete failed", variant: "destructive" });
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Delete failed", variant: "destructive" });
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      discountPercent: 0,
      validFrom: "",
      validUntil: "",
      active: true,
    });
    setEditingOffer(null);
  };

  const openEditDialog = (offer: Offer) => {
    setEditingOffer(offer);
    setFormData({
      title: offer.title,
      description: offer.description,
      discountPercent: offer.discountPercent,
      validFrom: offer.validFrom ? new Date(offer.validFrom).toISOString().split("T")[0] : "",
      validUntil: offer.validUntil ? new Date(offer.validUntil).toISOString().split("T")[0] : "",
      active: offer.active,
    });
    setIsDialogOpen(true);
  };

  if (authLoading || !hydrated || loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Offers Management</h1>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="mr-2 h-4 w-4" />
              Add Offer
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingOffer ? "Edit Offer" : "Create Offer"}</DialogTitle>
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
                type="number"
                placeholder="Discount %"
                value={formData.discountPercent}
                onChange={(e) => setFormData({ ...formData, discountPercent: Number(e.target.value) })}
              />
              <Input
                type="date"
                placeholder="Valid From"
                value={formData.validFrom}
                onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
              />
              <Input
                type="date"
                placeholder="Valid Until"
                value={formData.validUntil}
                onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
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
                {editingOffer ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {offers.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No offers found. Create your first offer!
            </CardContent>
          </Card>
        ) : (
          offers.map((offer) => (
            <Card key={offer._id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-lg">{offer.title}</h3>
                    {offer.active ? (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Active</span>
                      ) : (
                        <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">Inactive</span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{offer.description}</p>
                    <div className="flex gap-4 text-xs text-muted-foreground">
                      <span>Discount: {offer.discountPercent}%</span>
                    {offer.validFrom && <span>From: {new Date(offer.validFrom).toLocaleDateString()}</span>}
                    {offer.validUntil && <span>Until: {new Date(offer.validUntil).toLocaleDateString()}</span>}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => openEditDialog(offer)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(offer._id)}>
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




