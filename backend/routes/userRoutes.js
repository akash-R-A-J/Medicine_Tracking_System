const express = require("express");
const router = express.Router();
const { UserModel } = require("../db");

// ✅ Create a new user (Hospital/Store/Manufacturer)
router.post("/register", async (req, res) => {
  try {
    const { username, password, role, walletAddress } = req.body;
    const user = new UserModel({ username, password, role, walletAddress });
    await user.save();
    res.status(201).json({ message: "User registered successfully", user });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ✅ Get all users
router.get("/", async (req, res) => {
  const users = await UserModel.find();
  res.json(users);
});

// ✅ Get user by ID
router.get("/:id", async (req, res) => {
  const user = await UserModel.findById(req.params.id);
  res.json(user);
});

// ✅ Delete user
router.delete("/:id", async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ message: "User deleted" });
});

module.exports = router;
