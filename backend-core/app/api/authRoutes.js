import express from "express";
import {
  register,
  login,
  logout,
  verifyEmail,
  sendResetOtp,
  resetPassword,
  isAuthenticated,
  sendVerifyOtp,
} from "../services/authController.js";
import userAuth from "../middleware/userAuth.js";

const authRouter = express.Router();

/**
 * PUBLIC GATEWAY
 * Anyone can access these to join or enter the system.
 */
authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.post("/logout", logout);

/**
 * IDENTITY RECOVERY
 * High-security routes for password resets.
 */
authRouter.post("/send-reset-otp", sendResetOtp);
authRouter.post("/reset-password", resetPassword);

/**
 * SECURE ACCOUNT VERIFICATION
 * Requires 'userAuth' to identify which user is providing the OTP.
 */
authRouter.post("/verify-otp", userAuth, verifyEmail); // Simplified name

// THIS ROUTE FOR RESENDING OTP
// This matches the axios call in your EmailVerify.jsx
authRouter.post("/send-verify-otp", userAuth, sendVerifyOtp);

/**
 * SESSION HYDRATION
 * Used by Frontend AuthContext to verify if a cookie is still valid.
 */
authRouter.get("/is-auth", userAuth, isAuthenticated);

export default authRouter;
