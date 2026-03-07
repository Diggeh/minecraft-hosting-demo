const express = require("express");
const router = express.Router();
const plan = require("../controllers/planControllers");

// @route   GET /api/plans
router.get("/", plan.getPlans);

// @route   GET /api/plans/:identifier  (slug or mongo id)
router.get("/:identifier", plan.getPlan);

module.exports = router;
