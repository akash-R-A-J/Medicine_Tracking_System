const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Manufacturer = require("../models/manufacturerSchema");
const Equipment = require("../models/equipmentSchema");
const { auth } = require("../middlewares/auth");
const { SALT_ROUND, USER_JWT_SECRET } = require("../config");

// Blockchain related imports
// const {
//   Connection,
//   Keypair,
//   Transaction,
//   SystemProgram,
// } = require("@solana/web3.js");

// Initialize Solana connection (use devnet for testing)
// const connection = new Connection("https://api.devnet.solana.com", "confirmed");

const router = express.Router();

/* ACCOUNT MANAGEMENT ROUTES */

// @route   POST /api/manufacturer/register
// @desc    Register a new manufacturer
// @access  Public
router.post("/register", async (req, res) => {
  const {
    name,
    email,
    phone,
    address,
    country,
    website,
    registrationNumber,
    taxId,
    gstNumber,
    yearOfEstablishment,
    username,
    password,
  } = req.body;

  try {
    // Check if manufacturer already exists
    let manufacturer = await Manufacturer.findOne({ email });
    if (manufacturer) {
      return res
        .status(400)
        .json({ message: "Manufacturer with this email already exists" });
    }

    manufacturer = await Manufacturer.findOne({ username });
    if (manufacturer) {
      return res.status(400).json({ message: "Username already taken" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, SALT_ROUND);

    // Create new manufacturer
    manufacturer = new Manufacturer({
      name,
      email,
      phone,
      address,
      country,
      website,
      registrationNumber,
      taxId,
      gstNumber,
      yearOfEstablishment,
      username,
      password: hashedPassword,
      role: "manufacturer",
    });

    await manufacturer.save();

    // Generate JWT token
    const payload = {
      id: manufacturer._id,
      role: manufacturer.role,
    };

    // add expiration duration for this token
    const token = jwt.sign(payload, USER_JWT_SECRET); // why??

    res
      .status(201)
      .header({ "x-auth-token": token })
      .json({ token, message: "Manufacturer registered successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// @route   POST /api/manufacturer/login
// @desc    Login a manufacturer
// @access  Public
router.post("/login", async (req, res) => {
  // username => email
  const { username, password } = req.body;

  try {
    // Check if manufacturer exists
    const manufacturer = await Manufacturer.findOne({ username });
    if (!manufacturer) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, manufacturer.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate JWT token
    const payload = {
      id: manufacturer._id,
      role: manufacturer.role,
    };

    const token = jwt.sign(payload, USER_JWT_SECRET);

    res.json({ token, message: "Login successful" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// @route   GET /api/manufacturer/profile
// @desc    Get manufacturer profile
// @access  Private (Manufacturer only)
router.get("/profile", auth, async (req, res) => {
  try {
    const manufacturer = await Manufacturer.findById(req.user.id).select(
      "-password"
    );
    if (!manufacturer) {
      return res.status(404).json({ message: "Manufacturer not found" });
    }
    res.json(manufacturer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// @route   PUT /api/manufacturer/profile
// @desc    Update manufacturer profile
// @access  Private (Manufacturer only)
router.put("/profile", auth, async (req, res) => {
  const {
    name,
    email,
    phone,
    address,
    country,
    website,
    registrationNumber,
    taxId,
    gstNumber,
    yearOfEstablishment,
  } = req.body;

  try {
    const manufacturer = await Manufacturer.findById(req.user.id);
    if (!manufacturer) {
      return res.status(404).json({ message: "Manufacturer not found" });
    }

    // Update fields
    manufacturer.name = name || manufacturer.name;
    manufacturer.email = email || manufacturer.email;
    manufacturer.phone = phone || manufacturer.phone;
    manufacturer.address = address || manufacturer.address;
    manufacturer.country = country || manufacturer.country;
    manufacturer.website = website || manufacturer.website;
    manufacturer.registrationNumber =
      registrationNumber || manufacturer.registrationNumber;
    manufacturer.taxId = taxId || manufacturer.taxId;
    manufacturer.gstNumber = gstNumber || manufacturer.gstNumber;
    manufacturer.yearOfEstablishment =
      yearOfEstablishment || manufacturer.yearOfEstablishment;

    await manufacturer.save();
    res.json({ message: "Profile updated successfully", manufacturer });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// @route   POST /api/manufacturer/change-password
// @desc    Change manufacturer password
// @access  Private (Manufacturer only)
router.post("/change-password", auth, async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  try {
    const manufacturer = await Manufacturer.findById(req.user.id);
    if (!manufacturer) {
      return res.status(404).json({ message: "Manufacturer not found" });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(
      currentPassword,
      manufacturer.password
    );
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    // Hash new password
    manufacturer.password = await bcrypt.hash(newPassword, SALT_ROUND);

    await manufacturer.save();
    res.json({ message: "Password changed successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

/* EQUIPMENT MANAGEMENT */

// @route   POST /api/manufacturer/equipment/add
// @desc    Add new equipment
// @access  Private (Manufacturer only)
router.post("/equipment/add", auth, async (req, res) => {
  const { name, serialNumber, description } = req.body;

  try {
    // Check if equipment with this serial number already exists
    let equipment = await Equipment.findOne({ serialNumber });
    if (equipment) {
      return res
        .status(400)
        .json({ message: "Equipment with this serial number already exists" });
    }

    // Simulate Solana token creation (simplified for this example)
    // In a real implementation, you’d mint a token or create a program account
    const manufacturerPublicKey = req.user.id; // Replace with actual Solana public key in production

    // Create new equipment in MongoDB
    equipment = new Equipment({
      name,
      serialNumber,
      description,
      status: "Available",
      manufacturerId: req.user.id,
      currentOwner: manufacturerPublicKey,
      history: [{ action: "Created", user: manufacturerPublicKey }],
    });

    await equipment.save();
    res
      .status(201)
      .json({ message: "Equipment added successfully", equipment });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// @route   GET /api/manufacturer/equipment
// @desc    Get all equipment created by the manufacturer
// @access  Private (Manufacturer only)
router.get("/equipment", auth, async (req, res) => {
  try {
    const equipment = await Equipment.find({ manufacturerId: req.user.id });
    res.json(equipment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// @route   POST /api/manufacturer/equipment/transfer
// @desc    Transfer equipment ownership to a new owner (e.g., Distributor)
// @access  Private (Manufacturer only)
router.post("/equipment/transfer", auth, async (req, res) => {
  const { serialNumber, newOwnerPublicKey } = req.body;

  try {
    // Find the equipment
    const equipment = await Equipment.findOne({
      serialNumber,
      manufacturerId: req.user.id,
    });
    if (!equipment) {
      return res
        .status(404)
        .json({ message: "Equipment not found or not owned by you" });
    }

    // Simulate Solana ownership transfer
    // In a real implementation, you would sign a transaction to transfer the token or update the program account
    const manufacturerPublicKey = req.user.id; // Replace with actual Solana public key in production

    // Update equipment in MongoDB
    equipment.currentOwner = newOwnerPublicKey;
    equipment.status = "Transferred";
    equipment.history.push({
      action: "Transferred",
      user: manufacturerPublicKey,
      timestamp: new Date(),
    });

    await equipment.save();
    res.json({
      message: "Equipment ownership transferred successfully",
      equipment,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// @route   GET /api/manufacturer/compliance-logs
// @desc    Get compliance logs (simplified as equipment history for now)
// @access  Private (Manufacturer only)
router.get("/compliance-logs", auth, async (req, res) => {
  try {
    const equipment = await Equipment.find({ manufacturerId: req.user.id });
    const logs = equipment.flatMap((item) =>
      item.history.map((entry) => ({
        serialNumber: item.serialNumber,
        action: entry.action,
        user: entry.user,
        timestamp: entry.timestamp,
      }))
    );
    res.json(logs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
