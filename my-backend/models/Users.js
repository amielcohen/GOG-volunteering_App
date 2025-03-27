const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username:    { type: String, required: true },
  password:    { type: String, required: true },
  role:        { type: String, enum: ['admin', 'user'], default: 'user' },
  email:       { type: String },
  dateOfBirth: { type: Date }, // ניתן גם לשמור כמחרוזת אם נדרש
  city:        { type: String },
  street:      { type: String },
  houseNumber: { type: String }
}, {
  timestamps: true  // מוסיף createdAt ו-updatedAt אוטומטית
});

module.exports = mongoose.model('User', UserSchema);
