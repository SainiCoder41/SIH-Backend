const express = require("express");
const soilRoute = express.Router();


// API route: get soil data by lat/lon





soilRoute.get("/soil-data", async (req, res) => {
  try {
    const { lat, lon } = req.body;

    if (!lat || !lon) {
      return res
        .status(400)
        .json({ error: "Latitude and Longitude are required" });
    }

    const depth = "0-5cm";

    // SoilGrids API URL
    const url = `https://rest.isric.org/soilgrids/v2.0/properties/query?lon=${lon}&lat=${lat}&property=phh2o&property=nitrogen&property=soc&property=sand&property=silt&property=clay&depth=${encodeURIComponent(
      depth
    )}&value=mean`;

    const response = await fetch(url);
    if (!response.ok) {
      return res
        .status(response.status)
        .json({ error: "Failed to fetch SoilGrids data" });
    }

    const data = await response.json();

    // Extract properties from API response
    const extractValue = (prop) => {
      const layer = data?.properties?.layers?.find((l) => l.name === prop);
      return layer?.depths?.[0]?.values?.mean ?? null;
    };

    const phRaw = extractValue("phh2o");
    const nitrogenRaw = extractValue("nitrogen");
    const soc = extractValue("soc");
    const sand = extractValue("sand");
    const silt = extractValue("silt");
    const clay = extractValue("clay");

    // Convert values according to units
    const ph = phRaw !== null ? phRaw / 10 : null; // pH*10 → pH
    const nitrogen = nitrogenRaw !== null ? nitrogenRaw / 100 : null; // cg/kg → g/kg

    res.json({
      latitude: lat,
      longitude: lon,
      ph,
      nitrogen,
      soc,
      sand,
      silt,
      clay,
    });
  } catch (error) {
    console.error("Error fetching soil data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});




module.exports = soilRoute;