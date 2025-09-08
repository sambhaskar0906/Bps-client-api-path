import mongoose from "mongoose";
import bcrypt from "bcrypt";

const staffSchema = new mongoose.Schema({
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
        type: Number,
        required: true
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
        type: String,

    },
    pincode: {
        type: String,

    },
    state: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    idProof: {
        type: String,
        required: true,
        unique: true
    },
    idProofPhoto: {
        type: String,
        required: true
    },
    staffProfilePhoto: {
        type: String,
        required: true
    },
    staffId: {
        type: String,
        unique: true
    },
    isBlacklisted: {
        type: Boolean,
        default: false
    },
    isAvailable: {
        type: Boolean,
        default: true
    },
    isDeactived: {
        type: Boolean,
        default: false
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },

}, { timestamps: true });

staffSchema.pre("save", async function (next) {
    if (this.isModified("password")) {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    }

    if (!this.staffId) {
        const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
        this.staffId = `${this.firstName}_${randomSuffix}`;
    }

    next();
});

staffSchema.methods.isPasswordMatch = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

export const Staff = mongoose.model("driver", staffSchema);
