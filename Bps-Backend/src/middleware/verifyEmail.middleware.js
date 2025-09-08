import { User } from "../model/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const verifyCode = asyncHandler(async (req, res, next) => {
  const { emailId, code } = req.body;

  if (!emailId || !code) {
    throw new ApiError(400, "Email and code are required");
  }

  const user = await User.findOne({ emailId });

  if (!user || user.verificationCode !== code) {
    throw new ApiError(400, "User not found or verification code didn’t match");
  }

  if (user.verificationCodeExpires < Date.now()) {
    throw new ApiError(400, "Verification code expired");
  }

  req.userToReset = user;
  next();
});

export default verifyCode;