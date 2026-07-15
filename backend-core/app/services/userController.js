import * as userService from "../services/userService.js";

/**
 * GET USER DATA
 * Controller to handle profile retrieval requests.
 * @security: Requires 'userAuth' middleware to populate req.userId.
 */
export const getUserData = async (req, res) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: Missing authentication token.",
      });
    }

    // Call service layer for sanitized data
    const result = await userService.getUserData(userId);

    if (result.success) {
      return res.status(200).json({
        success: true,
        userData: result.userData, // Matches React AuthContext expectation
      });
    }

    return res.status(404).json({
      success: false,
      message: result.message || "User profile not found.",
    });
  } catch (error) {
    console.error(`[UserController Error]: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: "An internal server error occurred.",
    });
  }
};

/**
 * UPDATE USER NAME
 * Controller to handle display name updates from the Settings Modal.
 */
export const updateName = async (req, res) => {
  try {
    const userId = req.userId;
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Updated name is required.",
      });
    }

    const result = await userService.updateUserName(userId, name);

    if (result.success) {
      return res.status(200).json({
        success: true,
        message: result.message,
      });
    }

    return res.status(400).json({
      success: false,
      message: result.message,
    });
  } catch (error) {
    console.error(`[UserController Error]: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: "Internal server error during profile update.",
    });
  }
};

/**
 * UPDATE USER TOKENS
 * Controller to orchestrate token metric tracking updates.
 */
export const updateTokens = async (req, res) => {
  try {
    const userId = req.userId;
    const { tier, inputTokens, outputTokens } = req.body;

    // Validate parameter payload structure
    if (!tier || inputTokens === undefined || outputTokens === undefined) {
      return res.status(400).json({
        success: false,
        message: "Missing required analytics payload properties.",
      });
    }

    const result = await userService.incrementUserTokens(
      userId,
      tier,
      inputTokens,
      outputTokens,
    );

    if (result.success) {
      return res.status(200).json({
        success: true,
        message: result.message,
      });
    }

    return res.status(400).json({
      success: false,
      message: result.message,
    });
  } catch (error) {
    console.error(`[UserController Error]: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: "Internal server error during analytics accumulation.",
    });
  }
};
