import chatModel from "../db/chatModel.js";
import mongoose from "mongoose";

/**
 * CHAT SERVICE LAYER
 * Handles MongoDB operations for session persistence, history management,
 * and metadata updates. Acts as the single source of truth for DB queries.
 */

export const getChatList = async (userId) => {
  try {
    const chats = await chatModel
      .find({ userId })
      .select("title isPinned updatedAt")
      .sort({ isPinned: -1, updatedAt: -1 }) // Pinned first, then newest
      .lean();

    return { success: true, chats };
  } catch (error) {
    console.error(`[ChatService:getChatList Error]: ${error.message}`);
    return { success: false, message: "Failed to retrieve history." };
  }
};

export const getChatMessages = async (userId, chatId) => {
  try {
    const chat = await chatModel.findOne({ _id: chatId, userId }).lean();
    if (!chat) return { success: false, message: "Session not found." };

    return { success: true, messages: chat.messages };
  } catch (error) {
    console.error(`[ChatService:getChatMessages Error]: ${error.message}`);
    return { success: false, message: "Error fetching messages." };
  }
};

export const createNewChat = async (userId, isIncognito = false) => {
  try {
    const newChat = await chatModel.create({
      userId,
      title: "New Session",
      isIncognito,
      messages: [],
    });

    return { success: true, chatId: newChat._id };
  } catch (error) {
    console.error(`[ChatService:createNewChat Error]: ${error.message}`);
    return { success: false, message: "Could not initialize session." };
  }
};

export const saveChatMessages = async (userId, chatId, messages) => {
  try {
    const updateData = { messages };

    // Smart Auto-Titling: Generate title from the first user message
    if (messages.length > 0 && messages[0].role === "user") {
      // Look up current chat to ensure we don't overwrite user-renamed titles
      const currentChat = await chatModel
        .findOne({ _id: chatId, userId })
        .select("title");

      if (currentChat && currentChat.title === "New Session") {
        const firstMsg = messages[0].content;
        updateData.title =
          firstMsg.length > 30 ? firstMsg.substring(0, 30) + "..." : firstMsg;
      }
    }

    const updated = await chatModel.findOneAndUpdate(
      { _id: chatId, userId },
      { $set: updateData },
      { new: true },
    );

    return { success: true, chat: updated };
  } catch (error) {
    console.error(`[ChatService:saveChatMessages Error]: ${error.message}`);
    return { success: false, message: "Persistence failure." };
  }
};

export const clearUserHistory = async (userId) => {
  try {
    await chatModel.deleteMany({ userId, isPinned: false });
    return { success: true, message: "History cleared." };
  } catch (error) {
    console.error(`[ChatService:clearUserHistory Error]: ${error.message}`);
    return { success: false, message: "Failed to purge logs." };
  }
};

// =========================================================
// --- NEW PROFESSIONAL METHODS (For Pin, Rename, Delete) ---
// =========================================================

/**
 * Updates atomic metadata (Title or isPinned) without resending messages.
 */
export const updateChatMetadata = async (userId, chatId, updateData) => {
  try {
    // Security precaution: Prevent accidental overwriting of the messages array via this route
    delete updateData.messages;

    const updatedChat = await chatModel.findOneAndUpdate(
      { _id: chatId, userId },
      { $set: updateData },
      { new: true }, // Returns the newly updated document
    );

    if (!updatedChat) return { success: false, message: "Session not found." };
    return { success: true, chat: updatedChat };
  } catch (error) {
    console.error(`[ChatService:updateChatMetadata Error]: ${error.message}`);
    return { success: false, message: "Failed to update metadata." };
  }
};

/**
 * Completely purges a single conversation from MongoDB.
 */
export const deleteSingleChat = async (userId, chatId) => {
  try {
    const deletedChat = await chatModel.findOneAndDelete({
      _id: chatId,
      userId,
    });

    if (!deletedChat) return { success: false, message: "Session not found." };
    return { success: true, message: "Session deleted securely." };
  } catch (error) {
    console.error(`[ChatService:deleteSingleChat Error]: ${error.message}`);
    return { success: false, message: "Failed to delete session." };
  }
};
