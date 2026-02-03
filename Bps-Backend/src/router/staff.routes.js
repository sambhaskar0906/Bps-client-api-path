import express from "express";
import {
    createStaff,
    getAllStaff,
    getStaffById,
    updateStaff,
    updateStaffStatus,
    deleteStaff
} from "../controller/staff.controller.js";

import { staffMulter, staffCloudinary } from "../middleware/staff.middleware.js";

const router = express.Router();

router.post("/", staffMulter, staffCloudinary, createStaff);
router.put("/:id", staffMulter, staffCloudinary, updateStaff);

router.get("/", getAllStaff);
router.get("/:id", getStaffById);
router.patch("/:id/status", updateStaffStatus);
router.delete("/:id", deleteStaff);

export default router;
