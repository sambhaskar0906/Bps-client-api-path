import mongoose from "mongoose";
import bcrypt from "bcrypt";

const UserSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true
    },
    middleName: {
      type: String,
    },
    lastName: {
      type: String,
      required: true
    },
    emailId: {
      type: String,
      required: true,
      unique: true
    },
    contactNumber: {
      type: String,
      required: true
    },
    password: {
      type: String,
      required: true,
      minLength: [6, "Password should be at least 6 characters long"]
    },
    address: {
      type: String,
      required: true
    },
    distinct: {
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
    idProof: {
      type: String,
      required: true,
      unique: true
    },
    idProofPhoto: {
      type: String,
      required: true,
    },
    adminProfilePhoto: {
      type: String,
      required: true
    },
    pincode: {
      type: Number
    },
    startStation: {
      type: String
    },
    role: {
      type: String,
      enum: ['supervisor', 'admin'],
      required: true
    },
    adminId: {
      type: String,
      unique: true
    },
    isBlacklisted: {
      type: Boolean,
      default: false
    },
    isActive: {
      type: Boolean,
      default: true
    },
    isDeactivated: {
      type: Boolean,
      default: false
    },
    verificationCode: {
      type: String,
    },
    verificationCodeExpires: {
      type: Date,
    },
  },
  { timestamps: true }
);


UserSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }

  if (!this.adminId) {
    const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    this.adminId = `${this.firstName}_${randomSuffix}`;
  }

  next();
});
UserSchema.methods.isPasswordCorrect = async function (password) {
  return bcrypt.compare(password, this.password); // Compare the hashed password with the stored password
};

export const User = mongoose.model("User", UserSchema);