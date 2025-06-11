const db = require('./db');

async function handlePurchase(userId, amount, userSockets) {
  const purchaseId = await db.recordPurchase(userId, amount);
  if (amount < 1000) return;

  const level1 = await db.getReferrer(userId);
  if (level1) {
    const earning1 = amount * 0.05;
    await db.recordEarning(level1, userId, 1, earning1, purchaseId);
    if (userSockets.has(level1)) {
      userSockets.get(level1).emit("earning_update", { from: userId, level: 1, amount: earning1 });
    }
    const level2 = await db.getReferrer(level1);
    if (level2) {
      const earning2 = amount * 0.01;
      await db.recordEarning(level2, userId, 2, earning2, purchaseId);
      if (userSockets.has(level2)) {
        userSockets.get(level2).emit("earning_update", { from: userId, level: 2, amount: earning2 });
      }
    }
    console.log("Referrer:", level1, "Second-level:", level2);
    console.log("Sockets connected:", [...userSockets.keys()]);
  }
}

module.exports = { handlePurchase };