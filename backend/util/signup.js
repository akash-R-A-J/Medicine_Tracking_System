const bcrypt = require("bcrypt");
const { SALT_ROUND } = require("../config");
const { getModel } = require("./model");

// input must include role from the frontend
async function signup(req, res) {
  const {
    role,
    name,
    email,
    phone,
    address,
    country,
    website,
    registrationNumber,
    taxId,
    yearOfEstablishment,
    username,
    password,
    publicKey,
  } = req.body;

  const Model = getModel(role);

  try {
    // check if a user already exist or not?
    const userExists = await doesExist(Model, email, username, res);
    if (userExists) return;

    const gstNumber = role == "manufacturer" ? req.body.gstNumber : null;
    const hashedPassword = await bcrypt.hash(password, SALT_ROUND);

    let user = new Model({
      name,
      email,
      phone,
      address,
      country,
      website,
      registrationNumber,
      taxId: taxId || undefined,
      yearOfEstablishment,
      username,
      password: hashedPassword,
      role,
      publicKey,
    });

    // for manufacturer
    if (gstNumber) {
      user.gstNumber = gstNumber;
    }

    await user.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
}

// returns true if a user already exist, else false
async function doesExist(Model, email, username, res) {
  try {
    let user = await Model.findOne({ $or: [{ email }, { username }] });
    if (user) {
      res.status(400).json({
        message:
          user.email === email
            ? "User with this email already exists"
            : "Username already taken",
      });
      return true;
    }
    return false;
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
    return true;
  }
}

module.exports = {
  signup,
};
