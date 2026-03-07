const express = require("express");
const router = express.Router();
const payment = require("../controllers/paymentControllers.js");

router.post("/create", payment.createPaymentSession);
router.get("/:id/status", payment.paymentStatus);
router.get("/scan/:id", payment.confirmPaymentAndCreateServer);

module.exports = router;
