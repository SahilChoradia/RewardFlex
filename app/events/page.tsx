"use client";

import { useAuth } from "@/contexts/auth-context";
import { useQuery } from "@tanstack/react-query";
import { mockAPI } from "@/lib/mock-api";
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
import { useState } from "react";
import { Event } from "@/types";

export default function EventsPage() {
  const { role } = useAuth();
  const { toast } = useToast();
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  const { data: events, isLoading } = useQuery({
    queryKey: ["events"],
    queryFn: () => mockAPI.fetchEvents(),
  });

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





