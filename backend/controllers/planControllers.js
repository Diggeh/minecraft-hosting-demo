const Plan = require("../models/Plan");

const seedPlans = [
  {
    name: "Tropa",
    slug: "tropa",
    description: "Perfect for small groups",
    price: 75,
    ram: 4096, // MB
    maxPlayers: 5,
    duration: 7,
  },
  {
    name: "Barkada",
    slug: "barkada",
    description: "Great for medium-sized groups",
    price: 125,
    ram: 6144,
    maxPlayers: 10,
    duration: 7,
  },
  {
    name: "Barangay",
    slug: "barangay",
    description: "Built for large communities",
    price: 180,
    ram: 8192,
    maxPlayers: 20,
    duration: 7,
  },
];

const seedDefaultPlans = async () => {
  try {
    const count = await Plan.countDocuments();
    if (count === 0) {
      await Plan.insertMany(seedPlans);
      console.log("🌱 Default plans seeded successfully");
    } else {
      console.log(`ℹ️  Plans already exist (${count} found), skipping seed`);
    }
  } catch (err) {
    console.error("❌ Failed to seed plans:", err);
  }
};

const getPlans = async (req, res) => {
  try {
    const plans = await Plan.find().sort({ price: 1 });
    res.status(200).json({ success: true, data: plans });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch plans" });
  }
};

const getPlan = async (req, res) => {
  try {
    const { identifier } = req.params;

    // Try slug first, fall back to MongoDB ID
    const plan =
      (await Plan.findOne({ slug: identifier })) ||
      (await Plan.findById(identifier).catch(() => null));

    if (!plan) {
      return res
        .status(404)
        .json({ success: false, message: "Plan not found" });
    }

    res.status(200).json({ success: true, data: plan });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch plan" });
  }
};

module.exports = { getPlans, getPlan, seedDefaultPlans };
