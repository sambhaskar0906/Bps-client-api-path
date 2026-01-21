import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { User } from "../model/user.model.js";
import { tokenBlacklist } from "../controller/user.controller.js";
export const verifyJwt = asyncHandler(async (req, res, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "").trim();

    if (!token) {
      throw new ApiError(401, "Unauthorized request");
    }
    if (tokenBlacklist.has(token)) {
      throw new ApiError(401, "Token has been revoked. Please login again.");
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const user = await User.findOne({ adminId: decodedToken?.adminId }).select("-password -refreshToken");

    if (!user) {
      throw new ApiError(401, "Invalid user");
    }

    req.user = {
      _id: user._id,
      adminId: user.adminId,
      role: user.role,
      startStation: user.startStation,
      stationCode: user.stationCode
    };

    next();
  } catch (error) {
    console.error("JWT verification error:", error.message);

    if (error.name === "TokenExpiredError") {
      throw new ApiError(401, "Token has expired");
    }

    throw new ApiError(401, "Invalid or expired token");
  }
});
