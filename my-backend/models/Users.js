const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'שם משתמש הוא שדה חובה'],
      unique: true,
      minlength: [3, 'שם משתמש חייב להיות באורך של לפחות 3 תווים'],
    },

    password: {
      type: String,
      required: [true, 'סיסמה הוא שדה חובה'],
      minlength: [6, 'סיסמה חייבת להכיל לפחות 6 תווים'],
    },

    role: { type: String, enum: ['admin', 'user'], default: 'user' },
    gender: { type: String, enum: ['נקבה', 'זכר'] },
    email: {
      type: String,
      required: [true, 'אימייל הוא שדה חובה'],
      // תנאי להתאמה לתבנית של אימייל
      match: [/\S+@\S+\.\S+/, 'אימייל לא תקין'],
    },
    dateOfBirth: {
      type: Date,
      required: [true, 'תאריך לידה הוא שדה חובה'],
    },
    city: {
      type: String,
      required: [true, 'עיר הוא שדה חובה'],
    },
    street: {
      type: String,
      required: [true, 'רחוב הוא שדה חובה'],
    },
    houseNumber: {
      type: String,
      required: [true, 'מספר בית הוא שדה חובה'],
    },
    GoGs: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    exp: { type: Number, default: 0 },
    profilePic: { type: String, default: '' },
  },

  {
    timestamps: true, // מוסיף createdAt ו-updatedAt אוטומטית
  }
);

module.exports = mongoose.model('User', UserSchema);
