const axios = require("axios");
const Payment = require("../models/Payment");
const Plan = require("../models/Plan");
const fs = require("fs");
const path = require("path");
const getLocalIp = require("../utils/getLocalIp");
const jwt = require("jsonwebtoken");

const LOG_FILE = path.join(__dirname, "../debug_payment.log");
function logToFile(msg) {
  const timestamp = new Date().toISOString();
  fs.appendFileSync(LOG_FILE, `[${timestamp}] ${msg}\n`);
  console.log(msg);
}

const createPaymentSession = async (req, res) => {
  console.log("💰 POST /api/payments/create hit with body:", req.body);
  try {
    // FIX: also destructure and save serverName + serverVersion
    const { userId, planId, amount, serverName, serverVersion } = req.body;
    const payment = await Payment.create({
      userId,
      planId,
      amount,
      serverName,
      serverVersion,
    });
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
    if (!payment) return res.status(404).json({ message: "Payment not found" });
    res.status(200).json({ status: payment.status });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch payment status" });
  }
};

const scanEndpoint = async (req, res) => {
  try {
    const payment = await Payment.findOne({ status: "pending" }).sort({
      createdAt: -1,
    });
    if (!payment) {
      console.error("❌ No pending payment sessions found for demo.");
      return res.status(404).send("No pending payment sessions found.");
    }

    res.redirect(`./${payment._id}`);
  } catch (error) {
    logToFile("❌ Demo scan redirect error: " + error.message);
    res.status(500).send("Failed to find payment");
  }
};

const confirmPaymentAndCreateServer = async (req, res) => {
  logToFile(`🔍 Scan handler hit for ID: ${req.params.id}`);
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) {
      logToFile(`❌ Payment session ${req.params.id} not found in database.`);
      return res.status(404).send(`<html>
      <body style="font-family:sans-serif;text-align:center;padding:40px">
        <h1>Payment session not found!</h1>
         <p>This is a demo scan endpoint. In production, this would verify a real error.</p>
      </body>
    </html>`);
    }

    if (payment.status === "completed") {
      logToFile(`ℹ️ Payment ${payment._id} already marked as completed.`);
      return res.send(`<html>
      <body style="font-family:sans-serif;text-align:center;padding:40px">
        <h1>Payment already completed!</h1>
         <p>This is a demo scan endpoint. In production, this would verify a real completed session.</p>
      </body>
    </html>`);
    }

    logToFile(`📝 Marking payment ${payment._id} as completed...`);
    payment.status = "completed";
    await payment.save();

    logToFile(
      `✅ Payment ${payment._id} confirmed! Kicking off server creation...`,
    );

    const plan = await Plan.findById(payment.planId);
    if (!plan) {
      console.warn("⚠️ Plan not found for planId:", payment.planId);
    }

    const internalToken = jwt.sign(
      { id: payment.userId },
      process.env.JWT_SECRET,
      {
        expiresIn: "60m",
      },
    );

    const ip = getLocalIp();

    const API_BASE = `http://${ip}:5000/api`;

    await axios.post(
      `${API_BASE}/servers/create`,
      {
        serverName:
          payment.serverName ||
          `Server-${payment.planId}-${Math.floor(Math.random() * 1000)}`,
        mcVersion: payment.serverVersion || "1.20.4",
        planId: payment.planId,
      },
      {
        headers: {
          Authorization: `Bearer ${internalToken}`,
        },
      },
    );

    res.send(`
    <html>
      <body style="font-family:sans-serif;text-align:center;padding:40px">
        <h1>✅ Demo Payment Scanned!</h1>
        <p>This is a demo scan endpoint. In production, this would verify a real payment.</p>
      </body>
    </html>
  `);
  } catch (error) {
    logToFile(`❌ Top-level crash: ${error.message}`);
    res.status(500).send(error);
  }
};

const cancelPayment = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) return res.status(404).json({ message: "Payment not found" });

    if (payment.status !== "pending")
      return res
        .status(400)
        .json({ message: "Only pending payments can be cancelled" });

    payment.status = "failed";
    await payment.save();

    res.status(200).json({ message: "Payment cancelled" });
  } catch (error) {
    res.status(500).json({ message: "Failed to cancel payment" });
  }
};

module.exports = {
  createPaymentSession,
  paymentStatus,
  scanEndpoint,
  confirmPaymentAndCreateServer,
  cancelPayment,
};
