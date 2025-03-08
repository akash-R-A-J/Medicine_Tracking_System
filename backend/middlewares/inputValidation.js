const { z } = require("zod");

function validateSignupInput(req, res, next) {
  const requiredBody = z.object({
    email: z.string().email().min(6).max(50),
    password: z.string().min(4).max(50),
    username: z.string().min(3).max(50),
    role: z.string().min(3).max(20),
  });

  const parsedDataWithSuccess = requiredBody.safeParse(req.body);

  if (!parsedDataWithSuccess.success) {
    return res
      .status(403)
      .json({ msg: "Invalid input", error: parsedDataWithSuccess.error });
  }

  next();
}

async function validateSigninInput(req, res, next) {
  // input validation
  const requiredBody = z.object({
    email: z.string().email().min(6).max(50),
    password: z.string().min(4).max(50),
  });

  const parsedDataWithSuccess = await requiredBody.safeParse(req.body);

  if (!parsedDataWithSuccess.success) {
    return res
      .status(403)
      .json({ msg: "Invalid input", error: parsedDataWithSuccess.error });
  }

  next();
}

module.exports = {
  validateSignupInput,
  validateSigninInput,
};
