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
const { protect } = require("./middleware/authMiddleware");

app.use("/api/auth", authRoutes);
app.use("/api/servers", protect, serverRoutes);

// Basic test route to check if the server is running
app.get("/api/status", (req, res) => {
  res.json({ message: "Minecraft Hosting Backend is online!" });
});

// Database Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB database"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
