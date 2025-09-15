import joblib
import sys
import os
import pandas as pd  # ✅ add pandas

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
model_path = os.path.join(BASE_DIR, "crop_recommender.pkl")
model = joblib.load(model_path)

# Read command line arguments
N = float(sys.argv[1])
P = float(sys.argv[2])
K = float(sys.argv[3])
temperature = float(sys.argv[4])
humidity = float(sys.argv[5])
ph = float(sys.argv[6])
rainfall = float(sys.argv[7])

# ✅ Create a DataFrame with feature names
features = pd.DataFrame([{
    "N": N,
    "P": P,
    "K": K,
    "temperature": temperature,
    "humidity": humidity,
    "ph": ph,
    "rainfall": rainfall
}])

prediction = model.predict(features)[0]
print(prediction)
