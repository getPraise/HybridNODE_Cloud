import jwt from "jsonwebtoken";

/**
 * USER AUTHENTICATION MIDDLEWARE
 * Intercepts incoming requests to validate the identity of the user via JWT.
 * * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 */
const userAuth = async (req, res, next) => {
  const { token } = req.cookies;

  // 1. Initial Presence Check
  if (!token) {
    return res.status(401).json({
      success: false,
      message: "No active session. Please log in.",
    });
  }

  try {
    // 2. JWT Verification
    // decoded contains the payload we signed (user ID)
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded || !decoded.id) {
      return res.status(401).json({
        success: false,
        message: "Invalid session metadata.",
      });
    }

    // 3. Request Augmentation
    // We bind the ID to req.userId so it is accessible in the controller layer.
    req.userId = decoded.id;

    // Proceed to the Controller
    next();
  } catch (error) {
    // Specific JWT error handling
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Your session has expired. Please log in again.",
      });
    }

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Malformed session token.",
      });
    }

    console.error(`[Auth Middleware Exception]: ${error.message}`);
    return res.status(401).json({
      success: false,
      message: "Authentication protocol failed.",
    });
  }
};

export default userAuth;
