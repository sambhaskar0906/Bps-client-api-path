import mongoose from "mongoose";

const staffSchema = new mongoose.Schema({
    staffId: {
        type: String,
        unique: true,
        index: true
    },

    firstName: {
        type: String,
        required: true,
        trim: true
    },

    lastName: {
        type: String,
        required: true,
        trim: true
    },

    contactNumber: {
        type: String,
    },

    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true
    },

    aadharNumber: {
        type: String,
        required: true,
    },

    documents: {
        aadharCardPhoto: {
            url: { type: String },
            public_id: { type: String }
        },
        passportPhoto: {
            url: { type: String },
            public_id: { type: String }
        }
    },

    address: {
        addressLine: { type: String, required: true },
        state: { type: String, required: true },
        city: { type: String, required: true },
        district: { type: String, required: true },
        pincode: { type: String, required: true }
    },

    status: {
        type: String,
        enum: ["active", "inactive", "blocked"],
        default: "active",
        index: true
    },

    isVerified: {
        type: Boolean,
        default: false
    },

    isDeleted: {
        type: Boolean,
        default: false
    }

}, {
    timestamps: true
});

/* =====================================================
   AUTO STAFF ID GENERATOR
   Format: FIR_123_BPS
===================================================== */
staffSchema.pre("save", async function (next) {
    if (this.staffId) return next(); // already exists

    const firstNamePart = this.firstName
        .replace(/[^a-zA-Z]/g, "")
        .substring(0, 3)
        .toUpperCase()
        .padEnd(3, "X"); // in case name < 3 letters

    let unique = false;
    let staffId = "";

    while (!unique) {
        const randomNum = Math.floor(100 + Math.random() * 900); // 3 digit
        staffId = `${firstNamePart}_${randomNum}_BPS`;

        const exists = await mongoose.models.Staff.findOne({ staffId });
        if (!exists) unique = true;
    }

    this.staffId = staffId;
    next();
});

export default mongoose.model("Staff", staffSchema);
