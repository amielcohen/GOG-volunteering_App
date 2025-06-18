const mongoose = require('mongoose');

const MonthlyStatsSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  year: { type: Number, required: true },
  month: { type: Number, required: true },
  totalMinutes: { type: Number, default: 0 },
  totalVolunteeringCount: { type: Number, default: 0 },
  city: { type: mongoose.Schema.Types.ObjectId, ref: 'City' },
});

// הגדרת אינדקסים - חשוב שיהיו לפני הייצוא
MonthlyStatsSchema.index({ userId: 1, year: 1, month: 1 }, { unique: true });
MonthlyStatsSchema.index({ city: 1, year: 1, month: 1, totalMinutes: -1 });

module.exports = mongoose.model('MonthlyStats', MonthlyStatsSchema);
