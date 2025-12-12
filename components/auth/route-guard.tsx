"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { UserRole } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import Link from "next/link";
import { Lock } from "lucide-react";

interface RouteGuardProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  redirectTo?: string;
}

export function RouteGuard({ children, allowedRoles, redirectTo = "/login" }: RouteGuardProps) {
  const { isAuthenticated, role, hydrated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // DO NOT check auth until loading === false
    if (loading || !hydrated) return;
    if (!isAuthenticated || !allowedRoles.includes(role)) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, role, allowedRoles, redirectTo, router, hydrated, loading]);

  // Wait for loading and hydration before deciding access
  if (loading || !hydrated) {
    return null;
  }

  if (!isAuthenticated || !allowedRoles.includes(role)) {
    return (
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-md"
        >
          <Card>
            <CardHeader className="text-center">
              <Lock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <CardTitle>Access Restricted</CardTitle>
              <CardDescription>
                {!isAuthenticated
                  ? "You need to be logged in to access this page."
                  : "You don't have permission to access this page."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!isAuthenticated ? (
                <>
                  <Button asChild className="w-full">
                    <Link href="/login">Login</Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/signup">Sign Up as Member</Link>
                  </Button>
                </>
              ) : (
                <Button asChild className="w-full">
                  <Link href="/">Go to Home</Link>
                </Button>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return <>{children}</>;
}






