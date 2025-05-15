import random
import pandas as pd
import numpy as np
from pymongo import MongoClient
from dotenv import load_dotenv
import os

# --- שלב 1: טענת משתנים מהסביבה ---
load_dotenv()
MONGO_URI = os.getenv("MONGO_URI")

# --- שלב 2: שליפת שמות העמותות ממונגו ---
client = MongoClient(MONGO_URI)
db = client["users"]
orgs_collection = db["organizations"]

# הנחה: יש שדה name לכל עמותה
ORGANIZATIONS = [org["name"] for org in orgs_collection.find({}, {"name": 1})]
print(ORGANIZATIONS)
# --- תגיות קבועות מהמערכת שלך ---
TAGS = [
    "קהילה", "נגישות", "משפחות", "קשישים",
    "ילדים", "נוער", "חינוך",
    "פיזי", "גיוס", "אריזה", "מטבח",
    "בריאות", "עזרה ראשונה",
    "בעלי חיים", "סביבה",
    "טכנולוגיה", "אירועים",
    "תרומות", "צבא"
]

# פונקציה לבחירת מספר תגיות אקראי
def choose_tags():
    probs = [0.15, 0.6, 0.25]
    choices = [1, 2, 3]
    base_count = random.choices(choices, weights=probs, k=1)[0]
    return random.sample(TAGS, k=random.randint(base_count, min(base_count+2, len(TAGS))))

# פונקציה ליצירת הנתונים
def generate_synthetic_data(n=1500):
    data = []

    if not ORGANIZATIONS:
        raise ValueError("❌ לא נמצאו עמותות בבסיס הנתונים. ודא שהקולקציה 'Organization' מכילה מסמכים עם שדה 'name'.")

    for _ in range(n):
        selected_tags = choose_tags()
        org = random.choice(ORGANIZATIONS)
        duration = random.choice([60, 90, 120, 150, 180])
        max_participants = random.randint(5, 30)
        weekday = random.randint(0, 6)
        hour = random.randint(8, 20)

        # בסיס היענות
        base_interest = 0.7
        if any(t in ["פיזי", "מטבח", "צבא"] for t in selected_tags):
            base_interest -= 0.2
        elif any(t in ["חינוך", "ילדים", "קהילה"] for t in selected_tags):
            base_interest += 0.1

        registered = np.clip(int(np.random.normal(loc=base_interest * max_participants, scale=2)), 0, max_participants)
        attended = np.clip(int(np.random.normal(loc=0.9 * registered, scale=2)), 0, registered)

        # חישוב יחס תגמול
        reward_ratio = 0.3
        reward_ratio += 0.1 * (duration / 60 - 1)
        if any(t in ["פיזי", "מטבח", "צבא"] for t in selected_tags):
            reward_ratio += 0.2
        if attended / max_participants < 0.4:
            reward_ratio += 0.2
        if hour < 9 or hour > 18:
            reward_ratio += 0.1
        reward_ratio = round(min(reward_ratio, 1.0), 2)

        row = {
            "duration": duration,
            "weekday": weekday,
            "hour": hour,
            "organization": org,
            "max_participants": max_participants,
            "registered_count": registered,
            "attended_count": attended,
            "reward_ratio": reward_ratio
        }

        # סימון תגיות בינארי
        for tag in TAGS:
            row[f"tag_{tag}"] = int(tag in selected_tags)

        data.append(row)

    return pd.DataFrame(data)

# --- הרצה ---
df = generate_synthetic_data()
df.to_csv("synthetic_volunteerings.csv", index=False, encoding="utf-8-sig")
print("✅ קובץ נוצר בהצלחה!")
print(df.head())
