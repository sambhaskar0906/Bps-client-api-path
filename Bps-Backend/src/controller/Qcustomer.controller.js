import { QCustomer } from "../model/Qcustomer.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import fs from "fs/promises";
// Helper function to format customer list
const formatCustomerList = (customers) => {
    return customers.map((customer, index) => ({
        sNo: index + 1,
        customerId: customer.customerId,
        name: `${customer.firstName} ${customer.middleName ? customer.middleName + " " : ""}${customer.lastName}`,
        contactNumber: customer.contactNumber,
        firstName: customer.firstName,
        lastName: customer.lastName,
        emailId: customer.emailId,
        address: customer.address,
        state: customer.state,
        city: customer.city,
        pincode: customer.pincode,

    }));
};

// CREATE QCustomer
export const createCustomer = asyncHandler(async (req, res) => {

    const {
        firstName,
        middleName,
        lastName,
        contactNumber,
        emailId,
        address,
        district,
        state,
        city,
        idProof,
        pincode,
        stateCode,
        status = "active",
        isBlacklisted = false,
    } = req.body;

    // Validate required fields
    if ([firstName, lastName, emailId, address, state, city, idProof, stateCode].some(field => typeof field === "string" && field.trim() === "")) {
        throw new ApiError(400, "All required fields must be provided.");
    }

    // Check for existing email
    const existingCustomer = await QCustomer.findOne({ emailId });
    if (existingCustomer) {
        return res.status(400).json({ message: "Email is already registered." });

    }

    // Handle file uploads
    const idProofPhoto = req.files?.idProofPhoto?.[0]?.path || null;
    const customerProfilePhoto = req.files?.customerProfilePhoto?.[0]?.path || null;

    // Create new customer
    const customer = await QCustomer.create({
        firstName,
        middleName,
        lastName,
        contactNumber,
        emailId,
        address,
        district,
        state,
        city,
        idProof,
        status,
        isBlacklisted,
        idProofPhoto,
        customerProfilePhoto,
        pincode,
        stateCode,
        createdBy: req.user._id,
    });


    return res.status(201).json(new ApiResponse(201, "QCustomer created successfully", customer));
});

// GET All Customers
export const getAllCustomers = asyncHandler(async (req, res) => {
    const customers = await QCustomer.find(req.roleQueryFilter).lean();
    const customerList = formatCustomerList(customers);

    return res.status(200).json(new ApiResponse(200, "Customers fetched successfully", customerList));
});

// GET QCustomer by customerId (Full details)
export const getCustomerByCustomerId = asyncHandler(async (req, res) => {
    const customer = await QCustomer.findOne({ customerId: req.params.customerId });

    if (!customer) {
        throw new ApiError(404, "QCustomer not found");
    }

    return res.status(200).json(new ApiResponse(200, "QCustomer fetched successfully", customer));
});

// UPDATE QCustomer (Full details)
export const updateCustomer = asyncHandler(async (req, res) => {
    const updatedFields = req.body;
    const files = req.files || {};

    // Handle file paths if files were uploaded
    if (files.idProofPhoto) {
        updatedFields.idProofPhoto = files.idProofPhoto[0].path;
    }
    if (files.customerProfilePhoto) {
        updatedFields.customerProfilePhoto = files.customerProfilePhoto[0].path;
    }

    const updatedCustomer = await QCustomer.findOneAndUpdate(
        { customerId: req.params.customerId },
        updatedFields,
        {
            new: true,
            runValidators: true,
        }
    );

    if (!updatedCustomer) {
        throw new ApiError(404, "QCustomer not found");
    }

    // Return the updated customer with file paths
    return res.status(200).json(
        new ApiResponse(200, "QCustomer updated successfully", {
            ...updatedCustomer._doc,
            idProofPhoto: updatedCustomer.idProofPhoto,
            customerProfilePhoto: updatedCustomer.customerProfilePhoto,
        })
    );
});

// DELETE QCustomer
export const deleteCustomer = asyncHandler(async (req, res) => {
    const { customerId } = req.params;
    const deletedCustomer = await QCustomer.findOneAndDelete({ customerId });

    if (!deletedCustomer) {
        throw new ApiError(404, "QCustomer not found");
    }

    return res.status(200).json(new ApiResponse(200, "QCustomer deleted successfully"));
});

// GET Total QCustomer Count
export const getTotalCustomerCount = asyncHandler(async (req, res) => {
    const totalCustomer = await QCustomer.countDocuments(req.roleQueryFilter);

    return res.status(200).json(new ApiResponse(200, "Total customer count fetched successfully", { totalCustomer }));
});

// GET Active QCustomer Count
export const getActiveCustomerCount = asyncHandler(async (req, res) => {
    const activeCount = await QCustomer.countDocuments({ ...req.roleQueryFilter, status: "active", isBlacklisted: { $ne: true }, });

    return res.status(200).json(new ApiResponse(200, "Active customer count fetched successfully", { activeCount }));
});

// GET Blacklisted QCustomer Count
export const getBlacklistedCustomerCount = asyncHandler(async (req, res) => {
    const blacklistedCount = await QCustomer.countDocuments({ ...req.roleQueryFilter, isBlacklisted: true });

    return res.status(200).json(new ApiResponse(200, "Blacklisted customer count fetched successfully", { blacklistedCount }));
});

// GET Active Customers (List)
export const getActiveCustomers = asyncHandler(async (req, res) => {
    const activeCustomers = await QCustomer.find({ ...req.roleQueryFilter, status: "active", isBlacklisted: { $ne: true }, }).lean();
    const customerList = formatCustomerList(activeCustomers);

    return res.status(200).json(new ApiResponse(200, "Active customers fetched successfully", customerList));
});

// GET Blacklisted (Blocked) Customers (List)
export const getBlockedCustomers = asyncHandler(async (req, res) => {
    const blockedCustomers = await QCustomer.find({ ...req.roleQueryFilter, isBlacklisted: true }).lean();
    const customerList = formatCustomerList(blockedCustomers);

    return res.status(200).json(new ApiResponse(200, "Blocked customers fetched successfully", customerList));
});
// UPDATE customer status to ACTIVE using customerId
export const updateCustomerStatusToActive = asyncHandler(async (req, res) => {
    const { customerId } = req.params;

    const customer = await QCustomer.findOne({ customerId });
    if (!customer) {
        throw new ApiError(404, "QCustomer not found with the given customerId.");
    }

    customer.status = "active";
    customer.isBlacklisted = false;

    await customer.save({ validateModifiedOnly: true });

    return res.status(200).json(
        new ApiResponse(200, "QCustomer status updated to 'active' successfully", {
            customerId: customer.customerId,
            status: customer.status,
            isBlacklisted: customer.isBlacklisted,
        })
    );
});

// UPDATE customer status to BLACKLISTED using customerId
export const updateCustomerStatusToBlacklisted = asyncHandler(async (req, res) => {
    const { customerId } = req.params;

    const customer = await QCustomer.findOne({ customerId });
    if (!customer) {
        throw new ApiError(404, "QCustomer not found with the given customerId.");
    }

    customer.isBlacklisted = true;

    await customer.save({ validateModifiedOnly: true });

    return res.status(200).json(
        new ApiResponse(200, "QCustomer status updated to 'blacklisted' successfully", {
            customerId: customer.customerId,
            status: customer.status,
            isBlacklisted: customer.isBlacklisted,
        })
    );
});
