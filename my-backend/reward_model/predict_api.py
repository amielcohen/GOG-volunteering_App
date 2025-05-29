import pickle
import pandas as pd
from fastapi import FastAPI
from pydantic import BaseModel
from typing import List
from fastapi.middleware.cors import CORSMiddleware

# --- טען את המודל המאומן ---
with open("model.pkl", "rb") as f:
    model = pickle.load(f)

# --- תגיות ועמותות ---
TAGS = [
    "קהילה", "נגישות", "משפחות", "קשישים",
    "ילדים", "נוער", "חינוך",
    "פיזי", "גיוס", "אריזה", "מטבח",
    "בריאות", "עזרה ראשונה",
    "בעלי חיים", "סביבה",
    "טכנולוגיה", "אירועים",
    "תרומות", "צבא"
]

# נזהה את עמודות העמותות לפי השם שלהן במודל
all_model_columns = model.feature_names_in_
ORGANIZATION_COLUMNS = [col for col in all_model_columns if col.startswith("organization_")]

# --- FastAPI הגדרה ---
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # תוכל לשנות בעתיד לכתובת האפליקציה שלך
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- מבנה בקשה נכנסת ---
class VolunteeringInput(BaseModel):
    duration: int
    weekday: int
    hour: int
    max_participants: int
    tags: List[str]
    organization: str

@app.post("/predict")
def predict_reward_ratio(vol: VolunteeringInput):
    input_dict = {
        "duration": vol.duration,
        "weekday": vol.weekday,
        "hour": vol.hour,
        "max_participants": vol.max_participants,
    }

    # הוספת תגיות (One-Hot)
    for tag in TAGS:
        input_dict[f"tag_{tag}"] = int(tag in vol.tags)

    # הוספת עמותות (One-Hot)
    for org_col in ORGANIZATION_COLUMNS:
        input_dict[org_col] = 1 if org_col == f"organization_{vol.organization}" else 0

    # השלמת DataFrame לפי הסדר של המודל
    df = pd.DataFrame([input_dict])
    df = df.reindex(columns=model.feature_names_in_, fill_value=0)

    # תחזית
    prediction = model.predict(df)[0]
    return {"predicted_reward_ratio": round(float(prediction), 2)}
