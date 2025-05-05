const mongoose = require('mongoose');

const volunteeringSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },

  date: { type: Date, required: true },
  time: { type: String, required: true }, // לדוג' "14:30"
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
  reward: { type: Number, default: 0 },
  isRecurring: { type: Boolean, default: false },
  maxParticipants: { type: Number },

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

  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Volunteering', volunteeringSchema);
