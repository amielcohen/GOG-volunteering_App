const mongoose = require('mongoose');

const citySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    state: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    imageUrl: {
      // ⬅️ שדה חדש לתמונה
      type: String,
      default: '', // כברירת מחדל אין תמונה
      trim: true,
    },
    connectedOrganizations: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization',
      },
    ],
    activeOrganizations: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization',
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('City', citySchema);
