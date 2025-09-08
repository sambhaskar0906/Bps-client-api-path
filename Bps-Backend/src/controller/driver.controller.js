import { Driver } from "../model/driver.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import fs from "fs/promises";
import { upload } from "../middleware/multer.middleware.js"
// Helper function to format driver list
const formatDriverList = (drivers) => {

    return drivers.map((driver, index) => ({
        sNo: index + 1,
        driverId: driver.driverId,
        name: `${driver.firstName} ${driver.middleName ? driver.middleName + ' ' : ''}${driver.lastName}`,
        contactNumber: driver.contactNumber,
        actions: [
            { name: "View", icon: "view-icon", action: `/api/drivers/${driver.driverId}` },
            { name: "Edit", icon: "edit-icon", action: `/api/drivers/edit/${driver.driverId}` },
            { name: "Delete", icon: "delete-icon", action: `/api/drivers/delete/${driver.driverId}` }
        ]
    }));
};

// Create Driver
export const createDriver = asyncHandler(async (req, res) => {
    const {
        firstName,
        middleName,
        lastName,
        contactNumber,
        emailId,
        password,
        address,
        pincode,
        district,
        state,
        city,
        dlNumber,
        idProof,
        isAvailable,
        isBlacklisted
    } = req.body;

    if ([firstName, lastName, emailId, password, address, state, city, dlNumber, idProof]
        .some(field => typeof field === "string" && field.trim() === "")) {
        throw new ApiError(400, "All required fields must be provided.");
    }
    const idProofPhoto = req.files?.idProofPhoto?.[0]?.path || null;
    const driverProfilePhoto = req.files?.driverProfilePhoto?.[0]?.path || null;

    const existingDriver = await Driver.findOne({ emailId });
    if (existingDriver) {
        throw new ApiError(409, "Email is already registered.");
    }

    const driver = await Driver.create({
        firstName,
        middleName,
        lastName,
        contactNumber,
        emailId,
        password,
        address,
        district,
        state,
        city,
        dlNumber,
        idProof,
        idProofPhoto,
        driverProfilePhoto,
        pincode,
        isBlacklisted: isBlacklisted === "true" || isBlacklisted === true,
        isAvailable: isAvailable === "true" || isAvailable === true,
        createdBy: req.user._id,
    });


    return res.status(201).json(new ApiResponse(201, "Driver created successfully", driver));
});

// Get All Drivers (Formatted forntend data )
export const getAllDrivers = asyncHandler(async (req, res) => {
    const drivers = await Driver.find(req.roleQueryFilter);
    const driverList = formatDriverList(drivers);
    return res.status(200).json(new ApiResponse(200, "All drivers fetched successfully", driverList));
});

// Get Available Drivers (Formatted data)
export const getAvailableDrivers = asyncHandler(async (req, res) => {
    const drivers = await Driver.find({ ...req.roleQueryFilter, isAvailable: true, isBlacklisted: false });
    const driverList = formatDriverList(drivers);
    return res.status(200).json(new ApiResponse(200, "Available drivers fetched successfully", driverList));
});

// Get Blacklisted Drivers (Formatted)
export const getBlacklistedDrivers = asyncHandler(async (req, res) => {
    const drivers = await Driver.find({ ...req.roleQueryFilter, isBlacklisted: true });
    const driverList = formatDriverList(drivers);
    return res.status(200).json(new ApiResponse(200, "Blacklisted drivers fetched successfully", driverList));
});

// Get Total Drivers Count
export const getTotalDriversCount = asyncHandler(async (req, res) => {
    const totalDrivers = await Driver.countDocuments(req.roleQueryFilter);
    return res.status(200).json(new ApiResponse(200, "Total drivers count fetched", totalDrivers));
});


// Get Available Drivers Count
export const getAvailableDriversCount = asyncHandler(async (req, res) => {
    const count = await Driver.countDocuments({ ...req.roleQueryFilter, isAvailable: true, isBlacklisted: false });
    return res.status(200).json(new ApiResponse(200, "Available drivers count fetched", count));
});

// Get Blacklisted Drivers Count
export const getBlacklistedDriversCount = asyncHandler(async (req, res) => {
    const count = await Driver.countDocuments({ ...req.roleQueryFilter, isBlacklisted: true });
    return res.status(200).json(new ApiResponse(200, "Blacklisted drivers count fetched", count));
});

//  Get Driver by driverId (custom ID)
export const getDriverByDriverId = asyncHandler(async (req, res) => {
    const driver = await Driver.findOne({ driverId: req.params.driverId });
    if (!driver) {
        throw new ApiError(404, "Driver not found");
    }
    return res.status(200).json(new ApiResponse(200, "Driver fetched", driver));
});

//  Get Driver by _id (ObjectId)
export const getDriverById = asyncHandler(async (req, res) => {
    const driver = await Driver.findById(req.params.id);
    if (!driver) {
        throw new ApiError(404, "Driver not found");
    }
    return res.status(200).json(new ApiResponse(200, "Driver fetched", driver));
});

//  Update Driver by _id
export const updateDriver = asyncHandler(async (req, res) => {
    const { idProofPhoto, driverProfilePhoto } = req.files;

    const idProofPhotoPath = idProofPhoto ? idProofPhoto[0].path : undefined;
    const driverProfilePhotoPath = driverProfilePhoto ? driverProfilePhoto[0].path : undefined;

    const updatedData = {
        ...req.body,
    };

    if (idProofPhotoPath) updatedData.idProofPhoto = idProofPhotoPath;
    if (driverProfilePhotoPath) updatedData.driverProfilePhoto = driverProfilePhotoPath;

    const updatedDriver = await Driver.findOneAndUpdate(
        { driverId: req.params.id },
        updatedData,
        { new: true, runValidators: true }
    );

    if (!updatedDriver) {
        throw new ApiError(404, 'Driver not found with the given driverId');
    }

    return res.status(200).json(new ApiResponse(200, 'Driver updated successfully', updatedDriver));
});



export const updateDriverStatus = asyncHandler(async (req, res) => {
    const { driverId, status } = req.params;

    let updateFields = {};

    switch (status.toLowerCase()) {
        case "available":
            updateFields = { isAvailable: true, isBlacklisted: false, isDeactived: false };
            break;
        case "blacklist":
            updateFields = { isAvailable: false, isBlacklisted: true, isDeactived: false };
            break;
        case "deactive":
            updateFields = { isAvailable: false, isBlacklisted: false, isDeactived: true };
            break;

        default:
            throw new ApiError(400, "Invalid status. Use 'available', 'blacklist', or 'deactive'");
    }

    const driver = await Driver.findOneAndUpdate(
        { driverId },
        updateFields,
        { new: true, runValidators: true }
    );

    if (!driver) {
        throw new ApiError(404, "Driver not found");
    }

    return res.status(200).json(
        new ApiResponse(200, "Driver status updated successfully", driver)
    );
});

export const getDeactivedDrivers = asyncHandler(async (req, res) => {
    const drivers = await Driver.find({ ...req.roleQueryFilter, isDeactived: true });
    const driverList = formatDriverList(drivers);
    return res.status(200).json(new ApiResponse(200, "Deactived drivers fetched successfully", driverList));
});
export const getDeactivedDriversCount = asyncHandler(async (req, res) => {
    const count = await Driver.countDocuments({ ...req.roleQueryFilter, isDeactived: true });
    return res.status(200).json(new ApiResponse(200, "Deactived drivers count fetched", count));
});

// delete krne k liye
export const deleteDriver = asyncHandler(async (req, res) => {
    const deletedDriver = await Driver.findOneAndDelete({ driverId: req.params.id });

    if (!deletedDriver) {
        throw new ApiError(404, "Driver not found with the given driverId");
    }

    return res.status(200).json(
        new ApiResponse(200, "Driver deleted successfully", deletedDriver)
    );
});

