import { Event, Reward, Trainer, MemberInsight, SubscriptionPlan } from "@/types";

// Simulate API delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const mockAPI = {
  async fetchEvents(): Promise<Event[]> {
    await delay(800);
    return [
      {
        id: "1",
        title: "Summer Fitness Challenge",
        description: "Join our 30-day summer challenge and get 20% off on all supplements!",
        date: "2024-07-01",
        discount: 20,
        gymOwnerId: "owner1",
      },
      {
        id: "2",
        title: "New Year Transformation",
        description: "Start your new year with a 15% discount on personal training sessions.",
        date: "2024-12-31",
        discount: 15,
        gymOwnerId: "owner1",
      },
    ];
  },

  async fetchRewards(streak: number): Promise<Reward[]> {
    await delay(600);
    return [
      {
        id: "1",
        title: "5% Subscription Discount",
        description: "Get 5% off on your next subscription renewal",
        requiredStreak: 7,
        status: streak >= 7 ? (streak >= 7 && streak < 30 ? "unlocked" : "claimed") : "locked",
      },
      {
        id: "2",
        title: "Gift Hamper",
        description: "Receive a fitness gift hamper with supplements and gear",
        requiredStreak: 30,
        status: streak >= 30 ? (streak >= 30 && streak < 60 ? "unlocked" : "claimed") : "locked",
      },
      {
        id: "3",
        title: "1 Week Personal Trainer",
        description: "Free 1 week session with a personal trainer",
        requiredStreak: 60,
        status: streak >= 60 ? (streak >= 60 && streak < 120 ? "unlocked" : "claimed") : "locked",
      },
      {
        id: "4",
        title: "1 Month Free",
        description: "Get one month of free gym membership",
        requiredStreak: 120,
        status: streak >= 120 ? "unlocked" : "locked",
      },
    ];
  },

  async fetchTrainers(): Promise<Trainer[]> {
    await delay(700);
    return [
      {
        id: "1",
        name: "John Smith",
        specialization: "Strength Training",
        experience: "5 years",
        availableSlots: 8,
      },
      {
        id: "2",
        name: "Sarah Johnson",
        specialization: "Yoga & Flexibility",
        experience: "7 years",
        availableSlots: 5,
      },
      {
        id: "3",
        name: "Mike Davis",
        specialization: "Cardio & Weight Loss",
        experience: "4 years",
        availableSlots: 10,
      },
    ];
  },

  async fetchMemberInsights(): Promise<MemberInsight[]> {
    await delay(900);
    return [
      {
        id: "1",
        name: "Alice Brown",
        email: "alice@example.com",
        currentStreak: 45,
        rank: "Gold",
        subscriptionStatus: "active",
      },
      {
        id: "2",
        name: "Bob Wilson",
        email: "bob@example.com",
        currentStreak: 12,
        rank: "Silver",
        subscriptionStatus: "active",
      },
      {
        id: "3",
        name: "Charlie Lee",
        email: "charlie@example.com",
        currentStreak: 3,
        rank: "Bronze",
        subscriptionStatus: "active",
      },
      {
        id: "4",
        name: "Diana Martinez",
        email: "diana@example.com",
        currentStreak: 95,
        rank: "Platinum",
        subscriptionStatus: "active",
      },
    ];
  },

  async fetchSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    await delay(500);
    return [
      {
        id: "1",
        name: "Monthly Plan",
        price: 49.99,
        duration: "monthly",
        features: [
          "Full gym access",
          "Streak tracking & rewards",
          "AI diet planner",
          "Event participation",
        ],
      },
      {
        id: "2",
        name: "Annual Plan",
        price: 499.99,
        duration: "annual",
        features: [
          "Full gym access",
          "Streak tracking & rewards",
          "AI diet planner",
          "Event participation",
          "Priority support",
          "2 free personal training sessions",
        ],
        discount: 15,
      },
    ];
  },

  async generateDietPlan(data: {
    age: number;
    weight: number;
    height: number;
    gender: string;
    activityLevel: string;
    goal: string;
    dietPreference: string;
    allergies: string;
  }): Promise<{
    breakfast: string;
    lunch: string;
    snack: string;
    dinner: string;
    macros: { protein: number; carbs: number; fats: number };
  }> {
    await delay(2000);

    const isVegetarian = data.dietPreference === "veg" || data.dietPreference === "vegan";
    const isVegan = data.dietPreference === "vegan";

    // Calculate BMR and adjust for activity level and goal
    const bmr = 10 * data.weight + 6.25 * data.height - 5 * data.age + (data.gender === "male" ? 5 : -161);
    const activityMultipliers: Record<string, number> = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      "very-active": 1.9,
    };
    let calories = bmr * (activityMultipliers[data.activityLevel] || 1.375);

    if (data.goal === "lose") calories *= 0.85;
    if (data.goal === "gain") calories *= 1.15;

    // Protein sources based on diet preference
    let breakfast: string;
    let lunch: string;
    let snack: string;
    let dinner: string;
    let protein: number;
    let carbs: number;
    let fats: number;

    if (isVegetarian || isVegan) {
      // STRICT VEGETARIAN: No eggs, chicken, fish, meat
      // Use: paneer, tofu, dal, soy, legumes, nuts, seeds
      const vegProteinSources = [
        "paneer (cottage cheese)",
        "tofu",
        "chickpeas",
        "lentils (dal)",
        "black beans",
        "kidney beans",
        "soy chunks",
        "quinoa",
        "peanuts",
        "almonds",
      ];
      const vegBreakfastOptions = [
        `Oatmeal with ${vegProteinSources[Math.floor(Math.random() * vegProteinSources.length)]} and berries (${Math.round(calories * 0.25)} cal)`,
        `Whole grain toast with almond butter and banana (${Math.round(calories * 0.25)} cal)`,
        `Vegetable poha with peanuts and sprouts (${Math.round(calories * 0.25)} cal)`,
        `Chickpea flour (besan) chilla with vegetables (${Math.round(calories * 0.25)} cal)`,
      ];
      const vegLunchOptions = [
        `Dal (lentil curry) with brown rice and mixed vegetables (${Math.round(calories * 0.35)} cal)`,
        `Paneer tikka with quinoa and salad (${Math.round(calories * 0.35)} cal)`,
        `Chickpea curry with whole wheat roti and vegetables (${Math.round(calories * 0.35)} cal)`,
        `Tofu stir-fry with brown rice and steamed vegetables (${Math.round(calories * 0.35)} cal)`,
      ];
      const vegSnackOptions = [
        `Roasted chickpeas with nuts (${Math.round(calories * 0.15)} cal)`,
        `Fruit smoothie with soy protein powder (${Math.round(calories * 0.15)} cal)`,
        `Hummus with vegetable sticks (${Math.round(calories * 0.15)} cal)`,
        `Trail mix with almonds and dried fruits (${Math.round(calories * 0.15)} cal)`,
      ];
      const vegDinnerOptions = [
        `Dal makhani with whole wheat roti and vegetable curry (${Math.round(calories * 0.25)} cal)`,
        `Paneer curry with brown rice and salad (${Math.round(calories * 0.25)} cal)`,
        `Lentil soup with whole grain bread and vegetables (${Math.round(calories * 0.25)} cal)`,
        `Soy chunks curry with quinoa and mixed vegetables (${Math.round(calories * 0.25)} cal)`,
      ];

      breakfast = vegBreakfastOptions[Math.floor(Math.random() * vegBreakfastOptions.length)];
      lunch = vegLunchOptions[Math.floor(Math.random() * vegLunchOptions.length)];
      snack = vegSnackOptions[Math.floor(Math.random() * vegSnackOptions.length)];
      dinner = vegDinnerOptions[Math.floor(Math.random() * vegDinnerOptions.length)];

      // Macros for vegetarian diet
      protein = Math.round(calories * 0.25 / 4); // 25% from protein (plant-based)
      carbs = Math.round(calories * 0.5 / 4); // 50% from carbs
      fats = Math.round(calories * 0.25 / 9); // 25% from fats
    } else {
      // Non-vegetarian options
      breakfast = `Oatmeal with berries and protein powder (${Math.round(calories * 0.25)} cal)`;
      lunch = `Grilled chicken breast with quinoa and vegetables (${Math.round(calories * 0.35)} cal)`;
      snack = `Greek yogurt with nuts (${Math.round(calories * 0.15)} cal)`;
      dinner = `Salmon with sweet potato and broccoli (${Math.round(calories * 0.25)} cal)`;

      protein = Math.round(calories * 0.3 / 4); // 30% from protein
      carbs = Math.round(calories * 0.4 / 4); // 40% from carbs
      fats = Math.round(calories * 0.3 / 9); // 30% from fats
    }

    return {
      breakfast,
      lunch,
      snack,
      dinner,
      macros: {
        protein,
        carbs,
        fats,
      },
    };
  },
};

