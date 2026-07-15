import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import userModel from "../db/userModel.js";
import transporter from "../core/nodemailer.js";

/**
 * AUTH CONTROLLER
 */

const sendTokenResponse = (user, statusCode, res) => {
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return res.status(statusCode).json({
    success: true,
    message: "Authentication successful",
  });
};

export const register = async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res
      .status(400)
      .json({ success: false, message: "Required fields missing" });
  }

  try {
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res
        .status(409)
        .json({ success: false, message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const otp = String(Math.floor(100000 + Math.random() * 900000));

    const user = new userModel({
      name,
      email,
      password: hashedPassword,
      verifyOtp: otp,
      verifyOtpExpireAt: Date.now() + 24 * 60 * 60 * 1000,
      // Fixed Problem 1: Explicitly initialize telemetry database schema fields
      analytics: {
        totalLocalTokens: 0,
        totalCloudTokens: 0,
      },
    });

    await user.save();

    // CRITICAL TIMEOUT FIX: Dispatch cookie session payload down the wire IMMEDIATELY.
    // The user transitions instantly to the UI panel while SMTP runs decoupled out-of-band.
    sendTokenResponse(user, 201, res);

    // Run mail relay processing in the background asynchronously
    transporter
      .sendMail({
        from: process.env.SENDER_EMAIL,
        to: email,
        subject: "Verify your HybridNode Account",
        html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
          <h2 style="color: #0f172a;">Welcome to HybridNode</h2>
          <b style="font-size: 32px; color: #2563eb;">${otp}</b>
        </div>`,
      })
      .then(() => console.log(`📧 OTP safely dispatched to ${email}`))
      .catch((err) =>
        console.error(
          "[Mail Transport Warning - Client bypass allowed]:",
          err.message,
        ),
      );
  } catch (error) {
    console.error("[Registration Exception Trap]:", error.message);
    return res
      .status(500)
      .json({ success: false, message: "Internal Registration Error" });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Email and password are required." });
    }

    // Explicitly select password because it's hidden by default in the model
    const user = await userModel.findOne({ email }).select("+password");
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    // FIXED: SELF-HEALING ARTIFACT DATA PATCH FOR PROBLEM 1
    // Ensures old test accounts lacking analytics sub-documents don't hang JSON serialization layers
    if (!user.analytics || user.analytics.totalLocalTokens === undefined) {
      user.analytics = {
        totalLocalTokens: 0,
        totalCloudTokens: 0,
      };
      await userModel
        .findByIdAndUpdate(user._id, {
          $set: { analytics: { totalLocalTokens: 0, totalCloudTokens: 0 } },
        })
        .catch((err) =>
          console.error("⚠️ Background data patching failed:", err.message),
        );
    }

    return sendTokenResponse(user, 200, res);
  } catch (error) {
    console.error("[Login Controller Crash Trap]:", error.message);
    return res.status(500).json({ success: false, message: "Login failure" });
  }
};

export const logout = async (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  });
  return res.json({ success: true, message: "Session terminated" });
};

/**
 * VERIFY EMAIL OTP - FIXED
 */
export const verifyEmail = async (req, res) => {
  const { otp } = req.body;
  const userId = req.userId;

  if (!otp)
    return res.status(400).json({ success: false, message: "OTP is required" });

  try {
    // CRITICAL FIX: Explicitly select the hidden OTP fields
    const user = await userModel
      .findById(userId)
      .select("+verifyOtp +verifyOtpExpireAt");

    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    // DEBUG LOGS (Check your terminal)
    console.log("--- OTP Verification Debug ---");
    console.log("User Input:", otp);
    console.log("DB Stored OTP:", user.verifyOtp);

    if (user.isAccountVerified)
      return res
        .status(400)
        .json({ success: false, message: "Already verified" });

    // Force string comparison for safety
    if (String(user.verifyOtp) !== String(otp) || user.verifyOtp === "") {
      return res
        .status(400)
        .json({ success: false, message: "Invalid verification code" });
    }

    if (user.verifyOtpExpireAt < Date.now()) {
      return res
        .status(400)
        .json({ success: false, message: "Code has expired" });
    }

    user.isAccountVerified = true;
    user.verifyOtp = "";
    user.verifyOtpExpireAt = 0;
    await user.save();

    return res.json({
      success: true,
      message: "Account verified successfully",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const isAuthenticated = async (req, res) => {
  try {
    const user = await userModel.findById(req.userId);
    if (!user) return res.status(401).json({ success: false });
    return res.json({ success: true });
  } catch (error) {
    return res.status(401).json({ success: false });
  }
};

/**
 * RESET OTP & PASSWORD - FIXED
 */
export const sendResetOtp = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await userModel.findOne({ email });
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    user.resetOtp = otp;
    user.resetOtpExpireAt = Date.now() + 15 * 60 * 1000;
    await user.save();

    await transporter.sendMail({
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: "Password Reset Request",
      text: `Code: ${otp}`,
    });

    return res.json({ success: true, message: "Reset code dispatched" });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Failed to send reset code" });
  }
};

export const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;
  if (!email || !otp || !newPassword)
    return res.status(400).json({ success: false, message: "Missing data" });

  try {
    // CRITICAL FIX: Select hidden resetOtp fields
    const user = await userModel
      .findOne({ email })
      .select("+resetOtp +resetOtpExpireAt");

    if (
      !user ||
      String(user.resetOtp) !== String(otp) ||
      user.resetOtp === ""
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid reset code" });
    }

    if (user.resetOtpExpireAt < Date.now()) {
      return res.status(400).json({ success: false, message: "Code expired" });
    }

    user.password = await bcrypt.hash(newPassword, 12);
    user.resetOtp = "";
    user.resetOtpExpireAt = 0;
    await user.save();

    return res.json({ success: true, message: "Password reset complete" });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Failed to update password" });
  }
};

export const sendVerifyOtp = async (req, res) => {
  try {
    const user = await userModel.findById(req.userId);
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    if (user.isAccountVerified)
      return res.json({ success: true, message: "Already verified" });

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    user.verifyOtp = otp;
    user.verifyOtpExpireAt = Date.now() + 24 * 60 * 60 * 1000;
    await user.save();

    await transporter.sendMail({
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: "New Verification Code",
      text: `Code: ${otp}`,
    });

    return res.json({ success: true, message: "Verification code sent" });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};
