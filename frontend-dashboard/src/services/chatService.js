import axios from "axios";

/**
 * CHAT SERVICE API
 * The primary network boundary for workspace conversations.
 * Manages the HTTP lifecycle for persistent AI sessions and metadata updates.
 */
const chatService = (backendUrl) => {
  // 1. Centralized Axios Instance
  const api = axios.create({
    baseURL: backendUrl,
    withCredentials: true,
    headers: {
      "Content-Type": "application/json",
    },
  });

  return {
    // --- READ OPERATIONS ---

    /**
     * Fetch all conversation metadata for the Sidebar history list.
     */
    getChatList: async () => {
      const { data } = await api.get("/api/chat/history");
      return data;
    },

    /**
     * Fetch the complete message array for a specific session.
     */
    getMessages: async (chatId) => {
      const { data } = await api.get(`/api/chat/messages/${chatId}`);
      return data;
    },

    // --- WRITE OPERATIONS ---

    /**
     * Initialize a new workspace session.
     */
    createChat: async (isIncognito = false) => {
      const { data } = await api.post("/api/chat/new", { isIncognito });
      return data;
    },

    /**
     * Persist the current state of a session's messages to the cloud.
     */
    saveMessage: async (chatId, messages) => {
      const { data } = await api.post("/api/chat/save", { chatId, messages });
      return data;
    },

    /**
     * ATOMIC UPDATE: Modify specific metadata (e.g., Title or Pin Status)
     * This prevents sending the entire message array over the network just to change a name.
     */
    updateChat: async (chatId, updateData) => {
      const { data } = await api.patch(
        `/api/chat/update/${chatId}`,
        updateData,
      );
      return data;
    },

    // --- DELETE OPERATIONS ---

    /**
     * Delete a specific session from history.
     */
    deleteChat: async (chatId) => {
      const { data } = await api.delete(`/api/chat/delete/${chatId}`);
      return data;
    },

    /**
     * Clear all unpinned session history for the authenticated user.
     */
    wipeAll: async () => {
      const { data } = await api.delete("/api/chat/clear-all");
      return data;
    },
  };
};

export default chatService;
