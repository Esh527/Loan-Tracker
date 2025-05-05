const express = require('express');
const router = express.Router();
const repaymentController = require('../controllers/repaymentController');
const { protect } = require('../middleware/auth');

router.post('/', protect, repaymentController.recordRepayment);
router.get('/loan/:loanId', protect, repaymentController.getRepaymentsForLoan);
router.get('/customer/:customerId', protect, repaymentController.getRepaymentsForCustomer);
router.get('/:id/receipt', protect, repaymentController.getRepaymentReceipt);

module.exports = router;