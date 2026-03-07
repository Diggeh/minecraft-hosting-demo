const express = require("express");
const router = express.Router();
const Payment = require("../models/Payment");
const Server = require("../models/Server");
const axios = require("axios");
const fs = require("fs");
const path = require("path");

const LOG_FILE = path.join(__dirname, "../debug_payment.log");
function logToFile(msg) {
  const timestamp = new Date().toISOString();
  fs.appendFileSync(LOG_FILE, `[${timestamp}] ${msg}\n`);
  console.log(msg);
}

const createPaymentSession = async (req, res) => {
  console.log("💰 POST /api/payments/create hit with body:", req.body);
  try {
    const { userId, planId, amount } = req.body;
    const payment = await Payment.create({ userId, planId, amount });
    console.log("✅ Payment session created:", payment._id);
    res.status(201).json(payment);
  } catch (error) {
    console.error("❌ Failed to create payment session:", error.message);
    res.status(500).json({ message: "Failed to create payment session" });
  }
};

const paymentStatus = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) {
      console.error(
        `❌ Status check failed: Payment ${req.params.id} not found.`,
      );
      return res.status(404).json({ message: "Payment not found" });
    }
    res.json({ status: payment.status });
  } catch (error) {
    console.error("❌ Status check error:", error.message);
    res.status(500).json({ message: "Error fetching status" });
  }
};

const scanEndpoint = async (req, res) => {
  console.log("🔍 GET /api/payments/scan/demo hit!");
  try {
    // Find the most recent pending payment for the mockup user
    const payment = await Payment.findOne({ status: "pending" }).sort({
      createdAt: -1,
    });
    if (!payment) {
      console.error("❌ No pending payment sessions found for demo.");
      return res.status(404).send("No pending payment sessions found.");
    }

    console.log(`🔗 Redirecting to scan handler for payment: ${payment._id}`);
    // Using relative redirect to ensure it works across environments
    res.redirect(`./${payment._id}`);
  } catch (error) {
    logToFile("❌ Demo scan redirect error: " + error.message);
    res.status(500).send("Error redirection to demo scan");
  }
};

const confirmPaymentAndCreateServer = async (req, res) => {
  logToFile(`🔍 Scan handler hit for ID: ${req.params.id}`);
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) {
      logToFile(`❌ Payment session ${req.params.id} not found in database.`);
      return res.status(404).send("Payment session not found.");
    }

    if (payment.status === "completed") {
      logToFile(`ℹ️ Payment ${payment._id} already marked as completed.`);
      return res.send("Payment already completed!");
    }

    // 1. Mark payment as completed
    logToFile(`📝 Marking payment ${payment._id} as completed...`);
    payment.status = "completed";
    await payment.save();

    logToFile(
      `✅ Payment ${payment._id} confirmed! Kicking off server creation...`,
    );

    // 2. TRIGGER SERVER CREATION
    const serverName = `Server-${payment.planId}-${Math.floor(Math.random() * 1000)}`;
    const randomPort = Math.floor(Math.random() * (26000 - 25565 + 1)) + 25565;

    logToFile(
      `🏗️ Details: Name="${serverName}", Port=${randomPort}, User=${payment.userId}`,
    );

    try {
      logToFile("📤 POSTing to Crafty API...");
      const baseUrl = process.env.CRAFTY_API_URL;
      const token = (process.env.CRAFTY_API_TOKEN || "").trim(); // EXPLICIT TRIM

      logToFile(`🔧 URL: ${baseUrl}`);
      logToFile(
        `🔧 Token Prefix: ${token ? token.substring(0, 10) + "..." : "MISSING"}`,
      );

      // Re-creating the client inside the route
      const localCraftyApi = axios.create({
        baseURL: baseUrl,
        headers: { Authorization: `Bearer ${token}` },
        httpsAgent: new (require("https").Agent)({ rejectUnauthorized: false }),
      });

      logToFile(`📝 Request Payload: Name=${serverName}, Port=${randomPort}`);

      const craftyResponse = await localCraftyApi.post("/servers", {
        name: serverName,
        monitoring_type: "minecraft_java",
        minecraft_java_monitoring_data: { host: "127.0.0.1", port: randomPort },
        create_type: "minecraft_java",
        minecraft_java_create_data: {
          create_type: "download_jar",
          download_jar_create_data: {
            category: "mc_java_servers",
            type: "paper",
            version: "1.20.4",
            mem_min: 1,
            mem_max: 2,
            server_properties_port: randomPort,
          },
        },
      });

      logToFile(`📥 Crafty status: ${craftyResponse.status}`);

      const newServerId = craftyResponse.data.data?.new_server_id;
      logToFile(`🆔 Crafty assigned ID: ${newServerId}`);

      logToFile("📝 Attempting to save to MongoDB...");
      const myDbServer = await Server.create({
        owner: payment.userId,
        crafty_server_id: newServerId || "TEMP_ID",
        serverName: serverName,
        port: randomPort,
        status: "stopped",
      });

      logToFile(`🚀 SUCCESS: Server created in DB with ID: ${myDbServer._id}`);
    } catch (craftyError) {
      logToFile("❌ CRITICAL FAILURE in server creation block!");
      if (craftyError.response) {
        logToFile(`Response Status: ${craftyError.response.status}`);
        logToFile(
          `Response Data: ${JSON.stringify(craftyError.response.data)}`,
        );
      } else {
        logToFile(`Error Message: ${craftyError.message}`);
        logToFile(`Stack: ${craftyError.stack}`);
      }
    }

    res.send(`
            <h1>Payment Confirmed!</h1>
            <p>Your Minecraft server (${serverName}) is being prepared.</p>
            <hr>
            <small>Session ID: ${payment._id}</small>
        `);
  } catch (error) {
    logToFile(`❌ Top-level crash: ${error.message}`);
    res.status(500).send("Internal Server Error.");
  }
};

module.exports = {
  createPaymentSession,
  paymentStatus,
  scanEndpoint,
  confirmPaymentAndCreateServer,
};
