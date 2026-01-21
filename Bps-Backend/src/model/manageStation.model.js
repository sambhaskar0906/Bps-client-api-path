import mongoose from "mongoose";

const manageStationSchema = new mongoose.Schema({
    stationName: {
        type: String,
        required: true,
        unique: true
    },
    contact: {
        type: String,
        required: true,
        unique: true
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
    gst: {
        type: String,
        required: true,
        unique: true
    },
    stationId: {
        type: String,
        unique: true
    }
}, { timestamps: true })

manageStationSchema.pre("save", async function (next) {
    if (!this.stationId) {
        const randomCode = Math.floor(Math.random() * 10000).toString().padStart(4, "0");
        const prefix = "BHPAR";
        const suffix = "STA";

        this.stationId = `${prefix}${randomCode}${suffix}`;
    }
    next();
});

const manageStation = mongoose.model("manageStation", manageStationSchema);

export default manageStation;