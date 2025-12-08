"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Target,
  Trophy,
  Sparkles,
  BarChart3,
  Dumbbell,
} from "lucide-react";
import Link from "next/link";
import { HeroVideo } from "@/components/HeroVideo";

export function LandingPage() {

  const features = [
    {
      icon: Target,
      title: "Daily Tasks & Streaks",
      description: "Complete daily fitness tasks and build consistent habits with streak tracking.",
    },
    {
      icon: Trophy,
      title: "Rank & Rewards System",
      description: "Earn ranks based on your streaks and unlock exclusive rewards and discounts.",
    },
    {
      icon: Sparkles,
      title: "AI Diet Planner",
      description: "Get personalized diet plans powered by AI based on your goals and preferences.",
    },
    {
      icon: BarChart3,
      title: "Gym Owner Dashboard",
      description: "Monitor member engagement, manage events, and offer targeted rewards.",
    },
  ];

  const steps = [
    {
      step: 1,
      title: "Create Account",
      description: "Sign up as a member or gym owner to get started.",
    },
    {
      step: 2,
      title: "Complete Daily Tasks",
      description: "Track your workouts, water intake, and diet every day.",
    },
    {
      step: 3,
      title: "Earn Rewards",
      description: "Build streaks, climb ranks, and unlock exclusive benefits.",
    },
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Gym Member",
      content: "StreakFitX has completely transformed my fitness routine. The streak system keeps me motivated!",
    },
    {
      name: "Mike Chen",
      role: "Member",
      content: "The dashboard helps me understand my progress better and stay consistent.",
    },
    {
      name: "Emily Davis",
      role: "Gym Member",
      content: "I love the AI diet planner. It's personalized and makes meal planning so much easier.",
    },
  ];

  return (
    <div className="flex flex-col">
      {/* Hero Section with Video Background */}
      <HeroVideo />

      {/* Feature Highlights */}
      <section className="py-20 bg-card">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold mb-4">Why Choose StreakFitX?</h2>
            <p className="text-xl text-muted-foreground">
              Everything you need to build lasting fitness habits
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                >
                  <Card className="h-full hover:border-primary/50 transition-colors">
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
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-xl text-muted-foreground">Get started in three simple steps</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {steps.map((step, index) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="text-center"
              >
                <div className="relative mb-6">
                  <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto">
                    <span className="text-2xl font-bold text-primary">{step.step}</span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className="hidden md:block absolute top-8 left-[60%] w-full h-0.5 bg-border" />
                  )}
                </div>
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-card">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold mb-4">What Our Users Say</h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02, y: -5 }}
              >
                <Card>
                  <CardHeader>
                    <CardDescription className="text-base">{testimonial.content}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h2 className="text-4xl font-bold mb-4">Ready to Start Your Fitness Journey?</h2>
            <p className="text-xl text-muted-foreground mb-8">
              Join thousands of members building better habits every day
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="text-lg px-8 py-6" asChild>
                <Link href="/signup">Get Started Free</Link>
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8 py-6" asChild>
                <Link href="/about">Learn More</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}



