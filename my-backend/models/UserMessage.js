const mongoose = require('mongoose');

const userMessageSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    index: true,
  },
  title: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['info', 'warning', 'success', 'alert'],
    default: 'info',
  },
  read: {
    type: Boolean,
    default: false,
  },
  source: {
    type: String, // לדוגמה: 'מערכת', 'אדמין', 'חנות'
    default: 'מערכת',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  expiresAt: {
    type: Date,
  },
});

module.exports = mongoose.model('UserMessage', userMessageSchema);
