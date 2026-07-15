import {
  useState,
  useEffect,
  useContext,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { AuthContext } from "../context/AuthContext";
import chatService from "../services/chatService";
import { toast } from "react-toastify";

export const useChatActions = (chatId = null) => {
  const { isLoggedIn, backendUrl } = useContext(AuthContext);
  const [messages, setMessages] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  // Track current sync state to prevent race conditions
  const lastFetchedId = useRef(null);
  const isSyncing = useRef(false);

  const service = useMemo(() => chatService(backendUrl), [backendUrl]);

  // --- 1. DATA ACQUISITION ---

  const fetchHistory = useCallback(async () => {
    if (!isLoggedIn) return;
    try {
      const data = await service.getChatList();
      if (data.success) setHistory(data.chats);
    } catch (error) {
      console.error("[History Sync Error]:", error.message);
    }
  }, [isLoggedIn, service]);

  const fetchMessages = useCallback(async () => {
    if (!chatId) {
      setMessages([]);
      return;
    }

    setLoading(true);
    try {
      if (isLoggedIn) {
        const data = await service.getMessages(chatId);
        if (data.success) {
          setMessages(data.messages || []);
          lastFetchedId.current = chatId;
        }
      } else {
        const saved = sessionStorage.getItem("guest_chat_history");
        setMessages(saved ? JSON.parse(saved) : []);
      }
    } catch (error) {
      console.error("[Message Fetch Error]:", error.message);
    } finally {
      setLoading(false);
    }
  }, [chatId, isLoggedIn, service]);

  // Effects for Data Lifecycle
  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);
  useEffect(() => {
    if (chatId && chatId !== lastFetchedId.current) fetchMessages();
  }, [chatId, fetchMessages]);

  // --- 2. PERSISTENCE & ACTIONS ---

  const createNewSession = useCallback(
    async (isIncognito = false) => {
      if (!isLoggedIn) {
        setMessages([]);
        return null;
      }
      try {
        const data = await service.createChat(isIncognito);
        if (data.success) {
          await fetchHistory();
          return data.chatId;
        }
      } catch (error) {
        toast.error("Cloud session initialization failed.");
        return null;
      }
    },
    [isLoggedIn, service, fetchHistory],
  );

  const persistChat = useCallback(
    async (updatedMessages) => {
      setMessages(updatedMessages);

      if (!isLoggedIn) {
        sessionStorage.setItem(
          "guest_chat_history",
          JSON.stringify(updatedMessages),
        );
        return;
      }

      if (chatId && !isSyncing.current) {
        isSyncing.current = true;
        try {
          await service.saveMessage(chatId, updatedMessages);
          // Refresh history only if it's the first message (to show auto-title)
          if (updatedMessages.length <= 2) await fetchHistory();
        } catch (error) {
          console.error("[Persistence Error]:", error.message);
        } finally {
          isSyncing.current = false;
        }
      }
    },
    [isLoggedIn, chatId, service, fetchHistory],
  );

  // --- 3. MODIFICATION HANDLERS (The "Missing" Logic) ---

  const deleteSession = useCallback(
    async (targetId) => {
      try {
        const data = await service.deleteChat(targetId);
        if (data.success) {
          await fetchHistory();
          toast.success("Memory deleted successfully.");
        }
      } catch (err) {
        toast.error("Failed to delete session.");
      }
    },
    [service, fetchHistory],
  );

  const renameSession = useCallback(
    async (targetId, newTitle) => {
      try {
        // Professional apps only update the title, not the whole message array
        const data = await service.updateChat(targetId, { title: newTitle });
        if (data.success) await fetchHistory();
      } catch (err) {
        toast.error("Failed to update title.");
      }
    },
    [service, fetchHistory],
  );

  const togglePin = useCallback(
    async (targetId, currentState) => {
      try {
        const data = await service.updateChat(targetId, {
          isPinned: !currentState,
        });
        if (data.success) await fetchHistory();
      } catch (err) {
        toast.error("Pin status update failed.");
      }
    },
    [service, fetchHistory],
  );

  const clearHistory = useCallback(async () => {
    if (!isLoggedIn) {
      setMessages([]);
      sessionStorage.removeItem("guest_chat_history");
      return;
    }
    try {
      const data = await service.wipeAll();
      if (data.success) {
        setMessages([]);
        await fetchHistory();
        toast.success("Workspace history cleared.");
      }
    } catch (error) {
      toast.error("History purge failed.");
    }
  }, [isLoggedIn, service, fetchHistory]);

  return {
    messages,
    history,
    loading,
    persistChat,
    createNewSession,
    deleteSession,
    renameSession,
    togglePin,
    clearHistory,
    setMessages,
  };
};
