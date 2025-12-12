"use strict";
import crypto from "crypto";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { User } from "../models/User.js";

const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;

function hashPlan(plan) {
  return crypto.createHash("md5").update(JSON.stringify(plan)).digest("hex");
}

function sanitizeVegetarian(plan) {
  Object.keys(plan).forEach((k) => {
    if (typeof plan[k] === "string") {
      plan[k] = plan[k].replace(/(chicken|fish|meat|egg|pork|beef)/gi, "paneer");
    }
  });
  return plan;
}

function fallbackPlan({ dietType }) {
  const base =
    dietType === "Vegetarian"
      ? {
          breakfast: "Paneer scramble with veggies and multigrain toast",
          lunch: "Tofu curry with brown rice and salad",
          snack: "Roasted chana and mixed nuts",
          dinner: "Dal, quinoa, sautéed veggies, salad",
          macros: { protein: 120, carbs: 200, fats: 60 },
        }
      : {
          breakfast: "Egg white omelette with veggies and oats",
          lunch: "Grilled chicken with quinoa and greens",
          snack: "Greek yogurt with berries and seeds",
          dinner: "Fish with sweet potato and steamed broccoli",
          macros: { protein: 140, carbs: 210, fats: 65 },
        };
  return base;
}

async function buildPlanWithGemini(prompt) {
  if (!genAI) return null;
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });
  const result = await model.generateContent(prompt);
  const text = result?.response?.text?.();
  if (!text) return null;

  // Attempt to extract JSON
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  const jsonString = jsonMatch ? jsonMatch[0] : text;
  try {
    return JSON.parse(jsonString);
  } catch {
    return null;
  }
}

export async function generateDiet(req, res) {
  try {
    const { age, weight, height, goal, dietType } = req.body;

    if (!age || !weight || !height || !goal || !dietType) {
      return res.status(400).json({ error: "All values must be greater than zero." });
    }
    if (age < 16) return res.status(400).json({ error: "Minimum age required is 16." });
    if (weight <= 30) return res.status(400).json({ error: "Weight must be above 30 kg." });
    if (height <= 100) return res.status(400).json({ error: "Height must be above 100 cm." });

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    const prompt = `
      Create a ${dietType === "Vegetarian" ? "strict vegetarian" : "non-vegetarian"} diet plan for fitness.
      User: age ${age}, weight ${weight} kg, height ${height} cm, goal ${goal}.
      Format JSON only: {"breakfast":"","lunch":"","snack":"","dinner":"","macros":{"protein":0,"carbs":0,"fats":0}}
      Do not repeat the same meal set within the last 7 days.
      Return a brand new variation on every request.
      Keep items simple and local. Never include meat/egg/fish for vegetarian.
    `;

    let plan =
      (await buildPlanWithGemini(prompt)) ||
      fallbackPlan({ dietType });

    if (!plan || !plan.breakfast || !plan.lunch || !plan.snack || !plan.dinner) {
      plan = fallbackPlan({ dietType });
    }

    if (dietType === "Vegetarian") {
      plan = sanitizeVegetarian(plan);
    }

    let planHash = hashPlan(plan);
    const todayKey = new Date().toISOString().split("T")[0];
    const last7 = (user.dietHistory || [])
      .filter((d) => d.date)
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 7)
      .map((d) => d.planHash);

    let attempts = 0;
    while (last7.includes(planHash) && attempts < 5) {
      // request a new one
      const regenerated =
        (await buildPlanWithGemini(prompt + " Generate a different variant.")) ||
        fallbackPlan({ dietType });
      plan = dietType === "Vegetarian" ? sanitizeVegetarian(regenerated) : regenerated;
      planHash = hashPlan(plan);
      attempts++;
    }

    user.dietHistory = [
      { date: new Date(todayKey), planHash, plan },
      ...(user.dietHistory || []).filter(
        (d) => new Date(d.date).toISOString().split("T")[0] !== todayKey
      ),
    ].slice(0, 14);

    await user.save();

    return res.json({ success: true, plan });
  } catch (error) {
    console.error("generateDiet error:", error);
    return res.status(500).json({ error: "AI generation failed" });
  }
}

