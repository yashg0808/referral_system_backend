const { io } = require("socket.io-client");

// Connect as user 2 (who should receive earning updates)
const socket = io("http://localhost:3000", {
  query: { userId: "1" }
});

socket.on("connect", () => {
  console.log("Connected to WebSocket as user 1");
});

socket.on("earning_update", (data) => {
  console.log("Earning update received:", data);
});

socket.on("disconnect", () => {
  console.log("Disconnected from server");
});
