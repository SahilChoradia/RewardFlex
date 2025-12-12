"use client";

import { useAuth } from "@/contexts/auth-context";
import { EventCard } from "@/components/reusable/event-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { Calendar } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { Event, Offer } from "@/types";

export default function EventsPage() {
  const { role } = useAuth();
  const { toast } = useToast();
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [offersLoading, setOffersLoading] = useState(true);
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  useEffect(() => {
    const loadEvents = async () => {
      try {
        const res = await fetch(`${API_BASE}/events/all`);
        const data = await res.json();
        if (res.ok && data.success) {
          const mapped: Event[] = (data.events || []).map((e: any) => ({
            id: e._id || e.id,
            title: e.title,
            description: e.description || e.fullDescription || e.shortDescription,
            date: e.date,
            discount: e.discountPercent,
            gymOwnerId: e.createdBy || "admin",
            image: e.image,
          }));
          setEvents(mapped);
        }
      } finally {
        setIsLoading(false);
      }
    };
    const loadOffers = async () => {
      try {
        const res = await fetch(`${API_BASE}/offers/all`);
        const data = await res.json();
        if (res.ok && data.success) {
          setOffers(data.offers || []);
        }
      } finally {
        setOffersLoading(false);
      }
    };
    loadEvents();
    loadOffers();
  }, [API_BASE]);

  const handleKnowMore = (event: Event) => {
    setSelectedEvent(event);
  };

  const handleJoin = () => {
    if (!selectedEvent) return;
    toast({
      title: "Event Joined!",
      description: "You've successfully joined this event. Check your email for details.",
    });
    setSelectedEvent(null);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Events & Offers</h1>
            <p className="text-muted-foreground">
              Discover exciting events and exclusive offers from gym owners
            </p>
          </div>
          {role === "owner" && (
            <Button asChild>
              <Link href="/owner/events">Manage Events</Link>
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-64" />
            ))}
          </div>
        ) : events && events.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event, index) => (
              <EventCard
                key={event.id}
                event={event}
                onJoin={() => handleKnowMore(event)}
                delay={index * 0.1}
              />
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No events available at the moment.</p>
          </motion.div>
        )}
      </motion.div>

      <div className="mt-12">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold">Offers</h2>
          <span className="text-sm text-muted-foreground">Latest deals for members</span>
        </div>
        {offersLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2].map((i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        ) : offers && offers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {offers.map((offer) => (
              <Card key={offer._id} className="border-primary/40">
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">{offer.title}</h3>
                      {typeof offer.discountPercent === "number" && offer.discountPercent > 0 && (
                        <p className="text-primary font-medium">{offer.discountPercent}% OFF</p>
                      )}
                    </div>
                  </div>
                  {offer.description && (
                    <p className="text-sm text-muted-foreground">{offer.description}</p>
                  )}
                  {(offer.validFrom || offer.validUntil) && (
                    <p className="text-xs text-muted-foreground">
                      Valid{" "}
                      {offer.validFrom ? `from ${new Date(offer.validFrom).toLocaleDateString()}` : ""}{" "}
                      {offer.validUntil ? `until ${new Date(offer.validUntil).toLocaleDateString()}` : ""}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-10 text-center text-muted-foreground">
              No offers right now. Check back soon!
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={!!selectedEvent} onOpenChange={(open) => !open && setSelectedEvent(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedEvent?.title}</DialogTitle>
            <DialogDescription>
              {selectedEvent ? new Date(selectedEvent.date).toLocaleDateString() : ""}
            </DialogDescription>
          </DialogHeader>
          {selectedEvent && (
            <Card>
              <CardContent className="space-y-3 pt-4">
                <p className="text-sm text-muted-foreground">{selectedEvent.description}</p>
                {selectedEvent.discount && (
                  <p className="text-sm font-semibold text-primary">
                    Offer: {selectedEvent.discount}% OFF
                  </p>
                )}
                {selectedEvent.gymOwnerId && (
                  <p className="text-sm text-muted-foreground">
                    Host: {selectedEvent.gymOwnerId}
                  </p>
                )}
                <Button className="w-full" onClick={handleJoin}>
                  Join Event
                </Button>
              </CardContent>
            </Card>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}





