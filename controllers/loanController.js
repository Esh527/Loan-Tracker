const asyncHandler = require('express-async-handler');
const { addDays, addMonths, isAfter } = require('date-fns');
const Loan = require('../models/Loan');
const Customer = require('../models/Customer');

// @desc    Get all loans for a user
// @route   GET /api/loans
// @access  Private
const getLoans = asyncHandler(async (req, res) => {
  const { status } = req.query;
  let query = { user: req.user._id, isActive: true };

  if (status) {
    query.status = status;
  }

  const loans = await Loan.find(query)
    .populate('customer', 'name phone')
    .sort('-createdAt');

  res.json(loans);
});

// @desc    Create a new loan
// @route   POST /api/loans
// @access  Private
const createLoan = asyncHandler(async (req, res) => {
  const {
    customerId,
    description,
    amount,
    dueDate,
    frequency,
    interestRate,
    graceDays,
  } = req.body;

  // Check if customer exists and belongs to user
  const customer = await Customer.findOne({
    _id: customerId,
    user: req.user._id,
  });

  if (!customer) {
    res.status(404);
    throw new Error('Customer not found');
  }

  // Calculate due date if not provided
  let calculatedDueDate = dueDate ? new Date(dueDate) : new Date();
  if (!dueDate) {
    if (frequency === 'bi-weekly') {
      calculatedDueDate = addDays(new Date(), 14);
    } else if (frequency === 'monthly') {
      calculatedDueDate = addMonths(new Date(), 1);
    }
  }

  const loan = await Loan.create({
    user: req.user._id,
    customer: customerId,
    description,
    amount,
    remainingAmount: amount,
    dueDate: calculatedDueDate,
    frequency,
    interestRate: interestRate || 0,
    graceDays: graceDays || 0,
  });

  res.status(201).json(loan);
});

// @desc    Get a single loan
// @route   GET /api/loans/:id
// @access  Private
const getLoan = asyncHandler(async (req, res) => {
  const loan = await Loan.findOne({
    _id: req.params.id,
    user: req.user._id,
  }).populate('customer', 'name phone');

  if (!loan) {
    res.status(404);
    throw new Error('Loan not found');
  }

  res.json(loan);
});

// @desc    Update a loan
// @route   PUT /api/loans/:id
// @access  Private
const updateLoan = asyncHandler(async (req, res) => {
  const loan = await Loan.findOne({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!loan) {
    res.status(404);
    throw new Error('Loan not found');
  }

  const updatedLoan = await Loan.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });

  res.json(updatedLoan);
});

// @desc    Close a loan
// @route   PUT /api/loans/:id/close
// @access  Private
const closeLoan = asyncHandler(async (req, res) => {
  const loan = await Loan.findOne({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!loan) {
    res.status(404);
    throw new Error('Loan not found');
  }

  loan.isActive = false;
  loan.status = 'paid';
  await loan.save();

  res.json({ message: 'Loan closed successfully' });
});

// @desc    Get loan summary
// @route   GET /api/loans/summary
// @access  Private
const getLoanSummary = asyncHandler(async (req, res) => {
  const loans = await Loan.find({ user: req.user._id, isActive: true });
  const repaidLoans = await Loan.find({ user: req.user._id, status: 'paid' });

  const totalLoaned = loans.reduce((sum, loan) => sum + loan.amount, 0);
  const totalRemaining = loans.reduce(
    (sum, loan) => sum + loan.remainingAmount,
    0
  );
  const totalCollected = totalLoaned - totalRemaining;
  const overdueAmount = loans
    .filter((loan) => loan.status === 'overdue')
    .reduce((sum, loan) => sum + loan.remainingAmount, 0);

  // Calculate average repayment time (simplified)
  let avgRepaymentTime = 0;
  if (repaidLoans.length > 0) {
    const totalDays = repaidLoans.reduce((sum, loan) => {
      const repaymentTime = loan.updatedAt - loan.createdAt;
      return sum + repaymentTime / (1000 * 60 * 60 * 24); // Convert to days
    }, 0);
    avgRepaymentTime = totalDays / repaidLoans.length;
  }

  res.json({
    totalLoaned,
    totalCollected,
    totalRemaining,
    overdueAmount,
    avgRepaymentTime: avgRepaymentTime.toFixed(2),
    activeLoans: loans.length,
    repaidLoans: repaidLoans.length,
  });
});

// @desc    Get overdue loans
// @route   GET /api/loans/overdue
// @access  Private
const getOverdueLoans = asyncHandler(async (req, res) => {
  const overdueLoans = await Loan.find({
    user: req.user._id,
    status: 'overdue',
    isActive: true,
  }).populate('customer', 'name phone');

  res.json(overdueLoans);
});

module.exports = {
  getLoans,
  createLoan,
  getLoan,
  updateLoan,
  closeLoan,
  getLoanSummary,
  getOverdueLoans,
};