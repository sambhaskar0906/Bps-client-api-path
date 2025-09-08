import express from "express";
import {
    createDriver,
    getAllDrivers,
    getDriverById,
    getDriverByDriverId,
    updateDriver,
    deleteDriver,
    getTotalDriversCount,
    getAvailableDrivers,
    getBlacklistedDrivers,
    getAvailableDriversCount,
    getBlacklistedDriversCount,
    updateDriverStatus,
    getDeactivedDriversCount,
    getDeactivedDrivers
} from "../controller/driver.controller.js";

import { upload } from "../middleware/multer.middleware.js";
import { multerErrorHandler } from "../utils/multerErrorHandler.js";
const router = express.Router();

// 
router.route("/create").post(upload.fields([
      {
          name:"idProofPhoto",
          maxCount :1
      },{
          name:"driverProfilePhoto",
          maxCount:1
      }
  ]),multerErrorHandler , createDriver);

// Get All Drivers
router.get("/all", getAllDrivers);

//  Get Available Drivers List
router.get("/available-list", getAvailableDrivers);

//  Get Blacklisted Drivers List
router.get("/blacklisted-list", getBlacklistedDrivers);

//  Get Total Driver Count
router.get("/total-count", getTotalDriversCount);

// Get Available Drivers Count
router.get("/available-count", getAvailableDriversCount);

//  Get Blacklisted Drivers Count
router.get("/blacklisted-count", getBlacklistedDriversCount);

// Get Deactived List
router.get("/deactive-list",getDeactivedDrivers);

//Get Deactive Count

router.get("/deactive-count",getDeactivedDriversCount)
//  Get Driver by Mongo _id
router.get("/:id", getDriverById);

//  Get Driver by custom driverId
router.get("/driver-id/:driverId", getDriverByDriverId);

//  Update Driver details
router.route("/update/:id").put(upload.fields([
    {
        name:"idProofPhoto",
        maxCount :1
    },{
        name:"driverProfilePhoto",
        maxCount:1
    }
]),multerErrorHandler ,updateDriver);

//  Update only Driver Status (isAvailable, isBlacklisted,isDeactived)

router.patch("/driver/status/:driverId/:status", updateDriverStatus);

//  Delete Driver
router.delete("/delete/:id", deleteDriver);

export default router;
