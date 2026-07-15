import * as chatService from "../services/chatService.js";

/**
 * CHAT CONTROLLER
 * Orchestrates HTTP requests for chat sessions and message persistence.
 */

export const startNewChat = async (req, res) => {
  try {
    const { isIncognito } = req.body;
    const userId = req.userId;
    const result = await chatService.createNewChat(userId, isIncognito);
    if (result.success) return res.status(201).json(result);
    return res.status(400).json(result);
  } catch (error) {
    console.error(`[ChatController Error]: ${error.message}`);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error." });
  }
};

export const getChatMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.userId;
    const result = await chatService.getChatMessages(userId, chatId);
    if (result.success) return res.status(200).json(result);
    return res.status(404).json(result);
  } catch (error) {
    return res.status(500).json({ success: false, message: "Sync failure." });
  }
};

export const saveMessage = async (req, res) => {
  try {
    const { chatId, messages } = req.body;
    const userId = req.userId;

    if (!chatId || !messages) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields." });
    }

    const result = await chatService.saveChatMessages(userId, chatId, messages);
    if (result.success) return res.status(200).json(result);
    return res.status(400).json(result);
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Persistence failure." });
  }
};

export const getChatHistory = async (req, res) => {
  try {
    const userId = req.userId;
    const result = await chatService.getChatList(userId);
    if (result.success) return res.status(200).json(result);
    return res.status(400).json(result);
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "History retrieval failed." });
  }
};

export const clearAllChats = async (req, res) => {
  try {
    const userId = req.userId;
    const result = await chatService.clearUserHistory(userId);
    if (result.success) return res.status(200).json(result);
    return res.status(400).json(result);
  } catch (error) {
    return res.status(500).json({ success: false, message: "Cleanup failed." });
  }
};

// --- NEW PROFESSIONAL ADDITIONS ---

/**
 * Update chat metadata (Rename or Pin).
 * PATCH /api/chat/update/:chatId
 */
export const updateChatMetadata = async (req, res) => {
  try {
    const { chatId } = req.params;
    const updateData = req.body;
    const userId = req.userId;

    const result = await chatService.updateChatMetadata(
      userId,
      chatId,
      updateData,
    );

    if (result.success) return res.status(200).json(result);
    return res.status(400).json(result);
  } catch (error) {
    return res.status(500).json({ success: false, message: "Update failed." });
  }
};

/**
 * Delete a single conversation.
 * DELETE /api/chat/delete/:chatId
 */
export const deleteSingleChat = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.userId;

    const result = await chatService.deleteSingleChat(userId, chatId);

    if (result.success) return res.status(200).json(result);
    return res.status(404).json(result);
  } catch (error) {
    return res.status(500).json({ success: false, message: "Delete failed." });
  }
};
