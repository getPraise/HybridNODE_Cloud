import mongoose from "mongoose";
import userModel from "../db/userModel.js";

/**
 * USER SERVICE LAYER
 * Orchestrates business logic for user profile management and data retrieval.
 */

/**
 * Retrieves formatted user profile data while protecting sensitive credentials.
 * @param {string} userId - The MongoDB ObjectId of the user.
 * @returns {Promise<Object>} Success status and formatted user data.
 */
export const getUserData = async (userId) => {
  try {
    // 1. ID Validation
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return { success: false, message: "Invalid User ID format." };
    }

    // 2. Database Query
    // Added explicit selection inclusion for analytics fields if needed, or left open as exclusion filters handles it.
    const user = await userModel
      .findById(userId)
      .select(
        "-password -verifyOtp -verifyOtpExpireAt -resetOtp -resetOtpExpireAt",
      )
      .lean();

    if (!user) {
      return { success: false, message: "User account not found." };
    }

    // 3. Professional Data Formatting
    // Added analytics properties to match your persistent storage structure
    return {
      success: true,
      userData: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        isAccountVerified: user.isAccountVerified,
        joinedAt: new Date(user.createdAt).toLocaleDateString("en-US", {
          month: "long",
          year: "numeric",
        }),
        analytics: {
          totalLocalTokens: user.analytics?.totalLocalTokens || 0,
          totalCloudTokens: user.analytics?.totalCloudTokens || 0,
        },
      },
    };
  } catch (error) {
    console.error(`[User Service Error]: ${error.message}`);
    return {
      success: false,
      message: "An internal error occurred during profile synchronization.",
    };
  }
};

/**
 * Updates the display name for a specific user.
 * @param {string} userId - The unique user identifier.
 * @param {string} newName - The updated name string.
 * @returns {Promise<Object>} Success status and update confirmation.
 */
export const updateUserName = async (userId, newName) => {
  try {
    if (!newName || newName.trim().length < 2) {
      return { success: false, message: "Name must be at least 2 characters." };
    }

    const updatedUser = await userModel.findByIdAndUpdate(
      userId,
      { name: newName.trim() },
      { new: true }, // Returns the document after the update
    );

    if (!updatedUser) {
      return { success: false, message: "User not found." };
    }

    return { success: true, message: "Profile name updated successfully." };
  } catch (error) {
    console.error(`[User Service Error]: ${error.message}`);
    return { success: false, message: "Failed to update profile name." };
  }
};

/**
 * Increments accumulated user token tracking counters using atomic MongoDB operations.
 * @param {string} userId - The unique user identifier.
 * @param {string} tier - Token type tier matching 'local' or 'cloud'.
 * @param {number} inputTokens - Number of computed prompt tokens.
 * @param {number} outputTokens - Number of computed generation tokens.
 * @returns {Promise<Object>} Success status and persistence state confirmation.
 */
export const incrementUserTokens = async (
  userId,
  tier,
  inputTokens,
  outputTokens,
) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return { success: false, message: "Invalid User ID format." };
    }

    const totalTurnTokens = inputTokens + outputTokens;
    if (totalTurnTokens <= 0) {
      return { success: false, message: "No operational token data to log." };
    }

    // Determine the precise path match based on your userModel schema mapping structure
    const targetField =
      tier === "cloud"
        ? "analytics.totalCloudTokens"
        : "analytics.totalLocalTokens";

    // Use atomic $inc operator to avoid state race conditions over simultaneous requests
    const updatedUser = await userModel.findByIdAndUpdate(
      userId,
      { $inc: { [targetField]: totalTurnTokens } },
      { new: true },
    );

    if (!updatedUser) {
      return { success: false, message: "User not found." };
    }

    return { success: true, message: "Account token usage updated cleanly." };
  } catch (error) {
    console.error(`[User Service Error]: ${error.message}`);
    return {
      success: false,
      message: "Failed to log analytical token telemetry metrics.",
    };
  }
};
