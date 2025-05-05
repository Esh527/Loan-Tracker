const mongoose = require('mongoose');
const { addDays, addMonths, isAfter } = require('date-fns');

const loanSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  remainingAmount: {
    type: Number,
    required: true,
    min: 0,
  },
  issueDate: {
    type: Date,
    required: true,
    default: Date.now,
  },
  dueDate: {
    type: Date,
    required: true,
  },
  frequency: {
    type: String,
    enum: ['bi-weekly', 'monthly'],
    required: true,
  },
  interestRate: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  graceDays: {
    type: Number,
    default: 0,
    min: 0,
  },
  status: {
    type: String,
    enum: ['pending', 'paid', 'overdue'],
    default: 'pending',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

loanSchema.pre('save', function (next) {
  if (this.isModified('remainingAmount') && this.remainingAmount <= 0) {
    this.status = 'paid';
    this.isActive = false;
  } else if (isAfter(new Date(), addDays(this.dueDate, this.graceDays))) {
    this.status = 'overdue';
  }
  next();
});

module.exports = mongoose.model('Loan', loanSchema);