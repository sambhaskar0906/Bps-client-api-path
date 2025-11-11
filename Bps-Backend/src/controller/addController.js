import { LeadOptions } from "../model/addOption.model.js";

// Add new option
export const addOption = async (req, res) => {
    try {
        const { fieldName, value } = req.body;

        // Validate required fields
        if (!fieldName || !value) {
            return res.status(400).json({
                success: false,
                message: "Field name and value are required"
            });
        }

        // Check if option already exists
        const existingOption = await LeadOptions.findOne({
            fieldName: fieldName.trim(),
            value: value.trim()
        });

        if (existingOption) {
            return res.status(400).json({
                success: false,
                message: "Option already exists"
            });
        }

        // Create new option
        const newOption = new LeadOptions({
            fieldName: fieldName.trim(),
            value: value.trim()
        });

        const savedOption = await newOption.save();

        res.status(201).json({
            success: true,
            message: "Option added successfully",
            data: savedOption
        });

    } catch (error) {
        console.error("Error adding option:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

// Get all options
export const getAllOptions = async (req, res) => {
    try {
        const options = await LeadOptions.find().sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            message: "Options retrieved successfully",
            data: options,
            count: options.length
        });

    } catch (error) {
        console.error("Error fetching options:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

// Get options by field name
export const getOptionsByField = async (req, res) => {
    try {
        const { fieldName } = req.params;

        if (!fieldName) {
            return res.status(400).json({
                success: false,
                message: "Field name is required"
            });
        }

        const options = await LeadOptions.find({
            fieldName: new RegExp(fieldName, 'i')
        }).sort({ value: 1 });

        res.status(200).json({
            success: true,
            message: `Options for ${fieldName} retrieved successfully`,
            data: options,
            count: options.length
        });

    } catch (error) {
        console.error("Error fetching options by field:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

// Update option
export const updateOption = async (req, res) => {
    try {
        const { id } = req.params;
        const { fieldName, value } = req.body;

        if (!fieldName || !value) {
            return res.status(400).json({
                success: false,
                message: "Field name and value are required"
            });
        }

        // Check if option exists
        const existingOption = await LeadOptions.findById(id);
        if (!existingOption) {
            return res.status(404).json({
                success: false,
                message: "Option not found"
            });
        }

        // Check for duplicate
        const duplicateOption = await LeadOptions.findOne({
            _id: { $ne: id },
            fieldName: fieldName.trim(),
            value: value.trim()
        });

        if (duplicateOption) {
            return res.status(400).json({
                success: false,
                message: "Option with same field name and value already exists"
            });
        }

        // Update option
        const updatedOption = await LeadOptions.findByIdAndUpdate(
            id,
            {
                fieldName: fieldName.trim(),
                value: value.trim()
            },
            { new: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            message: "Option updated successfully",
            data: updatedOption
        });

    } catch (error) {
        console.error("Error updating option:", error);
        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: "Invalid option ID"
            });
        }
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

// Delete option
export const deleteOption = async (req, res) => {
    try {
        const { id } = req.params;

        const deletedOption = await LeadOptions.findByIdAndDelete(id);

        if (!deletedOption) {
            return res.status(404).json({
                success: false,
                message: "Option not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Option deleted successfully",
            data: deletedOption
        });

    } catch (error) {
        console.error("Error deleting option:", error);
        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: "Invalid option ID"
            });
        }
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

// Delete multiple options
export const deleteMultipleOptions = async (req, res) => {
    try {
        const { ids } = req.body;

        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Array of option IDs is required"
            });
        }

        const result = await LeadOptions.deleteMany({ _id: { $in: ids } });

        if (result.deletedCount === 0) {
            return res.status(404).json({
                success: false,
                message: "No options found to delete"
            });
        }

        res.status(200).json({
            success: true,
            message: `${result.deletedCount} option(s) deleted successfully`
        });

    } catch (error) {
        console.error("Error deleting multiple options:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};