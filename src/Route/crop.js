const express = require("express");
const path = require("path");
const { spawn } = require("child_process");

const cropRecommendation = express.Router();

// Weather API key
const API_KEY = "feedeee62547420b9a8100145250509";

cropRecommendation.post("/agri-data", async (req, res) => {
  try {
    const { lat, lon } = req.body;
    if (!lat || !lon) {
      return res.status(400).json({ error: "Latitude and Longitude are required" });
    }

    const depth = "0-5cm";

    // SoilGrids API URL
    const soilUrl = `https://rest.isric.org/soilgrids/v2.0/properties/query?lon=${lon}&lat=${lat}&property=phh2o&property=nitrogen&property=soc&property=sand&property=silt&property=clay&depth=${encodeURIComponent(
      depth
    )}&value=mean`;

    // WeatherAPI URL
    const weatherUrl = `http://api.weatherapi.com/v1/current.json?key=${API_KEY}&q=${lat},${lon}`;

    // Fetch soil & weather data in parallel
    const [soilRes, weatherRes] = await Promise.all([fetch(soilUrl), fetch(weatherUrl)]);

    if (!soilRes.ok) throw new Error("Failed to fetch SoilGrids data");
    if (!weatherRes.ok) throw new Error("Failed to fetch Weather data");

    const soilData = await soilRes.json();
    const weatherData = await weatherRes.json();

    // Extract soil values
    const extractValue = (prop) => {
      const layer = soilData?.properties?.layers?.find((l) => l.name === prop);
      return layer?.depths?.[0]?.values?.mean ?? null;
    };

    const phRaw = extractValue("phh2o");
    const nitrogenRaw = extractValue("nitrogen");
    const soc = extractValue("soc");
    const sand = extractValue("sand");
    const silt = extractValue("silt");
    const clay = extractValue("clay");

    const ph = phRaw !== null ? phRaw / 10 : null;
    const nitrogen = nitrogenRaw !== null ? nitrogenRaw / 100 : null;

    // Extract weather values
    const temperature = weatherData.current?.temp_c ?? null;
    const humidity = weatherData.current?.humidity ?? null;

    // Run Python crop recommendation script
    const pythonScript = path.join(__dirname, "predict_output.py");
   const pythonProcess = spawn("python3", [
  pythonScript,
  nitrogen || 0,     // Nitrogen
  phosphorus || 0,   // Phosphorus
  potassium || 0,    // Potassium
  temperature || 0,  // Temperature
  humidity || 0,     // Humidity
  ph || 0,           // Soil pH
  rainfall || 0      // Rainfall
]);


    let cropResult = "";
    pythonProcess.stdout.on("data", (data) => {
      cropResult += data.toString();
    });

    pythonProcess.stderr.on("data", (data) => {
      console.error(`Python Error: ${data}`);
    });

    pythonProcess.on("close", (code) => {
      if (code !== 0) {
        return res.status(500).json({ error: "Crop recommendation script failed" });
      }

      // Final combined response
      res.json({
        location: `${weatherData.location.name}, ${weatherData.location.country}`,
        weather: {
          temperature_c: temperature,
          condition: weatherData.current.condition.text,
          humidity,
        },
        soil: {
          ph,
          nitrogen,
          soc,
          sand,
          silt,
          clay,
        },
        recommendedCrop: cropResult.trim(),
      });
    });
  } catch (error) {
    console.error("Error fetching agri-data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = cropRecommendation ;