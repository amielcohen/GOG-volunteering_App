import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
import pickle

# קריאה של הקובץ שיצרנו קודם
df = pd.read_csv("synthetic_volunteerings.csv")

# One-Hot Encoding לעמודת organization (שאר העמודות כבר בינאריות)
df = pd.get_dummies(df, columns=["organization"])

# עמודות שלא נשתמש בהן בזמן חיזוי (לא זמינות בעת יצירת ההתנדבות)
exclude_columns = ["registered_count", "attended_count", "reward_ratio"]

# כל העמודות שנשארות הן פיצ'רים
X = df[[col for col in df.columns if col not in exclude_columns]]
y = df["reward_ratio"]

# חלוקה ל־Train/Test
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# אימון המודל
model = RandomForestRegressor(n_estimators=100, random_state=42)
model.fit(X_train, y_train)

# בדיקת דיוק (R^2)
score = model.score(X_test, y_test)
print(f"✅ Model R^2 score on test set: {score:.2f}")

# שמירת המודל המאומן
with open("model.pkl", "wb") as f:
    pickle.dump(model, f)

print("✅ Model saved to model.pkl")
