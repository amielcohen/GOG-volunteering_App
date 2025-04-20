const mongoose = require('mongoose');

const shopItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  level: { type: Number, default: 0 },
  description: { type: String, default: '' },
  imageUrl: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('ShopItem', shopItemSchema);
