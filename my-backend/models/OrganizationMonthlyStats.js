const mongoose = require('mongoose');

const OrganizationMonthlyStatsSchema = new mongoose.Schema({
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
  },
  city: { type: mongoose.Schema.Types.ObjectId, ref: 'City', required: true },
  month: { type: Number, required: true },
  year: { type: Number, required: true },
  totalCoins: { type: Number, default: 0 },
  totalVolunteerings: { type: Number, default: 0 },
  totalVolunteers: { type: Number, default: 0 }, // כולל כפילויות
  uniqueVolunteers: { type: Number, default: 0 }, // ייחודיים
  relevantVolunteerings: { type: Number, default: 0 },
  totalMinutes: { type: Number, default: 0 },
  volunteeringTimestamps: [Date], // כולל שעות
  createdAt: { type: Date, default: Date.now },
});

OrganizationMonthlyStatsSchema.index(
  { organizationId: 1, city: 1, month: 1, year: 1 },
  { unique: true }
);

module.exports = mongoose.model(
  'OrganizationMonthlyStats',
  OrganizationMonthlyStatsSchema
);
