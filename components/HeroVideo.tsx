"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Dumbbell } from "lucide-react";
import { useRouter } from "next/navigation";

const videoSources = [
  "https://videos.pexels.com/video-files/855334/855334-hd_1280_720_24fps.mp4",
  "https://videos.pexels.com/video-files/3823066/3823066-hd_1920_1080_24fps.mp4",
  "https://videos.pexels.com/video-files/3195398/3195398-hd_1920_1080_24fps.mp4",
  "https://videos.pexels.com/video-files/5319760/5319760-hd_1920_1080_25fps.mp4",
];

const ROTATION_INTERVAL = 10000; // 10 seconds (between 8-12 sec range)

export function HeroVideo() {
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [videoError, setVideoError] = useState(false);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const router = useRouter();

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentVideoIndex((prev) => (prev + 1) % videoSources.length);
    }, ROTATION_INTERVAL);

    return () => clearInterval(interval);
  }, []);

  const handleVideoError = () => {
    setVideoError(true);
  };

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Video Background Container */}
      <div className="absolute inset-0 w-full h-full">
        <AnimatePresence mode="wait">
          {!videoError && (
            <motion.div
              key={currentVideoIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5 }}
              className="absolute inset-0 w-full h-full"
            >
              <video
                ref={(el) => {
                  videoRefs.current[currentVideoIndex] = el;
                }}
                autoPlay
                loop
                muted
                playsInline
                className="absolute inset-0 w-full h-full object-cover"
                onError={handleVideoError}
                onLoadedData={() => {
                  // Ensure video plays
                  const video = videoRefs.current[currentVideoIndex];
                  if (video) {
                    video.play().catch(() => {
                      // Handle autoplay restrictions
                    });
                  }
                }}
              >
                <source src={videoSources[currentVideoIndex]} type="video/mp4" />
              </video>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Fallback Image */}
        {videoError && (
          <div
            className="absolute inset-0 w-full h-full bg-cover bg-center"
            style={{
              backgroundImage:
                "url('https://images.pexels.com/photos/416475/pexels-photo-416475.jpeg?auto=compress&cs=tinysrgb&w=1920')",
            }}
          />
        )}

        {/* Dark Overlay Gradient (50-70% opacity) */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70" />
      </div>

      {/* Hero Content */}
      <div className="container mx-auto px-4 py-20 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-4xl mx-auto"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="inline-block mb-6"
          >
            <Dumbbell className="h-16 w-16 text-primary mx-auto" />
          </motion.div>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Turn Your Gym Streaks Into Real Rewards
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-10">
            Track habits, earn ranks, unlock discounts, and stay consistent with your fitness
            journey.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="text-lg px-8 py-6"
              onClick={() => router.push("/signup?role=member")}
            >
              Start as Member
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-lg px-8 py-6"
              onClick={() => router.push("/signup?role=owner")}
            >
              Start as Gym Owner
            </Button>
            <Button
              size="lg"
              variant="ghost"
              className="text-lg px-8 py-6"
              onClick={() => router.push("/events")}
            >
              Browse as Visitor
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

