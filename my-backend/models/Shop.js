const mongoose = require('mongoose');

const shopSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    city: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'City',
      required: true,
      unique: true,
    },
    items: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ShopItem' }],
    categories: {
      type: [String],
      default: ['אחר'],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Shop', shopSchema);
