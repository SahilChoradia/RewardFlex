"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { motion, AnimatePresence } from "framer-motion";
import { User, LogOut, Dumbbell, Menu, X } from "lucide-react";

export function Navbar() {
  const pathname = usePathname();
  const { isAuthenticated, role, user, logout, hydrated, loading } = useAuth();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  // Wait for loading and hydration to prevent SSR/client mismatch
  const navLinks = !loading && hydrated
    ? [
      ...(isAuthenticated
        ? role === "admin"
          ? [{ href: "/admin/dashboard", label: "Dashboard" }]
          : [
            { href: "/member/dashboard", label: "Dashboard" },
            { href: "/about", label: "About" },
            { href: "/tasks", label: "Tasks" },
            { href: "/rank", label: "Rank" },
            { href: "/rewards", label: "Rewards" },
            { href: "/events", label: "Events" },
            { href: "/subscription", label: "Subscription" },
            { href: "/ai-diet", label: "AI Diet" },
          ]
        : []),
    ]
    : [];

  const mobileLinks = navLinks;

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link
          href={isAuthenticated ? (role === "admin" ? "/admin/dashboard" : "/member/dashboard") : "/"}
          className="flex items-center space-x-2"
        >
          <Dumbbell className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold">StreakFitX</span>
        </Link>

        {/* Desktop menu */}
        <div className="hidden md:flex items-center space-x-6">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link key={link.href} href={link.href}>
                <motion.div
                  className="relative"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <span
                    className={`text-sm font-medium transition-colors hover:text-primary ${isActive ? "text-primary" : "text-muted-foreground"
                      }`}
                  >
                    {link.label}
                  </span>
                  {isActive && (
                    <motion.div
                      className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary"
                      layoutId="activeTab"
                      initial={false}
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </motion.div>
              </Link>
            );
          })}
        </div>

        {/* Desktop auth buttons */}
        <div className="hidden md:flex items-center space-x-4">
          {loading || !hydrated ? (
            <>
              <Button variant="ghost" disabled>
                <span className="opacity-50">Loading...</span>
              </Button>
            </>
          ) : isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">{user?.name}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{user?.email}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild>
                <Link href="/signup">Sign Up</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-foreground hover:text-primary focus:outline-none"
          onClick={() => setMobileOpen((prev) => !prev)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden border-t bg-background/95 backdrop-blur"
          >
            <div className="px-4 py-3 space-y-3">
              {mobileLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`block text-sm font-medium transition-colors ${pathname === link.href ? "text-primary" : "text-foreground hover:text-primary"
                    }`}
                >
                  {link.label}
                </Link>
              ))}

              <div className="pt-2 flex gap-2">
                {loading || !hydrated ? (
                  <Button variant="outline" className="flex-1" disabled>
                    Loading...
                  </Button>
                ) : isAuthenticated ? (
                  <Button variant="outline" className="flex-1" onClick={handleLogout}>
                    Logout
                  </Button>
                ) : (
                  <>
                    <Button variant="outline" className="flex-1" asChild onClick={() => setMobileOpen(false)}>
                      <Link href="/login">Login</Link>
                    </Button>
                    <Button className="flex-1" asChild onClick={() => setMobileOpen(false)}>
                      <Link href="/signup">Sign Up</Link>
                    </Button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

