const express = require("express");
const multer = require("multer");
const fetch = require("node-fetch"); // Ensure installed: npm install node-fetch
const { GoogleGenerativeAI } = require("@google/generative-ai");

const cropChatbot = express.Router();

// Multer setup for file uploads (stores in memory)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Init Gemini client
const genAI = new GoogleGenerativeAI("AIzaSyCbfsXnw3z4pla0pKVrojzwn2uTCZPO84Q");

// Base model (fallback system instruction will be injected later)
const baseModel = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
});

const API_KEY = "feedeee62547420b9a8100145250509"; // store safely in .env

// ⬇️ Default fallback data for Rajasthan (Bhatewar region)
const fallbackSoil = {
  ph: 6.8,
  nitrogen: 0.15,
  soc: 1.2,
  sand: 55,
  silt: 25,
  clay: 20,
};

const fallbackWeather = {
  temperature: 32,
  humidity: 55,
};

cropChatbot.post("/Chatbot", upload.single("image"), async (req, res) => {
  try {
    const { question, lat, lon } = req.body;
    const file = req.file;

    // Ensure lat/lon are present, otherwise default to Bhatewar coords
    const latitude = lat || 24.5451;
    const longitude = lon || 74.6373;
    const depth = "0-5cm";

    // SoilGrids API URL
    const soilUrl = `https://rest.isric.org/soilgrids/v2.0/properties/query?lon=${longitude}&lat=${latitude}&property=phh2o&property=nitrogen&property=soc&property=sand&property=silt&property=clay&depth=${encodeURIComponent(
      depth
    )}&value=mean`;

    // WeatherAPI URL
    const weatherUrl = `http://api.weatherapi.com/v1/current.json?key=${API_KEY}&q=${latitude},${longitude}`;

    let soilData = null;
    let weatherData = null;
    let ph, nitrogen, soc, sand, silt, clay, temperature, humidity;

    try {
      // Fetch soil & weather with timeout (5 sec max wait)
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);

      const [soilRes, weatherRes] = await Promise.all([
        fetch(soilUrl, { signal: controller.signal }),
        fetch(weatherUrl, { signal: controller.signal }),
      ]);
      clearTimeout(timeout);

      if (soilRes.ok) soilData = await soilRes.json();
      if (weatherRes.ok) weatherData = await weatherRes.json();
    } catch (err) {
      console.warn("⚠️ API fetch failed, using fallback data:", err.message);
    }

    // Extract soil values (or fallback)
    if (soilData) {
      const extractValue = (prop) => {
        const layer = soilData?.properties?.layers?.find((l) => l.name === prop);
        return layer?.depths?.[0]?.values?.mean ?? null;
      };

      const phRaw = extractValue("phh2o");
      const nitrogenRaw = extractValue("nitrogen");
      ph = phRaw !== null ? phRaw / 10 : fallbackSoil.ph;
      nitrogen = nitrogenRaw !== null ? nitrogenRaw / 100 : fallbackSoil.nitrogen;
      soc = extractValue("soc") || fallbackSoil.soc;
      sand = extractValue("sand") || fallbackSoil.sand;
      silt = extractValue("silt") || fallbackSoil.silt;
      clay = extractValue("clay") || fallbackSoil.clay;
    } else {
      ({ ph, nitrogen, soc, sand, silt, clay } = fallbackSoil);
    }

    // Extract weather values (or fallback)
    if (weatherData) {
      temperature =
        weatherData.current?.temp_c !== undefined
          ? weatherData.current.temp_c
          : fallbackWeather.temperature;
      humidity =
        weatherData.current?.humidity !== undefined
          ? weatherData.current.humidity
          : fallbackWeather.humidity;
    } else {
      ({ temperature, humidity } = fallbackWeather);
    }

    // Build systemInstruction dynamically
    const systemInstruction = `
You are an AI-based crop recommendation assistant for farmers.
Your role is to only provide guidance related to agriculture, farming, soil health, weather impacts, irrigation, fertilizers, pest control, 
and crop recommendations.

Use the following real-time context (with fallback to Rajasthan Bhatewar data if APIs fail) to give tailored advice:

🌱 Soil Data:
- pH: ${ph}
- Nitrogen: ${nitrogen}
- SOC: ${soc}
- Sand: ${sand}
- Silt: ${silt}
- Clay: ${clay}

🌤 Weather Data:
- Temperature: ${temperature} °C
- Humidity: ${humidity} %

Answer the farmer's question practically and simply.
If the user asks something unrelated to farming, politely redirect them.
    `;

    // Get model with new instruction
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      systemInstruction,
    });

    // Build content array dynamically
    const content = [];

    if (file) {
      const base64Image = file.buffer.toString("base64");
      content.push({
        inlineData: {
          mimeType: file.mimetype,
          data: base64Image,
        },
      });
    }

    if (question) {
      content.push({ text: question });
    }

    const result = await model.generateContent(content);
    const answer = result.response.text();

    res.json({
      answer,
      soil: soilData || fallbackSoil,
      weather: weatherData || fallbackWeather,
    });
  } catch (err) {
    console.error("❌ Server error:", err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

module.exports = cropChatbot;