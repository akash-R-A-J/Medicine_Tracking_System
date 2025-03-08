const { Router } = require("express");
const bcrypt = require("bcrypt");
const { UserModel } = require("../db");
const {SALT_ROUND} = require("../config");
const { validateSignupInput } = require("../middlewares/inputValidation");

const signupRouter = Router();

signupRouter.post("/", validateSignupInput, async (req, res) => {
  const { username, password, role, email, phone, walletAddress } = req.body;
  const user = await UserModel.findOne({
    email,
    phone,
  });

  if (user) {
    return res.status(403).json({ msg: "User already exist, try signin-in" });
  }
  
  try{
    const hashedPassword = await bcrypt.hash(password, SALT_ROUND);
    await UserModel.create({
        username,
        password: hashedPassword,
        role,
        email,
        walletAddress,
    });
    
    res.status(200).json({
        msg: "user signed-up!",
    });
    
  }catch(e){
    console.log("error: " + e);
    res.status(403).json({ msg: "table creation failed", error: e.message });
  }
});

module.exports = {
  signupRouter,
}
