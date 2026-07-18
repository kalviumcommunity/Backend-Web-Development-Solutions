const orderService = require('../services/orderService');

async function create(req, res, next) {
  try {
    const result = await orderService.createOrder(req.body);
    return res.status(201).json({ data: result });
  } catch (error) {
    return next(error);
  }
}

async function createWithLedger(req, res, next) {
  try {
    const result = await orderService.createOrderWithLedger(req.body);
    return res.status(201).json({ data: result });
  } catch (error) {
    return next(error);
  }
}

async function proveRollback(req, res, next) {
  try {
    const result = await orderService.proveRollback(req.body);
    return res.json({ data: result });
  } catch (error) {
    return next(error);
  }
}

module.exports = { create, createWithLedger, proveRollback };
