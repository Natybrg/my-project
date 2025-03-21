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
  paidAmount: {
    type: Number,
    default: 0,
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
  paymentHistory: [{
    amount: Number,
    date: {
      type: Date,
      default: Date.now
    },
    note: String
  }],
  paidDate: {
    type: Date,
    default: null
  }
}, { timestamps: true });

// Virtual property to calculate remaining amount
debtSchema.virtual('remainingAmount').get(function() {
  return Math.max(0, this.amount - this.paidAmount);
});

// Set isPaid automatically based on paidAmount
debtSchema.pre('save', function(next) {
  if (this.paidAmount >= this.amount) {
    this.isPaid = true;
    if (!this.paidDate) {
      this.paidDate = new Date();
    }
  }
  next();
});

debtSchema.set('toJSON', { virtuals: true });
debtSchema.set('toObject', { virtuals: true });

const Debt = mongoose.model('Debt', debtSchema);

module.exports = Debt;