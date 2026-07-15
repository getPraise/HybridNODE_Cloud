import mongoose from "mongoose";

// USER SCHEMA
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Identity name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email address is required"],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email format"],
    },
    password: {
      type: String,
      required: [true, "Secure password is required"],
      minlength: [6, "Security requirement: minimum 6 characters"],
      select: false,
    },

    // --- Verification Protocol ---
    verifyOtp: { type: String, default: "", select: false },
    verifyOtpExpireAt: { type: Number, default: 0, select: false },
    isAccountVerified: { type: Boolean, default: false },

    // --- Recovery Protocol ---
    resetOtp: { type: String, default: "", select: false },
    resetOtpExpireAt: { type: Number, default: 0, select: false },

    // --- Distributed Intelligence Analytics ---
    analytics: {
      totalLocalTokens: { type: Number, default: 0, min: 0 },
      totalCloudTokens: { type: Number, default: 0, min: 0 },
    },
  },
  {
    timestamps: true,
    toJSON: { getters: true, virtuals: true },
    toObject: { getters: true, virtuals: true },
  },
);

/**
 * Global Identity Protection:
 * We delete sensitive fields but ensure 'analytics' stays intact
 * so it reaches the frontend AuthContext correctly.
 */
userSchema.set("toJSON", {
  transform: (doc, ret) => {
    delete ret.password;
    delete ret.verifyOtp;
    delete ret.verifyOtpExpireAt;
    delete ret.resetOtp;
    delete ret.resetOtpExpireAt;
    // analytics is NOT deleted, so it is preserved in the JSON output!
    return ret;
  },
});

const userModel = mongoose.models.user || mongoose.model("user", userSchema);

export default userModel;
