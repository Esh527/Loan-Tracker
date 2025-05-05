const express = require('express');
const router = express.Router();
const loanController = require('../controllers/loanController');
const { protect } = require('../middleware/auth');

router.route('/')
  .get(protect, loanController.getLoans)
  .post(protect, loanController.createLoan);

router.route('/:id')
  .get(protect, loanController.getLoan)
  .put(protect, loanController.updateLoan);

router.put('/:id/close', protect, loanController.closeLoan);
router.get('/summary', protect, loanController.getLoanSummary);
router.get('/overdue', protect, loanController.getOverdueLoans);

module.exports = router;