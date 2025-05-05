const asyncHandler = require('express-async-handler');
const Customer = require('../models/Customer');

const getCustomers = asyncHandler(async (req, res) => {
  const customers = await Customer.find({ user: req.user._id });
  res.json(customers);
});

const createCustomer = asyncHandler(async (req, res) => {
  const { name, phone, address, trustScore, creditLimit } = req.body;

  const customer = await Customer.create({
    user: req.user._id,
    name,
    phone,
    address,
    trustScore,
    creditLimit,
  });

  res.status(201).json(customer);
});

const getCustomer = asyncHandler(async (req, res) => {
  const customer = await Customer.findOne({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!customer) {
    res.status(404);
    throw new Error('Customer not found');
  }

  res.json(customer);
});

const updateCustomer = asyncHandler(async (req, res) => {
  const customer = await Customer.findOne({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!customer) {
    res.status(404);
    throw new Error('Customer not found');
  }

  const updatedCustomer = await Customer.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );

  res.json(updatedCustomer);
});

const deleteCustomer = asyncHandler(async (req, res) => {
  const customer = await Customer.findOne({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!customer) {
    res.status(404);
    throw new Error('Customer not found');
  }

  await customer.remove();
  res.json({ message: 'Customer removed' });
});

module.exports = {
  getCustomers,
  createCustomer,
  getCustomer,
  updateCustomer,
  deleteCustomer,
};