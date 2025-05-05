const asyncHandler = require('express-async-handler');
const Repayment = require('../models/Repayment');
const Loan = require('../models/Loan');
const Customer = require('../models/Customer');
const generateReceipt = require('../utils/generateReceipt');

// @desc    Record a repayment
// @route   POST /api/repayments
// @access  Private
const recordRepayment = asyncHandler(async (req, res) => {
  const { loanId, amount, paymentDate, notes } = req.body;

  // Check if loan exists and belongs to user
  const loan = await Loan.findOne({
    _id: loanId,
    user: req.user._id,
  });

  if (!loan) {
    res.status(404);
    throw new Error('Loan not found');
  }

  // Check if repayment amount is valid
  if (amount <= 0 || amount > loan.remainingAmount) {
    res.status(400);
    throw new Error('Invalid repayment amount');
  }

  // Create repayment record
  const repayment = await Repayment.create({
    user: req.user._id,
    loan: loanId,
    customer: loan.customer,
    amount,
    paymentDate: paymentDate || new Date(),
    notes,
  });

  // Update loan remaining amount
  loan.remainingAmount -= amount;
  if (loan.remainingAmount <= 0) {
    loan.status = 'paid';
    loan.isActive = false;
  }
  await loan.save();

  // Generate receipt
  const customer = await Customer.findById(loan.customer);
  const receipt = await generateReceipt({
    repaymentId: repayment._id,
    customerName: customer.name,
    loanDescription: loan.description,
    amount: amount,
    paymentDate: repayment.paymentDate,
    remainingBalance: loan.remainingAmount,
    shopName: req.user.shopName,
  });

  res.status(201).json({
    repayment,
    loan,
    receiptUrl: `/receipts/${repayment._id}.pdf`,
  });
});

// @desc    Get all repayments for a loan
// @route   GET /api/repayments/loan/:loanId
// @access  Private
const getRepaymentsForLoan = asyncHandler(async (req, res) => {
  const repayments = await Repayment.find({
    loan: req.params.loanId,
    user: req.user._id,
  }).sort('-paymentDate');

  res.json(repayments);
});

// @desc    Get all repayments for a customer
// @route   GET /api/repayments/customer/:customerId
// @access  Private
const getRepaymentsForCustomer = asyncHandler(async (req, res) => {
  const repayments = await Repayment.find({
    customer: req.params.customerId,
    user: req.user._id,
  })
    .populate('loan', 'description amount')
    .sort('-paymentDate');

  res.json(repayments);
});

// @desc    Get a repayment receipt
// @route   GET /api/repayments/:id/receipt
// @access  Private
const getRepaymentReceipt = asyncHandler(async (req, res) => {
  const repayment = await Repayment.findOne({
    _id: req.params.id,
    user: req.user._id,
  })
    .populate('loan', 'description')
    .populate('customer', 'name');

  if (!repayment) {
    res.status(404);
    throw new Error('Repayment not found');
  }

  const receipt = await generateReceipt({
    repaymentId: repayment._id,
    customerName: repayment.customer.name,
    loanDescription: repayment.loan.description,
    amount: repayment.amount,
    paymentDate: repayment.paymentDate,
    remainingBalance: repayment.loan.remainingAmount,
    shopName: req.user.shopName,
  });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename=receipt-${repayment._id}.pdf`
  );
  receipt.pipe(res);
});

module.exports = {
  recordRepayment,
  getRepaymentsForLoan,
  getRepaymentsForCustomer,
  getRepaymentReceipt,
};