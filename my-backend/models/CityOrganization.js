// models/CityOrganization.js
const mongoose = require('mongoose');

const cityOrganizationSchema = new mongoose.Schema(
  {
    city: { type: String, required: true }, // למשל "נתיבות"
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
    }, // אם זו עמותה גלובלית
    name: { type: String, required: true }, // שם בפועל שמוצג בעיר (גם אם שונה)
    description: { type: String },
    contactEmail: { type: String },
    phone: { type: String },
    imageUrl: { type: String },
    isLocalOnly: { type: Boolean, default: false }, // true אם זו עמותה ייחודית לעיר
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    }, // מי הוסיף – מנהל העיר
    isActive: { type: Boolean, default: true }, // האם היא פעילה בעיר
  },
  { timestamps: true }
);

module.exports = mongoose.model('CityOrganization', cityOrganizationSchema);
