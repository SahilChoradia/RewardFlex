"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Target, Trophy, Users, Heart, Mail, Send } from "lucide-react";

export default function AboutPage() {
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    message: "",
  });
  const { toast } = useToast();

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would call an API
    toast({
      title: "Message sent!",
      description: "Thank you for contacting us. We'll get back to you soon.",
    });
    setContactForm({ name: "", email: "", message: "" });
  };

  const features = [
    {
      icon: Target,
      title: "Habit Building",
      description: "Build consistent fitness habits through daily task tracking and streak management.",
    },
    {
      icon: Trophy,
      title: "Gamified Motivation",
      description: "Earn ranks, unlock rewards, and stay motivated with our gamification system.",
    },
    {
      icon: Users,
      title: "Community Support",
      description: "Join a community of fitness enthusiasts working towards their goals together.",
    },
    {
      icon: Heart,
      title: "Personalized Experience",
      description: "Get AI-powered diet plans and personalized recommendations based on your goals.",
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Why StreakFitX Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-16"
      >
        <h1 className="text-4xl font-bold mb-4">Why StreakFitX?</h1>
        <p className="text-xl text-muted-foreground mb-8">
          We're on a mission to make fitness habits stick through gamification, rewards, and
          community support.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.1 }}
                whileHover={{ scale: 1.02, y: -5 }}
              >
                <Card>
                  <CardHeader>
                    <Icon className="h-10 w-10 text-primary mb-4" />
                    <CardTitle>{feature.title}</CardTitle>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardHeader>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </motion.section>

      {/* Mission Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="mb-16"
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Our Mission</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-lg">
            <p>
              At StreakFitX, we believe that building lasting fitness habits shouldn't be a
              struggle. Our platform combines the power of gamification, rewards, and community to
              help you stay consistent with your fitness journey.
            </p>
            <p>
              Whether you're a gym member looking to build better habits or a gym owner wanting to
              engage and reward your members, StreakFitX provides the tools you need to succeed.
            </p>
            <p>
              We're committed to making fitness accessible, enjoyable, and rewarding for everyone.
            </p>
          </CardContent>
        </Card>
      </motion.section>

      {/* Contact Section */}
      <motion.section
        id="contact"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Mail className="h-6 w-6 text-primary" />
              <CardTitle className="text-3xl">Contact Us</CardTitle>
            </div>
            <CardDescription>Have questions? We'd love to hear from you!</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleContactSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="contact-name">Name</Label>
                <Input
                  id="contact-name"
                  type="text"
                  placeholder="Your name"
                  value={contactForm.name}
                  onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact-email">Email</Label>
                <Input
                  id="contact-email"
                  type="email"
                  placeholder="you@example.com"
                  value={contactForm.email}
                  onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact-message">Message</Label>
                <Textarea
                  id="contact-message"
                  placeholder="Your message"
                  value={contactForm.message}
                  onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                  required
                  rows={5}
                />
              </div>
              <Button type="submit" className="w-full">
                <Send className="mr-2 h-4 w-4" />
                Send Message
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.section>
    </div>
  );
}




