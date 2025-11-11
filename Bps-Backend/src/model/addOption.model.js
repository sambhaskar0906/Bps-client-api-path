import mongoose from "mongoose";

const addOptionsSchema = new mongoose.Schema(
    {
        fieldName: {
            type: String,
            required: true,
        },
        value: {
            type: String,
            required: true,
        },
    },
    { timestamps: true }
);

export const LeadOptions = mongoose.model("LeadOptions", addOptionsSchema);