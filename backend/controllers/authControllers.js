const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const usernameExists = await User.findOne({ username });
    if (usernameExists)
      return res.status(400).json({ message: "Username is already taken." });

    const emailExists = await User.findOne({ email });
    if (emailExists)
      return res
        .status(400)
        .json({ message: "This email is already registered." });

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
      res.status(200).json({ _id: user._id, username: user.username, email: user.email, token });
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
