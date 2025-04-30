const mongoose = require('mongoose');

const organizationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    description: { type: String },
    imageUrl: { type: String }, // לוגו או תמונה כללית
    type: {
      type: String,
      enum: ['עמותה', 'בית אבות', 'בית ספר'],
      required: true,
    },
    contactEmail: { type: String },
    phone: { type: String },
    isGlobal: { type: Boolean, default: true }, // תמיד true כאן

    linkedCities: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'City',
      },
    ],
    activeCities: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'City',
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Organization', organizationSchema);
