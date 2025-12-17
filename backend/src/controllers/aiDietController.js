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
    // AI DIET PLAN GENERATION PROMPT
    // ----------------------------------------
    const prompt = `
Generate a personalized full-day diet plan based on the following user information.

IMPORTANT FORMATTING REQUIREMENTS:
- Start with a brief note: "This diet plan is AI-generated and should be used as a general guide. Consult a healthcare professional before making significant dietary changes."
- Use clear, conversational language (not overly formal or robotic)
- Focus ONLY on the main content - no lengthy introductions or excessive explanations
- Keep it professional but humanized

User Details:
- Age: ${age}
- Weight: ${weight} kg
- Height: ${height} cm
- Gender: ${gender}
- Goal: ${goal} (Fat Loss / Muscle Gain / Maintenance)
- Activity Level: ${activityLevel}
- Food Preference: ${foodPreference} (If vegetarian, STRICTLY avoid all non-veg items)
- Allergies: ${allergies || "None"}

Required Format:
1. Start with the AI disclaimer (one line)
2. Daily Calorie Target: [estimated calories]
3. Breakfast: [meal description with approximate calories]
4. Mid-Morning Snack: [snack description with approximate calories]
5. Lunch: [meal description with approximate calories]
6. Evening Snack: [snack description with approximate calories]
7. Dinner: [meal description with approximate calories]
8. Optional: Brief tips (2-3 short bullet points max)

Rules:
- If vegetarian/vegan → STRICTLY avoid all non-veg items (meat, fish, eggs, etc.)
- Use Indian food options when possible
- Keep meals realistic, affordable, and easy to prepare
- Include calorie estimates for each meal
- Write in a natural, conversational tone
- Avoid excessive explanations or marketing language
- No greetings, introductions, or closing statements - just the plan content

Generate the diet plan now in the exact format specified above.
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

