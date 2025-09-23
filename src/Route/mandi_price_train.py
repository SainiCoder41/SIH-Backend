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

def predict_all_varieties(data):
    state = data["state"]
    district = data["district"]
    month = int(data["month"])
    year = int(data["year"])

    # Encode categorical features
    state_enc = encoders["state"].transform([state])[0]
    district_enc = encoders["district"].transform([district])[0]

    # Get all commodities from encoder classes
    all_commodities = encoders["commodity"].classes_
    
    results = []

    for commodity in all_commodities:
        commodity_enc = encoders["commodity"].transform([commodity])[0]

        # If variety encoder exists, loop through all varieties
        if "variety" in encoders:
            all_varieties = encoders["variety"].classes_
        else:
            all_varieties = [""]

        for variety in all_varieties:
            if "variety" in encoders:
                variety_enc = encoders["variety"].transform([variety])[0]
            else:
                variety_enc = variety

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
            try:
                prediction = model.predict(input_df)[0]
                price = round(float(prediction), 2)
            except Exception as e:
                price = None

            results.append({
                "commodity": commodity,
                "variety": variety,
                "predicted_price": price
            })

    return results


if __name__ == "__main__":
    raw_input = sys.stdin.read()
    data = json.loads(raw_input)

    try:
        result = {"predictions": predict_all_varieties(data)}
        print(json.dumps(result, ensure_ascii=False, indent=2))
    except Exception as e:
        print(json.dumps({"error": str(e)}))
