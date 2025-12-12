"use strict";
import { ContactMessage } from "../models/ContactMessage.js";
import { sendEmail } from "../services/mailService.js";

export async function submitContactForm(req, res) {
  try {
    const { name, email, message } = req.body;

    const staticReply = `
Thanks for connecting with StreakFitX!

We have received your query:

-------------------------
${message}
-------------------------

We will get in touch with you shortly to help resolve your issue and guide you on how to get the best benefits from StreakFitX.

Thank you for contacting us!
`;

    const entry = await ContactMessage.create({
      name,
      email,
      message,
      aiResponse: staticReply,
    });

    await sendEmail(email, "StreakFitX – We Received Your Query", staticReply);

    return res.status(200).json({
      success: true,
      message: "Your query was received and a confirmation email has been sent.",
    });
  } catch (err) {
    console.error("contact submit error:", err);
    return res.status(500).json({ success: false, error: "Failed to process your query." });
  }
}

