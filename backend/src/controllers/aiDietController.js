"use strict";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "AIzaSyAUwgw-Bx0uZRMgYIu6EyM0YaV79p4r6j0");
const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
});

export async function generateDiet(req, res) {
  try {
    const { age, weight, height, gender, goal, activityLevel, foodPreference, allergies } = req.body;

    // VALIDATIONS
    if (age < 16)
      return res.status(400).json({ success: false, error: "Age must be at least 16 years." });

    if (weight <= 30)
      return res.status(400).json({ success: false, error: "Weight must be greater than 30 kg." });

    if (height <= 100)
      return res.status(400).json({ success: false, error: "Height must be above 100 cm." });

    // ----------------------------------------
    // EXPERT DIETICIAN TRAINING PROMPT
    // ----------------------------------------
    const prompt = `
You are a certified expert dietician with 20+ years of experience creating personalized diet charts for Indian users.
Your job: create a SAFE, PRACTICAL, CUSTOMIZED full-day diet plan.

User Details:
- Age: ${age}
- Weight: ${weight} kg
- Height: ${height} cm
- Gender: ${gender}
- Goal: ${goal}  (Fat Loss / Muscle Gain / Maintenance)
- Activity Level: ${activityLevel}
- Food Preference: ${foodPreference} (If vegetarian, DO NOT include any non-veg items)
- Allergies: ${allergies || "None"}

Rules:
1. If the user selects Vegetarian → STRICTLY avoid all non-veg food.
2. Create:
   - Breakfast
   - Mid-morning snack
   - Lunch
   - Evening snack
   - Dinner
3. Include calorie estimates for each meal.
4. Use Indian-food options as much as possible.
5. Keep meals realistic, affordable, and easy to prepare.
6. Avoid extreme dieting or unsafe recommendations.
7. Present the result in a clean, professional format.

Now generate the complete diet plan.
`;

    // CALL GEMINI
    const result = await model.generateContent(prompt);
    const dietText =
      result?.response?.text() ||
      "AI could not generate a diet. Please try again.";

    return res.json({
      success: true,
      diet: dietText,
    });
  } catch (error) {
    console.error("Gemini Diet Error:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to generate diet. Server or Gemini error.",
    });
  }
}

