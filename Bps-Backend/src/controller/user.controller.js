import { User } from "../model/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import fs from "fs/promises";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import bcrypt from "bcrypt"
// Register a new user
export const registerUser = asyncHandler(async (req, res) => {
  try {
    if (req.body.role === 'admin' && req.body.isBlacklisted === true) {
      throw new ApiError(400, "Admin users cannot be blacklisted");
    }

    let userData = { ...req.body };

    if (req.files) {
      if (req.files['idProofPhoto']) {
        userData.idProofPhoto = req.files['idProofPhoto'][0].path;
      }
      if (req.files['adminProfilePhoto']) {
        userData.adminProfilePhoto = req.files['adminProfilePhoto'][0].path;
      }
    }

    if (!userData.idProofPhoto || !userData.adminProfilePhoto) {
      throw new ApiError(400, "Both idProofPhoto and adminProfilePhoto are required.");
    }

    const user = new User(userData);
    await user.save();

    res.status(201).json(new ApiResponse(201, "User registered successfully", user));
  } catch (error) {
    console.log("error message", error);

    // Handle MongoDB duplicate key error
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      const value = Object.values(error.keyValue)[0];
      throw new ApiError(409, `${field} '${value}' already exists.`);
    }

    throw new ApiError(400, error.message || "Registration failed");
  }
});

export const loginUser = asyncHandler(async (req, res) => {
  const { emailId, password } = req.body;

  if (!emailId || !password) {
    throw new ApiError(400, "Email and password are required");
  }

  const user = await User.findOne({ emailId }).select("+password");
  if (!user) {
    throw new ApiError(401, "Invalid email or password");
  }

  if (user.isBlacklisted) {
    throw new ApiError(403, "Your account has been blacklisted. Please contact support.");
  }

  if (user.isDeactivated) {
    throw new ApiError(403, "Your account has been deactivated. Please contact support.");
  }

  const isPasswordCorrect = await bcrypt.compare(password, user.password);
  if (!isPasswordCorrect) {
    throw new ApiError(401, "Invalid email or password");
  }

  // 🔐 Generate JWT
  const token = jwt.sign(
    {
      adminId: user.adminId,
      userId: user._id,
      role: user.role
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "10h" }
  );

  res.cookie("accessToken", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 10 * 60 * 60 * 1000
  });

  // ✅ SEND FULL PROFILE DATA
  res.status(200).json(
    new ApiResponse(200, "Login successful", {
      token,
      user: {
        adminId: user.adminId,
        role: user.role,
        firstName: user.firstName,
        middleName: user.middleName,
        lastName: user.lastName,
        fullName: `${user.firstName} ${user.middleName ?? ""} ${user.lastName}`.trim(),
        emailId: user.emailId,
        contactNumber: user.contactNumber,
        adminProfilePhoto: user.adminProfilePhoto,
        startStation: user.startStation,
        stationCode: user.stationCode
      }
    })
  );
});

// Logout User
const tokenBlacklist = new Set();

export const logoutUser = asyncHandler(async (req, res) => {
  try {
    // Get token from cookie or Authorization header
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "").trim();

    // Blacklist the token if available
    if (token) {
      tokenBlacklist.add(token);
    }

    // Clear the access token cookie
    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/"
    });

    res.status(200).json(new ApiResponse(200, "User logged out successfully"));
  } catch (error) {
    console.error("Logout error:", error.message);
    throw new ApiError(500, "Logout failed", error.message);
  }
});

//User profile
export const getUserProfile = asyncHandler(async (req, res) => {
  res.status(200).json(new ApiResponse(200, "User fetched successfully", req.user));
});

// Get all users for admin 
export const getAllUsersForAdmin = asyncHandler(async (req, res) => {
  try {
    const users = await User.find().select("adminId firstName lastName contactNumber");

    const formattedUsers = users.map((user, index) => ({
      sNo: index + 1,
      adminId: user.adminId,
      name: `${user.firstName} ${user.lastName}`,
      contact: user.contactNumber,
    }));

    res.status(200).json(new ApiResponse(200, "Users fetched successfully", formattedUsers));
  } catch (error) {
    throw new ApiError(500, "Error fetching users", error.message);
  }
});

// Get user by ID
export const getUserById = asyncHandler(async (req, res) => {
  try {
    const adminId = req.params.adminId
    const user = await User.findOne({ adminId });
    if (!user) {
      throw new ApiError(404, "User not found");
    }
    res.status(200).json(new ApiResponse(200, "User fetched successfully", user));
  } catch (error) {
    throw new ApiError(500, error.message);
  }
});

// Update user by ID
export const updateUser = asyncHandler(async (req, res) => {
  try {
    const adminId = req.params.adminId;
    if (!adminId) {
      throw new ApiError(400, "adminId is required to update user");
    }

    // Clone body data
    let updatedData = { ...req.body };

    // Find user by adminId
    const existingUser = await User.findOne({ adminId });
    if (!existingUser) {
      throw new ApiError(404, "User not found");
    }

    // Handle uploaded files
    if (req.files) {
      // ID Proof Photo
      if (req.files["idProofPhoto"]) {
        if (existingUser.idProofPhoto) {
          try {
            await fs.unlink(existingUser.idProofPhoto);
          } catch (unlinkError) {
            console.error("Error deleting old idProofPhoto:", unlinkError);
          }
        }
        updatedData.idProofPhoto = req.files["idProofPhoto"][0].path;
      }

      // Admin Profile Photo
      if (req.files["adminProfilePhoto"]) {
        if (existingUser.adminProfilePhoto) {
          try {
            await fs.unlink(existingUser.adminProfilePhoto);
          } catch (unlinkError) {
            console.error("Error deleting old adminProfilePhoto:", unlinkError);
          }
        }
        updatedData.adminProfilePhoto = req.files["adminProfilePhoto"][0].path;
      }
    }

    // Update user
    const updatedUser = await User.findOneAndUpdate({ adminId }, updatedData, {
      new: true,
      runValidators: true,
    });

    res
      .status(200)
      .json(new ApiResponse(200, "User updated successfully", updatedUser));
  } catch (error) {
    console.error("Update user error:", error.message);
    throw new ApiError(400, error.message);
  }
});

// Count total admins
export const countTotalAdmins = asyncHandler(async (req, res) => {
  const totalAdmins = await User.countDocuments({ role: 'admin' });
  res.status(200).json(new ApiResponse(200, "Total number of admins fetched", totalAdmins));
});

// Count total supervisors
export const countTotalSupervisors = asyncHandler(async (req, res) => {
  const totalSupervisors = await User.countDocuments({ role: 'supervisor', isActive: true, isBlacklisted: false, isDeactivated: false });
  res.status(200).json(new ApiResponse(200, "Total number of supervisors fetched", totalSupervisors));
});

// Count blacklisted supervisors
export const countBlacklistedSupervisors = asyncHandler(async (req, res) => {
  const blacklistedSupervisors = await User.countDocuments({ role: 'supervisor', isBlacklisted: true });
  res.status(200).json(new ApiResponse(200, "Total blacklisted supervisors fetched", blacklistedSupervisors));
});

// Count deactivated supervisors
export const countDeactivatedSupervisors = asyncHandler(async (req, res) => {
  const deactivatedSupervisors = await User.countDocuments({ role: 'supervisor', isDeactivated: true, isActive: false, isBlacklisted: false });
  res.status(200).json(new ApiResponse(200, "Total deactivated supervisors fetched", deactivatedSupervisors));
});

// Get list of all supervisors
export const getSupervisorsList = asyncHandler(async (req, res) => {
  try {
    const supervisors = await User.find({ role: 'supervisor', isActive: true, isBlacklisted: false, isDeactivated: false }).select("adminId firstName lastName contactNumber");

    const formattedSupervisors = supervisors.map((supervisor, index) => ({
      sNo: index + 1,
      adminId: supervisor.adminId,
      name: `${supervisor.firstName} ${supervisor.lastName}`,
      contact: supervisor.contactNumber,
    }));

    res.status(200).json(new ApiResponse(200, "Supervisors fetched successfully", formattedSupervisors));
  } catch (error) {
    throw new ApiError(500, "Error fetching supervisors", error.message);
  }
});

// Get list of all admins
export const getAdminsList = asyncHandler(async (req, res) => {
  try {
    const admins = await User.find({ role: 'admin' }).select("adminId firstName lastName contactNumber");

    const formattedAdmins = admins.map((admin, index) => {
      console.log("Fetched Admin:", {
        index: index + 1,
        adminId: admin.adminId,
        name: `${admin.firstName} ${admin.lastName}`,
        contact: admin.contactNumber,
      });

      return {
        "S.No": index + 1,
        adminId: admin.adminId,
        name: `${admin.firstName} ${admin.lastName}`,
        contact: admin.contactNumber,
      };
    });

    res.status(200).json(new ApiResponse(200, "Admins fetched successfully", formattedAdmins));
  } catch (error) {
    throw new ApiError(500, "Error fetching admins", error.message);
  }
});

// Get list of deactivated supervisors
export const getDeactivatedSupervisorsList = asyncHandler(async (req, res) => {
  try {
    const deactivatedSupervisors = await User.find({ role: 'supervisor', isActive: false, isBlacklisted: false, isDeactivated: true })
      .select("adminId firstName lastName contactNumber");

    const formattedDeactivatedSupervisors = deactivatedSupervisors.map((supervisor, index) => ({
      sNo: index + 1,
      adminId: supervisor.adminId,
      name: `${supervisor.firstName} ${supervisor.lastName}`,
      contact: supervisor.contactNumber,
      userId: supervisor._id,
    }));

    res.status(200).json(new ApiResponse(200, "Deactivated supervisors fetched successfully", formattedDeactivatedSupervisors));
  } catch (error) {
    throw new ApiError(500, "Error fetching deactivated supervisors", error.message);
  }
});

// Get list of blacklisted supervisors
export const getBlacklistedSupervisorsList = asyncHandler(async (req, res) => {
  try {
    const blacklistedSupervisors = await User.find({ role: 'supervisor', isBlacklisted: true })
      .select("adminId firstName lastName contactNumber");

    const formattedBlacklistedSupervisors = blacklistedSupervisors.map((supervisor, index) => ({
      sNo: index + 1,
      adminId: supervisor.adminId,
      name: `${supervisor.firstName} ${supervisor.lastName}`,
      contact: supervisor.contactNumber,

    }));

    res.status(200).json(new ApiResponse(200, "Blacklisted supervisors fetched successfully", formattedBlacklistedSupervisors));
  } catch (error) {
    throw new ApiError(500, "Error fetching blacklisted supervisors", error.message);
  }
});

export const deleteUser = asyncHandler(async (req, res) => {
  try {

    const { adminId } = req.params;
    const deleteUser = await User.findOneAndDelete({ adminId });
    if (!deleteUser) {
      res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(new ApiResponse(200, "User deleted successfully"));
  } catch (error) {
    console.error("Delete user error:", error.message);
    throw new ApiError(500, error.message);
  }
});

export const updateSupervisorStatus = asyncHandler(async (req, res) => {
  const { adminId, action } = req.params;

  const allowedActions = ["available", "blacklisted", "deactivated"];
  if (!allowedActions.includes(action)) {
    throw new ApiError(400, `Invalid action. Allowed actions: ${allowedActions.join(", ")}`);
  }

  const supervisor = await User.findOne({ adminId, role: "supervisor" });
  if (!supervisor) {
    throw new ApiError(404, "Supervisor not found with the given adminId.");
  }

  switch (action) {
    case "available":
      supervisor.isActive = true;
      supervisor.isBlacklisted = false;
      supervisor.isDeactivated = false
      break;

    case "blacklisted":
      supervisor.isActive = false; // IMPORTANT: blacklist means deactivate from active
      supervisor.isBlacklisted = true;
      supervisor.isDeactivated = false
      break;

    case "deactivated":
      supervisor.isActive = false;
      supervisor.isBlacklisted = false;
      supervisor.isDeactivated = true;
      break;
  }

  await supervisor.save({ validateModifiedOnly: true });

  return res.status(200).json(
    new ApiResponse(200, `Supervisor status updated to '${action}' successfully`, {
      adminId: supervisor.adminId,
      isActive: supervisor.isActive,
      isBlacklisted: supervisor.isBlacklisted,
      isDeactivated: supervisor.isDeactivated,
    })
  );
});

export const changePassword = asyncHandler(async (req, res) => {
  const { oldpassword, newPassword, emailId, code } = req.body;
  let user;
  // Case 1: Authenticated user using old password
  if (oldpassword) {
    user = await User.findById(req.user?._id);
    console.log("Found user by auth:", user?.emailId);

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    const isValidPassword = await user.isPasswordCorrect(oldpassword);
    if (!isValidPassword) {
      throw new ApiError(401, "Invalid old password");
    }
  }

  // Case 2: Reset password via email + code (unauthenticated)
  else if (emailId && code) {
    user = await User.findOne({ emailId });
    console.log("Found user by emailId:", user?.emailId);

    if (!user) {
      throw new ApiError(404, "User not found");
    }


    if (
      !user.verificationCode ||
      !user.verificationCodeExpires ||
      String(user.verificationCode) !== String(code) ||
      user.verificationCodeExpires < Date.now()
    ) {
      throw new ApiError(400, "Invalid or expired verification code");
    }

    // Clear the code after successful verification
    user.verificationCode = undefined;
    user.verificationCodeExpires = undefined;
    await user.save({ validateBeforeSave: false });
  }

  // Case 3: Neither method provided
  else {
    throw new ApiError(400, "Provide either old password or reset code");
  }

  // Set new password
  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "User password successfully changed"));
});

export const sentResetCode = asyncHandler(async (req, res) => {
  try {
    const { emailId } = req.body;
    const user = await User.findOne({ emailId });

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    user.verificationCode = code;
    user.verificationCodeExpires = Date.now() + 10 * 60 * 1000;
    // Save without validation (to only update the code fields)
    await user.save({ validateBeforeSave: false });

    // Send the email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.gmail,
        pass: process.env.app_pass,
      },
    });

    await transporter.sendMail({
      from: process.env.gmail,
      to: user.emailId,
      subject: "Reset Your Password",
      text: `Your password reset code is: ${code}`,
    });

    res.status(200).json(new ApiResponse(200, {}, "Verification Code successfully sent"));
  } catch (error) {
    console.error("Error in sendResetCode:", error.message, error.stack);
    res.status(500).json({ message: "Something went wrong", error: error.message });
  }
});
export { tokenBlacklist };
