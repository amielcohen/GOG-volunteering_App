const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
  {
    firstName: { type: String },
    lastName: { type: String },

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

    role: {
      type: String,
      enum: [
        'admin',
        'user',
        'CommunityRep',
        'OrganizationRep',
        'BusinessPartner',
      ],
      default: 'user',
    },

    gender: { type: String, enum: ['נקבה', 'זכר'] },

    email: {
      type: String,
      match: [/\S+@\S+\.\S+/, 'אימייל לא תקין'],
    },

    dateOfBirth: { type: Date },

    // שדה העיר הראשית
    city: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'City',
      required: [true, 'עיר הוא שדה חובה'],
    },

    // שדות עבור ערים מרובות (בעיקר ל-OrganizationRep)
    cities: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'City',
      },
    ],

    street: { type: String },
    houseNumber: { type: String },

    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      default: null,
    },

    businessPartner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BusinessPartner',
      default: null,
    },
    badPoints: {
      type: [Date], // כל תאריך מייצג נקודה רעה
      default: [],
    },
    blockedUntil: {
      type: Date, // אם יש תאריך עתידי – המשתמש חסום
      default: null,
    },

    GoGs: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    exp: { type: Number, default: 0 },
    profilePic: { type: String, default: '' },
    showLevelUpModal: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

// ולידציה לפי תפקיד המשתמש
UserSchema.pre('validate', function (next) {
  const isOrgRep = this.role === 'OrganizationRep';
  const isRegularUser = this.role === 'user';

  if (isOrgRep) {
    if (!this.organization) {
      return next(new Error('חובה לבחור עמותה עבור אחראי עמותה'));
    }

    if (!this.cities || this.cities.length === 0) {
      return next(new Error('חובה לשייך לפחות עיר אחת לאחראי עמותה'));
    }
  }

  if (isRegularUser) {
    const missing = [];
    if (!this.email) missing.push('email');
    if (!this.dateOfBirth) missing.push('dateOfBirth');
    if (!this.street) missing.push('street');
    if (!this.houseNumber) missing.push('houseNumber');
    if (!this.gender) missing.push('gender');
    if (!this.firstName) missing.push('firstName');
    if (!this.lastName) missing.push('lastName');

    if (missing.length > 0) {
      return next(
        new Error(`חסרים שדות חובה למשתמש רגיל: ${missing.join(', ')}`)
      );
    }
  }

  next();
});

module.exports = mongoose.model('User', UserSchema);
