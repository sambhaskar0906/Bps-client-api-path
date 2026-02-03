import Staff from "../model/staff.model.js";
import { uploadToCloudinary } from "../utils/uploadPdfToCloudinary.js";
import cloudinary from "../utils/cloudinary.js";

/* =====================================================
   CREATE STAFF
===================================================== */
export const createStaff = async (req, res) => {
    try {
        const {
            firstName,
            lastName,
            contactNumber,
            email,
            aadharNumber,
            addressLine,
            state,
            city,
            district,
            pincode
        } = req.body;

        // Validation
        const requiredFields = [
            firstName, lastName, contactNumber, email,
            aadharNumber, addressLine, state, city, district, pincode
        ];

        if (requiredFields.some(f => !f)) {
            return res.status(400).json({
                status: false,
                message: "All required fields must be provided"
            });
        }

        // Duplicate check
        const existing = await Staff.findOne({
            $or: [{ email }, { contactNumber }, { aadharNumber }]
        });

        if (existing) {
            return res.status(409).json({
                status: false,
                message: "Staff already exists"
            });
        }

        // ✅ get docs from middleware
        const aadharCardPhoto = req.staffDocs?.aadharCardPhoto || null;
        const passportPhoto = req.staffDocs?.passportPhoto || null;

        const staff = await Staff.create({
            firstName,
            lastName,
            contactNumber,
            email,
            aadharNumber,
            documents: {
                aadharCardPhoto,
                passportPhoto
            },
            address: {
                addressLine,
                state,
                city,
                district,
                pincode
            },
            status: "active"
        });

        return res.status(201).json({
            status: true,
            message: "Staff created successfully",
            data: staff
        });

    } catch (error) {
        console.error("CREATE STAFF ERROR:", error);

        return res.status(500).json({
            status: false,
            message: "Create staff failed",
            error: error.message
        });
    }
};


/* =====================================================
   GET ALL STAFF (Pagination + Filter + Search)
===================================================== */
export const getAllStaff = async (req, res) => {
    try {
        const { page = 1, limit = 10, status, search } = req.query;

        const query = { isDeleted: false };

        if (status) query.status = status;

        if (search) {
            query.$or = [
                { firstName: { $regex: search, $options: "i" } },
                { lastName: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } },
                { contactNumber: { $regex: search, $options: "i" } }
            ];
        }

        const data = await Staff.find(query)
            .skip((page - 1) * limit)
            .limit(Number(limit))
            .sort({ createdAt: -1 });

        const total = await Staff.countDocuments(query);

        return res.json({
            status: true,
            message: "Staff list fetched successfully",
            meta: {
                total,
                page: Number(page),
                limit: Number(limit),
                pages: Math.ceil(total / limit)
            },
            data
        });

    } catch (error) {
        return res.status(500).json({
            status: false,
            message: "Fetch staff failed",
            error: error.message
        });
    }
};

/* =====================================================
   GET STAFF BY ID
===================================================== */
export const getStaffById = async (req, res) => {
    try {
        const staff = await Staff.findOne({
            _id: req.params.id,
            isDeleted: false
        });

        if (!staff) {
            return res.status(404).json({
                status: false,
                message: "Staff not found"
            });
        }

        return res.json({
            status: true,
            data: staff
        });

    } catch (error) {
        return res.status(500).json({
            status: false,
            message: "Fetch staff failed",
            error: error.message
        });
    }
};

/* =====================================================
   UPDATE STAFF
===================================================== */
export const updateStaff = async (req, res) => {
    try {
        const staff = await Staff.findById(req.params.id);

        if (!staff || staff.isDeleted) {
            return res.status(404).json({
                status: false,
                message: "Staff not found"
            });
        }

        if (req.staffDocs?.aadharCardPhoto) {
            if (staff.documents?.aadharCardPhoto?.public_id) {
                await cloudinary.uploader.destroy(staff.documents.aadharCardPhoto.public_id);
            }
            staff.documents.aadharCardPhoto = req.staffDocs.aadharCardPhoto;
        }

        if (req.staffDocs?.passportPhoto) {
            if (staff.documents?.passportPhoto?.public_id) {
                await cloudinary.uploader.destroy(staff.documents.passportPhoto.public_id);
            }
            staff.documents.passportPhoto = req.staffDocs.passportPhoto;
        }

        // Update fields
        Object.assign(staff, req.body);

        await staff.save();

        return res.json({
            status: true,
            message: "Staff updated successfully",
            data: staff
        });

    } catch (error) {
        return res.status(500).json({
            status: false,
            message: "Update staff failed",
            error: error.message
        });
    }
};

/* =====================================================
   UPDATE STATUS
===================================================== */
export const updateStaffStatus = async (req, res) => {
    try {
        const { status } = req.body;

        if (!["active", "inactive", "blocked"].includes(status)) {
            return res.status(400).json({
                status: false,
                message: "Invalid status value"
            });
        }

        const staff = await Staff.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );

        if (!staff) {
            return res.status(404).json({
                status: false,
                message: "Staff not found"
            });
        }

        return res.json({
            status: true,
            message: "Status updated successfully",
            data: staff
        });

    } catch (error) {
        return res.status(500).json({
            status: false,
            message: "Status update failed",
            error: error.message
        });
    }
};

/* =====================================================
   DELETE STAFF (SOFT DELETE + CLOUDINARY CLEAN)
===================================================== */
export const deleteStaff = async (req, res) => {
    try {
        const staff = await Staff.findById(req.params.id);

        if (!staff || staff.isDeleted) {
            return res.status(404).json({
                status: false,
                message: "Staff not found"
            });
        }

        // delete cloudinary files
        if (staff.documents?.aadharCardPhoto?.public_id) {
            await cloudinary.uploader.destroy(staff.documents.aadharCardPhoto.public_id);
        }

        if (staff.documents?.passportPhoto?.public_id) {
            await cloudinary.uploader.destroy(staff.documents.passportPhoto.public_id);
        }

        staff.isDeleted = true;
        staff.status = "inactive";
        await staff.save();

        return res.json({
            status: true,
            message: "Staff deleted successfully"
        });

    } catch (error) {
        return res.status(500).json({
            status: false,
            message: "Delete staff failed",
            error: error.message
        });
    }
};
