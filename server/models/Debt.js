const mongoose = require('mongoose');

const debtSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  date: {
    type: Date,
    default: Date.now
  },
  parsha: {
    type: String,
    required: true
  },
  aliyaType: {
    type: String,
    required: true
  },
  isPaid: {
    type: Boolean,
    default: false
  },
  paidDate: {
    type: Date,
    default: null
  }
}, { timestamps: true });

const Debt = mongoose.model('Debt', debtSchema);

module.exports = Debt;