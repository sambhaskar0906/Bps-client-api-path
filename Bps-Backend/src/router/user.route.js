import express from "express";
import {
  registerUser,
  getAllUsersForAdmin,
  getUserById,
  updateUser,
  deleteUser,
  countTotalAdmins,
  countTotalSupervisors,
  countBlacklistedSupervisors,
  countDeactivatedSupervisors,
  getSupervisorsList,
  getAdminsList,
  loginUser,
  getDeactivatedSupervisorsList,
  getBlacklistedSupervisorsList,
  updateSupervisorStatus,
  logoutUser,
  getUserProfile,
  sentResetCode,
  changePassword
} from "../controller/user.controller.js";

import { verifyJwt } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/multer.middleware.js"
import { multerErrorHandler } from "../utils/multerErrorHandler.js";
import verifyCode from "../middleware/verifyEmail.middleware.js";
const router = express.Router();

// Register user
router.route("/register").post(upload.fields([
  {
    name: "idProofPhoto",
    maxCount: 1
  },
  {
    name: "adminProfilePhoto",
    maxCount: 1
  }
]), multerErrorHandler, registerUser);
router.post("/login", loginUser);
router.get("/protected", verifyJwt, (req, res) => {
  res.status(200).json({ message: "This is a protected route" });
});

router.route("/profile").get(verifyJwt, getUserProfile);
router.route("/logout").post(verifyJwt, logoutUser)
// Admin user CRUD
router.get("/admin/users", getAllUsersForAdmin);
router.get("/admin/user/:adminId", getUserById);
router.route("/admin/user/:adminId").put(upload.fields([
  {
    name: "idProofPhoto",
    maxCount: 1
  },
  {
    name: "adminProfilePhoto",
    maxCount: 1
  }
]), multerErrorHandler, updateUser);

router.route("/changePassword").post(verifyJwt,changePassword);
router.route("/send-reset-code").post(sentResetCode);
router.delete("/admin/user/:adminId", verifyJwt, deleteUser);

// Admin user counts
router.get("/admin/count/admins", countTotalAdmins);
router.get("/admin/count/supervisors", countTotalSupervisors);
router.get("/admin/count/blacklisted-supervisors", countBlacklistedSupervisors);
router.get("/admin/count/deactivated-supervisors", countDeactivatedSupervisors);

// Admin role-based user lists
router.get("/admin/supervisors", getSupervisorsList);
router.get("/admin/admins", getAdminsList);
router.get("/admin/supervisors/deactivated", getDeactivatedSupervisorsList);
router.get("/admin/supervisors/blacklisted", getBlacklistedSupervisorsList);

// routes/supervisor.route.js (or similar)
router.patch("/update-status/:adminId/:action", updateSupervisorStatus);


export default router;