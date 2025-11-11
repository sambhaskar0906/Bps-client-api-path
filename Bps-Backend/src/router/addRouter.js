import express from "express";
import {
    addOption,
    getAllOptions,
    getOptionsByField,
    updateOption,
    deleteOption,
    deleteMultipleOptions
} from "../controller/addController.js";

const router = express.Router();

// Add new option
router.post("/add", addOption);

// Get all options
router.get("/all", getAllOptions);

// Get options by field name
router.get("/field/:fieldName", getOptionsByField);

// Update option
router.put("/update/:id", updateOption);

// Delete single option
router.delete("/delete/:id", deleteOption);

// Delete multiple options
router.delete("/delete-multiple", deleteMultipleOptions);

export default router;