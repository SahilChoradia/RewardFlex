"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User, UserRole, RankTier } from "@/types";
import { getRankTier } from "@/lib/utils";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  role: UserRole;
  hydrated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string, role: "member" | "owner") => Promise<boolean>;
  logout: () => void;
  updateStreak: (newStreak: number) => void;
  setRank: (rank: RankTier) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // Load from localStorage on mount
    const stored = localStorage.getItem("streakfitx_user");
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse stored user", e);
      }
    }
    setHydrated(true);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Mock login - in real app, call API
    await new Promise((resolve) => setTimeout(resolve, 800));
    
    const stored = localStorage.getItem("streakfitx_user");
    if (stored) {
      const storedUser = JSON.parse(stored);
      if (storedUser.email === email) {
        setUser(storedUser);
        return true;
      }
    }
    return false;
  };

  const signup = async (
    name: string,
    email: string,
    password: string,
    role: "member" | "owner"
  ): Promise<boolean> => {
    // Mock signup - in real app, call API
    await new Promise((resolve) => setTimeout(resolve, 800));
    
    const newUser: User = {
      id: `user_${Date.now()}`,
      name,
      email,
      role: role === "member" ? "member" : "owner",
      streak: 0,
      rank: "Bronze",
    };
    
    localStorage.setItem("streakfitx_user", JSON.stringify(newUser));
    setUser(newUser);
    return true;
  };

  const logout = () => {
    localStorage.removeItem("streakfitx_user");
    setUser(null);
  };

  const updateStreak = (newStreak: number) => {
    if (!user) return;
    const newRank = getRankTier(newStreak);
    const updatedUser = { ...user, streak: newStreak, rank: newRank };
    setUser(updatedUser);
    localStorage.setItem("streakfitx_user", JSON.stringify(updatedUser));
  };

  const setRank = (rank: RankTier) => {
    if (!user) return;
    const updatedUser = { ...user, rank };
    setUser(updatedUser);
    localStorage.setItem("streakfitx_user", JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        role: user?.role || "visitor",
        hydrated,
        login,
        signup,
        logout,
        updateStreak,
        setRank,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

