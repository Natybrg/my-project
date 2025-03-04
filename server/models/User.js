const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    minlength: 2
  },
  fatherName: {
    type: String,
    required: true,
    minlength: 2
  },
  lastName: {
    type: String,
    required: true,
    minlength: 2
  },
  phone: {
    type: String,
    required: true,
    unique: true,
    match: /^\d{10}$/
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  rols: {
    type: String,
    required: true,
    enum: ['admin', 'gabai','manager', 'user'],
    default: 'user'
  },
  debts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Debt'
  }]
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;