export type UserRole = "visitor" | "member" | "owner" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  streak: number;
  rank: RankTier;
  subscriptionExpiry?: string;
  subscription?: {
    plan: string;
    planName?: string;
    startDate?: string;
    endDate?: string;
  } | null;
}

export type RankTier = "Bronze" | "Silver" | "Gold" | "Platinum";

export interface Task {
  id: string;
  title: string;
  description: string;
  type: "wakeup" | "water" | "exercise" | "diet";
  completed: boolean;
  link?: string;
}

export interface Reward {
  id: string;
  title: string;
  description: string;
  requiredStreak: number;
  status: "locked" | "unlocked" | "claimed";
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  discount?: number;
  gymOwnerId?: string;
  image?: string;
}

export interface Offer {
  _id?: string;
  id?: string;
  title: string;
  description?: string;
  discountPercent?: number;
  validFrom?: string;
  validUntil?: string;
  active?: boolean;
}

export interface Trainer {
  id: string;
  name: string;
  specialization: string;
  experience: string;
  availableSlots: number;
}

export interface MemberInsight {
  id: string;
  name: string;
  email: string;
  currentStreak: number;
  rank: RankTier;
  subscriptionStatus: "active" | "expired" | "none";
}

export interface SubscriptionPlan {
  _id?: string;
  id?: string;
  name: string;
  slug: string;
  price: number;
  currency: string;
  durationDays: number;
  features: string[];
  discountLabel?: string | null;
  active?: boolean;
}

