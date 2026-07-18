const express = require('express');
const orderController = require('./controllers/orderController');

const app = express();
app.use(express.json());

app.post('/orders', orderController.create);
app.post('/orders/with-ledger', orderController.createWithLedger);
app.post('/orders/prove-rollback', orderController.proveRollback);

app.use((error, req, res, next) => {
  if (error.code === 'P2025') return res.status(404).json({ error: 'Related record not found' });
  if (error.code === 'P2003') return res.status(422).json({ error: 'Related record does not exist' });
  res.status(error.statusCode || 500).json({ error: 'Request failed' });
});

if (require.main === module) {
  app.listen(process.env.PORT || 3000, () => console.log('API listening'));
}

module.exports = app;
