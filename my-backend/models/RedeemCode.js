const mongoose = require('mongoose');

const redeemCodeSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
  },

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },

  item: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ShopItem',
    required: true,
  },

  city: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'City',
    required: true,
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
});
module.exports = mongoose.model('RedeemCode', redeemCodeSchema);
