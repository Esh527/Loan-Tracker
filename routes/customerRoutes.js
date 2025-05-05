const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');
const { protect } = require('../middleware/auth');

router.route('/')
  .get(protect, customerController.getCustomers)
  .post(protect, customerController.createCustomer);

router.route('/:id')
  .get(protect, customerController.getCustomer)
  .put(protect, customerController.updateCustomer)
  .delete(protect, customerController.deleteCustomer);

module.exports = router;