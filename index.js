const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const bodyParser = require('body-parser');
const db = require('./db');
const { handlePurchase } = require('./referralLogic');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

app.use(bodyParser.json());

// Store socket connections
const userSockets = new Map();

io.on('connection', socket => {
  const userId = socket.handshake.query.userId;
  if (userId) {
    userSockets.set(userId, socket);
  }
  socket.on('disconnect', () => {
    userSockets.delete(userId);
  });
});

// Endpoint: Make a purchase
app.post('/api/purchase', async (req, res) => {
  const { userId, amount } = req.body;
  if (!userId || !amount) return res.status(400).json({ error: 'Invalid input' });

  try {
    await handlePurchase(userId, amount, userSockets);
    res.json({ message: 'Purchase processed and earnings distributed' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Endpoint: Get earnings report
app.get('/api/earnings/:userId', async (req, res) => {
  const userId = req.params.userId;
  try {
    const result = await db.getEarningsReport(userId);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

server.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});