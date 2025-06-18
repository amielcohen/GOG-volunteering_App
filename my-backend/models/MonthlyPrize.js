const mongoose = require('mongoose');

const prizeSchema = new mongoose.Schema({
  place: {
    type: Number,
    required: true,
    min: 1,
    max: 10,
  },
  type: {
    type: String,
    enum: ['gog', 'code'], // 'gog' - כמות גוגואים, 'code' - קוד מימוש
    required: true,
  },
  value: {
    type: mongoose.Schema.Types.Mixed, // יכול להיות מספר (גוגואים) או ObjectId של קוד
    required: true,
  },
});

const monthlyPrizeSchema = new mongoose.Schema(
  {
    city: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'City',
      required: true,
    },
    month: {
      type: Number,
      required: true,
      min: 0,
      max: 11, // ינואר = 0
    },
    year: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      enum: ['minutes', 'count'], // סוג הדירוג
      required: true,
    },
    prizes: {
      type: [prizeSchema],
      validate: [arrayLimit, '{PATH} must contain exactly 10 prizes'],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

function arrayLimit(val) {
  return val.length === 10;
}

monthlyPrizeSchema.index(
  { city: 1, month: 1, year: 1, type: 1 },
  { unique: true }
);

module.exports = mongoose.model('MonthlyPrize', monthlyPrizeSchema);
