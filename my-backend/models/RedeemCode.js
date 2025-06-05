const mongoose = require('mongoose');

const redeemCodeSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },

  city: { type: mongoose.Schema.Types.ObjectId, ref: 'City', required: true },

  itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'ShopItem' },
  itemName: String,
  deliveryType: { type: String, enum: ['pickup', 'donation'] },
  pickupLocation: String,
  donationTarget: String,
  donationAmount: Number,

  donated: {
    type: Boolean,
    default: false,
  },

  status: {
    type: String,
    enum: ['pending', 'redeemed', 'expired'],
    default: 'pending',
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },

  redeemedAt: Date,
});

module.exports = mongoose.model('RedeemCode', redeemCodeSchema);
