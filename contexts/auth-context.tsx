"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User, UserRole, RankTier } from "@/types";
import { getRankTier } from "@/lib/utils";
import { API_BASE } from "@/lib/api";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  role: UserRole;
  hydrated: boolean;
  loading: boolean;
  signup: (name: string, email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  verifyOtp: (email: string, otp: string) => Promise<{ success: boolean; message?: string }>;
  login: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; message?: string; role?: UserRole }>;
  logout: () => void;
  updateStreak: (newStreak: number) => void;
  setRank: (rank: RankTier) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [loading, setLoading] = useState(true);


  const mapUser = (dataUser: any): User => ({
    id: dataUser._id || dataUser.id,
    name: dataUser.name,
    email: dataUser.email,
    role: (dataUser.role || "member") as UserRole,
    streak: dataUser.streak || 0,
    rank: dataUser.rank || "Bronze",
    subscription: dataUser.subscription || null,
  });

  const refreshUser = async () => {
    try {
      // We don't check for token in localStorage anymore as we use httpOnly cookies
      const res = await fetch(`${API_BASE}/auth/me`, {
        // No Authorization header needed, browser sends cookie
        credentials: 'include',
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.user) {
          const loggedUser: User = mapUser(data.user);
          setUser(loggedUser);
          localStorage.setItem("streakfitx_user", JSON.stringify(loggedUser));
        } else {
          setUser(null);
          localStorage.removeItem("streakfitx_user");
        }
      } else if (res.status === 401 || res.status === 403) {
        setUser(null);
        localStorage.removeItem("streakfitx_user");
      } else {
        console.error("Failed to verify token:", res.status);
      }
    } catch (err) {
      console.error("Auto-auth error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Auto-authenticate on mount using token
    const autoAuth = async () => {
      await refreshUser();
      // Loading is handled in refreshUser finally block
      setHydrated(true);
    };

    autoAuth();
  }, []);

  const signup = async (name: string, email: string, password: string) => {
    try {
      const res = await fetch(`${API_BASE}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
        credentials: 'include',
      });

      // Check if response is ok before parsing JSON
      if (!res.ok) {
        let errorData;
        try {
          errorData = await res.json();
        } catch {
          errorData = { error: `Server error: ${res.status} ${res.statusText}` };
        }
        console.error("Signup error:", errorData);
        return { success: false, message: errorData.error || "Signup failed" };
      }

      const data = await res.json();
      console.log("✅ Signup success:", data);
      return { success: true, message: data.message || "Registered successfully. Verify OTP/Proceed to Login" };
    } catch (err: any) {
      console.error("❌ Signup network error:", err);
      return {
        success: false,
        message: err.message || "Network error. Please check your connection and try again."
      };
    }
  };

  const verifyOtp = async (email: string, otp: string) => {
    try {
      const res = await fetch(`${API_BASE}/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
        credentials: 'include',
      });

      // Check if response is ok before parsing JSON
      if (!res.ok) {
        let errorData;
        try {
          errorData = await res.json();
        } catch {
          errorData = { error: `Server error: ${res.status} ${res.statusText}` };
        }
        return { success: false, message: errorData.error || "OTP verification failed" };
      }

      const data = await res.json();
      return { success: true, message: data.message || "Account verified" };
    } catch (err: any) {
      console.error("❌ Verify OTP network error:", err);
      return { success: false, message: err.message || "Network error. Please check your connection." };
    }
  };

  const login = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; message?: string; role?: UserRole }> => {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      });

      // Check if response is ok before parsing JSON
      if (!res.ok) {
        let errorData;
        try {
          errorData = await res.json();
        } catch {
          errorData = { error: `Server error: ${res.status} ${res.statusText}` };
        }
        console.error("Login error:", errorData);
        return {
          success: false,
          message: errorData.error || "Login failed. Please check your credentials."
        };
      }

      const data = await res.json();

      if (!data.success) {
        return {
          success: false,
          message: data.error || "Login failed. Please check your credentials."
        };
      }

      const loggedUser: User = mapUser(data.user);

      // Do NOT store token in localStorage (using httpOnly cookies)
      // Remove any old tokens if they exist
      localStorage.removeItem("streakfitx_token");
      localStorage.removeItem("token");

      localStorage.setItem("streakfitx_user", JSON.stringify(loggedUser));
      setUser(loggedUser);

      console.log("✅ Login successful");
      return { success: true, role: loggedUser.role };
    } catch (err: any) {
      console.error("❌ Login network error:", err);
      return {
        success: false,
        message: err.message || "Network error. Please check your connection and try again."
      };
    }
  };

  const logout = async () => {
    try {
      await fetch(`${API_BASE}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout error:", error);
    }

    localStorage.removeItem("streakfitx_token");
    localStorage.removeItem("token");
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

  const contextValue = React.useMemo(
    () => ({
      user,
      isAuthenticated: !!user,
      role: user?.role || "visitor",
      hydrated,
      loading,
      login,
      signup,
      verifyOtp,
      logout,
      updateStreak,
      setRank,
      refreshUser,
    }),
    [user, hydrated, loading]
  );

  // Show loading state until auth check is complete
  if (loading) {
    return null; // or return a loader component
  }

  return (
    <AuthContext.Provider value={contextValue}>
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

