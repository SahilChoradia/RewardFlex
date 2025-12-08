/**
 * Diet storage utilities for managing diet history and 7-day rotation check
 */

export interface DietPlan {
  breakfast: string;
  lunch: string;
  snack: string;
  dinner: string;
  macros: { protein: number; carbs: number; fats: number };
  date: string; // ISO date string
}

const STORAGE_KEY = "streakfitx_diet_history";
const MAX_HISTORY_DAYS = 7;

/**
 * Get diet history from localStorage
 */
export function getDietHistory(): DietPlan[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    return JSON.parse(stored);
  } catch (e) {
    console.error("Failed to load diet history", e);
    return [];
  }
}

/**
 * Save diet plan to history
 */
export function saveDietToHistory(diet: DietPlan): void {
  try {
    const history = getDietHistory();
    const updated = [diet, ...history].slice(0, MAX_HISTORY_DAYS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error("Failed to save diet history", e);
  }
}

/**
 * Check if diet matches any of the last 7 days
 * @param diet - Diet plan to check
 * @returns true if diet matches a recent entry
 */
export function isDietDuplicate(diet: DietPlan): boolean {
  const history = getDietHistory();
  const last7Diets = history.slice(0, MAX_HISTORY_DAYS);
  
  return last7Diets.some((storedDiet) => {
    return (
      storedDiet.breakfast === diet.breakfast &&
      storedDiet.lunch === diet.lunch &&
      storedDiet.snack === diet.snack &&
      storedDiet.dinner === diet.dinner
    );
  });
}

/**
 * Get today's diet if it exists
 */
export function getTodayDiet(): DietPlan | null {
  const history = getDietHistory();
  const today = new Date().toISOString().split("T")[0];
  return history.find((diet) => diet.date === today) || null;
}

/**
 * Check if user has generated diet for today
 */
export function hasTodayDiet(): boolean {
  return getTodayDiet() !== null;
}




