const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const userExists = await User.findOne({ email });
    if (userExists)
      return res.status(400).json({ message: "User already exists" });

    const user = await User.create({ username, email, password });
    res.status(201).json({
      message: "User registered successfully",
      user: { _id: user._id, username: user.username },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user)
      return res.status(400).json({ message: "Email does not exists." });

    const passwordMatched = await bcrypt.compare(password, user.password);

    if (user && passwordMatched) {
      const token = jwt.sign(
        { id: user._id, role: user.role, name: user.username },
        process.env.JWT_SECRET,
        { expiresIn: "1d" },
      );
      res.status(200).json({ _id: user._id, username: user.username, token });
    } else {
      res.status(400).json({ message: "Invalid credentials" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.logout = (req, res) => {
  res.status(200).json({ message: "User logged out successfully" });
};
