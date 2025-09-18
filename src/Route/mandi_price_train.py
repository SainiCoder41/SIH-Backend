import sys
import json
import joblib
import pandas as pd
import os

# Base directory where this script is located
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Load model & encoders using absolute paths
model_path = os.path.join(BASE_DIR, "price_predictor.pkl")
encoders_path = os.path.join(BASE_DIR, "encoders.pkl")

model = joblib.load(model_path)
encoders = joblib.load(encoders_path)

def predict_price(data):
    state = data["state"]
    district = data["district"]
    commodity = data["commodity"]
    variety = data.get("variety", "")  # new categorical feature
    month = int(data["month"])
    year = int(data["year"])

    # Encode categorical features
    state_enc = encoders["state"].transform([state])[0]
    district_enc = encoders["district"].transform([district])[0]
    commodity_enc = encoders["commodity"].transform([commodity])[0]
    
    # Encode variety if present in encoders
    if "variety" in encoders:
        variety_enc = encoders["variety"].transform([variety])[0]
    else:
        variety_enc = variety  # keep as-is if no encoder

    # Create dataframe for prediction
    input_df = pd.DataFrame([{
        "state": state_enc,
        "district": district_enc,
        "commodity": commodity_enc,
        "variety": variety_enc,
        "month": month,
        "year": year
    }])

    # Predict price
    prediction = model.predict(input_df)[0]
    return round(float(prediction), 2)

if __name__ == "__main__":
    raw_input = sys.stdin.read()
    data = json.loads(raw_input)

    try:
        result = {"predicted_price": predict_price(data)}
        print(json.dumps(result))
    except Exception as e:
        print(json.dumps({"error": str(e)}))
