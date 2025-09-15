import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import LabelEncoder
import joblib

# Load dataset
df = pd.read_csv("mandi_price.csv")

# Clean column names
df.columns = [c.strip().lower() for c in df.columns]

# Convert date to datetime
df["arrival_date"] = pd.to_datetime(df["arrival_date"], format="%d/%m/%Y", errors="coerce")
df["month"] = df["arrival_date"].dt.month
df["year"] = df["arrival_date"].dt.year

# Select features
features = ["state", "district", "commodity", "variety", "month", "year"]
target = "modal_price"

# Encode categorical columns
encoders = {}
for col in ["state", "district", "commodity", "variety"]:
    encoders[col] = LabelEncoder()
    df[col] = encoders[col].fit_transform(df[col].astype(str))

X = df[features]
y = df[target]

# Train-test split
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Train model
model = RandomForestRegressor(n_estimators=200, random_state=42)
model.fit(X_train, y_train)

# Save model & encoders
joblib.dump(model, "price_predictor.pkl")
joblib.dump(encoders, "encoders.pkl")

print("✅ Model trained and saved as price_predictor.pkl")
print("Training Score:", model.score(X_train, y_train))
print("Testing Score:", model.score(X_test, y_test))
