const { addDays, addMonths, isAfter } = require('date-fns');

const calculateDueDate = (frequency, issueDate) => {
  switch (frequency) {
    case 'bi-weekly':
      return addDays(issueDate, 14);
    case 'monthly':
      return addMonths(issueDate, 1);
    default:
      return addDays(issueDate, 30);
  }
};

const checkLoanStatus = (dueDate, graceDays, remainingAmount) => {
  if (remainingAmount <= 0) return 'paid';
  if (isAfter(new Date(), addDays(dueDate, graceDays))) return 'overdue';
  return 'pending';
};

module.exports = {
  calculateDueDate,
  checkLoanStatus,
};