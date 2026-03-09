// Import dependencies
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

// Initialize the Express app
const app = express();

// Middleware
app.use(cors()); // Allows your React frontend to communicate with this backend
app.use(express.json()); // Allows your backend to understand JSON data

// Import Routes
const authRoutes = require("./routes/authRoutes");
const serverRoutes = require("./routes/serverRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const planRoutes = require("./routes/planRoutes");
const { protect } = require("./middleware/authMiddleware");
const { seedDefaultPlans } = require("./controllers/planControllers");

app.use("/api/auth", authRoutes);
app.use("/api/servers", protect, serverRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/plans", planRoutes);

// Endpoint to discover local IP for the QR code
app.get("/api/status/ip", (req, res) => {
  const { networkInterfaces } = require("os");
  const nets = networkInterfaces();
  let localIp = "localhost";

  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
      if (net.family === "IPv4" && !net.internal) {
        localIp = net.address;
        break;
      }
    }
  }
  res.json({ ip: localIp });
});

// Database Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("✅ Connected to MongoDB database");
    await seedDefaultPlans();
  })
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
