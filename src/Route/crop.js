const path = require("path");
const { spawn } = require("child_process");
const express = require("express");

const router = express.Router();

router.post("/crop-recommendation", async (req, res) => {
  try {
    const { N, P, K, temperature, humidity, ph, rainfall } = req.body;

    // Absolute path to the Python file
    const pythonScript = path.join(__dirname, "predict_output.py");

    console.log("Running Python script at:", pythonScript);

    const pythonProcess = spawn("python", [
      pythonScript,
      N,
      P,
      K,
      temperature,
      humidity,
      ph,
      rainfall,
    ]);

    let result = "";
    pythonProcess.stdout.on("data", (data) => {
      result += data.toString();
    });

    pythonProcess.stderr.on("data", (data) => {
      console.error(`Python Error: ${data}`);
    });

    pythonProcess.on("close", (code) => {
      if (code !== 0) {
        return res.status(500).json({
          message: "Python script failed",
        });
      }
      res.json({
        message: "Crop recommendation successful",
        recommendedCrop: result.trim(),
      });
    });
  } catch (err) {
    console.error("Crop Recommendation Error:", err);
    res.status(500).json({
      message: "Internal server error",
      error: err.message,
    });
  }
});

module.exports = router;
