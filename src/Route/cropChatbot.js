const express = require("express");
const multer = require("multer");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const cropChatbot = express.Router();

// Multer setup for file uploads (stores in memory)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Init Gemini client
const genAI = new GoogleGenerativeAI('AIzaSyCbfsXnw3z4pla0pKVrojzwn2uTCZPO84Q');

// Choose model with system instruction
const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  systemInstruction: `
You are an AI-based crop recommendation assistant for farmers. 
Your role is to only provide guidance related to agriculture, farming, soil health, weather impacts, irrigation, fertilizers, pest control, 
and crop recommendations based on the farmer's queries or images. 

Do not answer questions outside of agriculture or farming. 
If the user asks something unrelated, politely redirect them to agriculture-related topics. 
Keep your responses simple, practical, and helpful for Indian farmers.
  `,
});

cropChatbot.post("/Chatbot", upload.single("image"), async (req, res) => {
  try {
    const { question } = req.body;
    const file = req.file;

    // Build content array dynamically
    const content = [];

    if (file) {
      // Convert buffer to Base64
      const base64Image = file.buffer.toString("base64");
      content.push({
        inlineData: {
          mimeType: file.mimetype, // e.g., image/png or image/jpeg
          data: base64Image,
        },
      });
    }

    if (question) {
      content.push({ text: question });
    } else if (!file) {
      // If no image and no question provided
      return res.status(400).json({ error: "Please provide a question or an image." });
    }

    // Send to Gemini
    const result = await model.generateContent(content);
    const answer = result.response.text();

    res.json({ answer });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

module.exports = cropChatbot;
