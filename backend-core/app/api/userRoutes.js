import express from "express";
import userAuth from "../middleware/userAuth.js";
import {
  getUserData,
  updateName,
  updateTokens,
} from "../services/userController.js";

const userRouter = express.Router();

/**
 * @route   GET /api/user/data
 * @desc    Fetch authenticated user profile information.
 * @access  Private (Requires valid JWT session)
 */
userRouter.get("/data", userAuth, getUserData);

/**
 * @route   POST /api/user/update-name
 * @desc    Update the display name of the authenticated user.
 * @access  Private (Requires valid JWT session)
 */
userRouter.post("/update-name", userAuth, updateName);

/**
 * @route   POST /api/user/update-tokens
 * @desc    Increment local or cloud token analytics metrics for the user account.
 * @access  Private (Requires valid JWT session)
 */
userRouter.post("/update-tokens", userAuth, updateTokens);

export default userRouter;
