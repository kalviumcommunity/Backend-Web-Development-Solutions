const orderRepository = require('../repositories/orderRepository');

function validate(fields) {
  if (!fields || !fields.productId || !fields.amount) {
    const error = new Error('productId and amount are required');
    error.statusCode = 422;
    throw error;
  }
}

async function createOrder(fields) {
  validate(fields);
  return orderRepository.placeOrderArray(Number(fields.productId), Number(fields.amount));
}

async function createOrderWithLedger(fields) {
  validate(fields);
  return orderRepository.placeOrderInteractive(Number(fields.productId), Number(fields.amount));
}

async function proveRollback(fields) {
  validate(fields);
  return orderRepository.forcedRollbackDemo(Number(fields.productId), Number(fields.amount));
}

module.exports = { createOrder, createOrderWithLedger, proveRollback };
