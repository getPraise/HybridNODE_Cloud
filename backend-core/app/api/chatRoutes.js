import express from "express";
import userAuth from "../middleware/userAuth.js";
import {
  startNewChat,
  saveMessage,
  getChatHistory,
  getChatMessages,
  clearAllChats,
  updateChatMetadata, // NEW: For Pin & Rename
  deleteSingleChat, // NEW: For Trash Can
} from "../services/chatController.js";

const chatRouter = express.Router();

/**
 * GLOBAL MIDDLEWARE
 * All chat operations require an active, authenticated session.
 */
chatRouter.use(userAuth);

chatRouter.get("/history", getChatHistory);
chatRouter.get("/messages/:chatId", getChatMessages);
chatRouter.post("/new", startNewChat);
chatRouter.post("/save", saveMessage);
chatRouter.delete("/clear-all", clearAllChats);

// --- NEW CAPABILITIES ---

/**
 * @route   PATCH /api/chat/update/:chatId
 * @desc    Atomic update for title (Rename) or isPinned (Pin).
 */
chatRouter.patch("/update/:chatId", updateChatMetadata);

/**
 * @route   DELETE /api/chat/delete/:chatId
 * @desc    Delete a specific conversation from the database.
 */
chatRouter.delete("/delete/:chatId", deleteSingleChat);

export default chatRouter;
