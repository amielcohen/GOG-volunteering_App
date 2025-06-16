const mongoose = require('mongoose');

const volunteeringSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },

  date: { type: Date, required: true },
  durationMinutes: { type: Number, required: true },

  address: { type: String, required: true },
  coordinates: {
    lat: Number,
    lng: Number,
  },

  city: { type: String, required: true },

  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },

  tags: [{ type: String }],

  rewardType: {
    type: String,
    enum: ['percent', 'model'],
    default: 'percent',
  },
  reward: { type: Number, default: 0 }, // אחוז מהתקרה או מה שהמודל יקבע

  isRecurring: { type: Boolean, default: false },
  recurringDay: {
    type: Number, // 0–6 (א'–שבת)
    min: 0,
    max: 6,
  },

  maxParticipants: { type: Number },
  minlevel: {
    type: Number, // 0–6 (א'–שבת)
    min: 0,
    max: 20,
  },
  registeredVolunteers: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      status: {
        type: String,
        enum: ['pending', 'approved', 'cancelled'],
        default: 'pending',
      },
      attended: { type: Boolean, default: false },
    },
  ],

  imageUrl: { type: String },
  cancelled: { type: Boolean, default: false },
  notesForVolunteers: { type: String },
  isClosed: {
    type: Boolean,
    default: false,
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Volunteering', volunteeringSchema);
