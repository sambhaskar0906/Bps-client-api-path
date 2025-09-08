import mongoose from "mongoose";


const customerSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true
    },
    middleName: {
        type: String
    },
    lastName: {
        type: String,
        required: true
    },
    contactNumber: {
        type: Number
    },
    emailId: {
        type: String,
        required: true,
        unique: true
    },

    address: {
        type: String,
        required: true
    },
    district: {
        type: String
    },
    state: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    pincode: {
        type: String,
        required: true
    },
    idProof: {
        type: String,
        required: true,
        // unique: true
    },
    idProofPhoto: {
        type: String,
        required: true
    },
    customerProfilePhoto: {
        type: String,
        required: true
    },
    gstNumber: {
        type: String,
        required: true
    },
    customerId: {
        type: String,
        unique: true
    },

    status: {
        type: String,
        enum: ["active", "inactive"],
        default: "active"
    },
    isBlacklisted: {
        type: Boolean,
        default: false
    },
    stateCode: {
        type: String,
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },

}, { timestamps: true });

customerSchema.pre("save", async function (next) {


    if (!this.customerId) {
        const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
        this.customerId = `${this.firstName}_${randomSuffix}`;
    }

    next();
});



export const Customer = mongoose.model("Customer", customerSchema);