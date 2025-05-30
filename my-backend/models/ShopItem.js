const mongoose = require('mongoose');

const shopItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  level: { type: Number, default: 0 },
  description: { type: String, default: '' },
  imageUrl: { type: String, default: '' },
  categories: { type: [String], default: ['אחר'] },
  city: { type: mongoose.Schema.Types.ObjectId, ref: 'City', required: true },

  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('ShopItem', shopItemSchema);
