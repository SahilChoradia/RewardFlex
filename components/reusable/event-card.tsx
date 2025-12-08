"use client";

import { Event } from "@/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Calendar, Percent } from "lucide-react";

interface EventCardProps {
  event: Event;
  onJoin?: (eventId: string) => void;
  delay?: number;
}

export function EventCard({ event, onJoin, delay = 0 }: EventCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      whileHover={{ scale: 1.02, y: -5 }}
    >
      <Card className="hover:border-primary/50 transition-colors">
        <CardHeader>
          <CardTitle>{event.title}</CardTitle>
          <CardDescription>{event.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>{new Date(event.date).toLocaleDateString()}</span>
            </div>
            {event.discount && (
              <div className="flex items-center gap-2 text-primary font-semibold">
                <Percent className="h-4 w-4" />
                <span>{event.discount}% OFF</span>
              </div>
            )}
          </div>
        </CardContent>
        {onJoin && (
          <CardFooter>
            <Button onClick={() => onJoin(event.id)} className="w-full" variant="outline">
              Know More
            </Button>
          </CardFooter>
        )}
      </Card>
    </motion.div>
  );
}



