const express = require("express");
const { spawn } = require("child_process");
const path = require("path");

const cropPricePredictation = express.Router();
cropPricePredictation.post("/predict-price", (req, res) => {
  try {
    const inputData = req.body;

    // Dynamically find the Python file
    // __dirname is the folder of this JS file (cropPrice.js)
    const pythonScriptPath = path.resolve(__dirname, "mandi_price_train.py");

    console.log("Python script path:", pythonScriptPath); // for debugging

    const python = spawn("python", [pythonScriptPath]);

    let result = "";
    let error = "";

    python.stdin.write(JSON.stringify(inputData));
    python.stdin.end();

    python.stdout.on("data", (data) => {
      result += data.toString();
    });

    python.stderr.on("data", (data) => {
      error += data.toString();
    });

    python.on("close", () => {
      if (error) {
        return res.status(500).json({ error: error });
      }
      try {
        const parsedResult = JSON.parse(result);
        res.json(parsedResult);
      } catch (err) {
        res.status(500).json({ error: "Invalid response from Python" });
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = cropPricePredictation;
