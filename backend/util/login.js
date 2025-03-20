const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { getModel, getJWT } = require("./model");

async function login(req, res) {
  const { role, username, password } = req.body;

  try {
    const Model = getModel(role);
    const JWT_SECRET = getJWT(role);

    if (!Model || !JWT_SECRET)
      return res.status(400).json({ message: "Invalid role provided" });

    const user = await Model.findOne({ username });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    console.log(user);
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Wrong password" });

    console.log(isMatch);

    const payload = { id: user._id, role: user.role };
    const token = jwt.sign(payload, JWT_SECRET);

    // or add this token in headers
    res.json({ token, message: "Login successful" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
    return;
  }
}

module.exports = {
  login,
};
