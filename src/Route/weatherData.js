const express = require("express");
const weatherRoute = express.Router();
// Replace with your real WeatherAPI key
const API_KEY = "feedeee62547420b9a8100145250509";
weatherRoute.post("/weather-data", async (req, res) => {
  try {
    const { lat, lon } = req.body;

    if (!lat || !lon) {
      return res.status(400).json({ error: "Latitude and Longitude are required" });
    }

    // WeatherAPI endpoint
    const url = `http://api.weatherapi.com/v1/current.json?key=${API_KEY}&q=${lat},${lon}`;

    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: "Failed to fetch weather data", details: data });
    }

    // Return simplified weather info
    res.json({
      location: `${data.location.name}, ${data.location.country}`,
      temperature_c: data.current.temp_c,
      condition: data.current.condition.text,
      humidity: data.current.humidity,
    });
  } catch (error) {
    console.error("Error fetching weather data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = weatherRoute;
