import express from "express";
import {
  createVehicle,
  getAllVehicles,
  getVehicleById,
  updateVehicle,
  deleteVehicle,
  getTotalVehiclesCount,
  getAvailableVehiclesCount,
  getDeactivatedVehiclesCount,
  getBlacklistedVehiclesCount,
  getBlacklistedVehicles,
  getDeactivatedVehicles,
  getAvailableVehicles,
  updateVehicleStatus
} from "../controller/vehicle.controller.js";
import { parseFormData } from "../middleware/multerParser.middleware.js";
const router = express.Router();


router.post("/vehicle",parseFormData, createVehicle);


router.get("/getAllvehicle", getAllVehicles);

router.get("/vehicle/:vehicleId", getVehicleById);

router.patch("/vehicles/:vehicleId/status", updateVehicleStatus);


router.get("/vehicle/:id", getVehicleById);


router.put("/vehicle/:vehicleId",updateVehicle);


router.delete("/vehicle/:vehicleId", deleteVehicle);

router.get('/total-vehicles', getTotalVehiclesCount);
router.get('/available-vehicles', getAvailableVehiclesCount);
router.get('/deactivated-vehicles', getDeactivatedVehiclesCount);
router.get('/blacklisted-vehicles', getBlacklistedVehiclesCount);
router.get('/blacklisted-vehicles-List', getBlacklistedVehicles);
router.get('/deactivated-vehicles-List', getDeactivatedVehicles);
router.get('/available-vehicles-List', getAvailableVehicles)
export default router;
