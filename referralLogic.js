const db = require('./db');

async function handlePurchase(userId, amount, userSockets) {
  const purchaseId = await db.recordPurchase(userId, amount);
  if (amount < 1000) return;

  const level1 = await db.getReferrer(userId);
  const level1Str = level1?.toString(); // 🔑 normalize
  const userIdStr = userId.toString();  // for logs

  if (level1) {
    const earning1 = amount * 0.05;
    await db.recordEarning(level1, userId, 1, earning1, purchaseId);
    if (userSockets.has(level1Str)) {
      console.log(`✅ Emitting to level1 referrer ${level1Str}`);
      userSockets.get(level1Str).emit("earning_update", {
        from: userId,
        level: 1,
        amount: earning1,
      });
    } else {
      console.log(`❌ No socket connected for level1: ${level1Str}`);
    }

    const level2 = await db.getReferrer(level1);
    const level2Str = level2?.toString(); // 🔑 normalize
    if (level2) {
      const earning2 = amount * 0.01;
      await db.recordEarning(level2, userId, 2, earning2, purchaseId);
      if (userSockets.has(level2Str)) {
        console.log(`✅ Emitting to level2 referrer ${level2Str}`);
        userSockets.get(level2Str).emit("earning_update", {
          from: userId,
          level: 2,
          amount: earning2,
        });
      } else {
        console.log(`❌ No socket connected for level2: ${level2Str}`);
      }
    }

    console.log("✅ Purchase processed:", {
      userId: userIdStr,
      level1: level1Str,
      level2: level2?.toString() ?? null,
      sockets: [...userSockets.keys()],
    });
  }
}

module.exports = { handlePurchase };