const prisma = require('../db/prisma');

// ARRAY FORM: independent writes. Neither needs the other's result.
// Use when the writes just need to succeed or fail together.
async function placeOrderArray(productId, amount) {
  const [order, product] = await prisma.$transaction([
    prisma.order.create({ data: { productId, amount } }),
    prisma.product.update({
      where: { id: productId },
      data: { stock: { decrement: amount } },
    }),
  ]);
  return { order, stock: product.stock };
}

// INTERACTIVE FORM: dependent writes. The ledger entry needs the new order id,
// which only exists after the first write. Use tx for every call.
async function placeOrderInteractive(productId, amount) {
  return prisma.$transaction(async (tx) => {
    const order = await tx.order.create({ data: { productId, amount } });
    await tx.product.update({
      where: { id: productId },
      data: { stock: { decrement: amount } },
    });
    await tx.ledgerEntry.create({
      data: { orderId: order.id, delta: -amount }, // needs order.id
    });
    return order;
  });
}

// FORCED ROLLBACK PROOF: throw after the first write and confirm nothing persisted.
async function forcedRollbackDemo(productId, amount) {
  const before = await prisma.order.count();
  try {
    await prisma.$transaction(async (tx) => {
      await tx.order.create({ data: { productId, amount } }); // write 1
      throw new Error('forced failure');                      // rolls it back
    });
  } catch (error) {
    const after = await prisma.order.count();
    return { rolledBack: before === after, before, after };
  }
}

module.exports = { placeOrderArray, placeOrderInteractive, forcedRollbackDemo };
