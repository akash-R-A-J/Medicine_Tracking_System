const JWT = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { Router } = require("express");
const { UserModel } = require("../db");
const { USER_JWT_SECRET } = require("../config");
const { validateSigninInput } = require("../middlewares/inputValidation");

const signinRouter = Router();

signinRouter.post("/", validateSigninInput, async (req, res) => {
  const { email, password } = req.body;
  const user = await UserModel.findOne({
    email,
  });

  if (user) {
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (passwordMatch) {
      const token = JWT.sign({ userId: user._id }, USER_JWT_SECRET);
      res
        .status(200)
        .header({ token: token })
        .json({ msg: "You are signed in!" });
    } else {
      res.status(403).json({ msg: "wrong password" });
    }
  } else {
    res.status(403).json({ msg: "user not found" });
  }
});

module.exports = {
  signinRouter,
};
