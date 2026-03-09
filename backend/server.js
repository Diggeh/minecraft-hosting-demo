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
const getLocalIp = require("./utils/getLocalIp");

app.use("/api/auth", authRoutes);
app.use("/api/servers", protect, serverRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/plans", planRoutes);

// Endpoint to discover local IP for the QR code
app.get("/api/status/ip", (req, res) => {
  res.json({ ip: getLocalIp() });
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
