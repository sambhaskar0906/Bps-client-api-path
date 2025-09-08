

import express from "express";
import { createTracking, getTrackingLocation,updateTrackingLocation } from "../controller/tracker.controller.js";
import {parseFormData } from "../middleware/multerParser.middleware.js";
const router = express.Router();


router.post("/create",parseFormData , createTracking);

// Get current location for order
router.get("/track-location/:orderId", getTrackingLocation);

router.put("/update/:bookingId",updateTrackingLocation);


export default router;
