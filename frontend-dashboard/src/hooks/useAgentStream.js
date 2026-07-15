import { useState, useEffect, useRef, useCallback, useContext } from "react";
import { io } from "socket.io-client";
import axios from "axios";
import { AuthContext } from "../context/AuthContext"; // <-- ADDED: Bring in AuthContext

/**
 * useAgentStream
 * Handles real-time socket communication for HybridNode.
 */
export const useAgentStream = (url, initialTokens = { local: 0, cloud: 0 }) => {
  // <-- ADDED: Extract the Express backend URL for telemetry persistence
  const { backendUrl } = useContext(AuthContext);

  const [messages, setMessages] = useState([]);
  const [currentTier, setCurrentTier] = useState("local1");
  const [tokens, setTokens] = useState(initialTokens);
  const [isConnected, setIsConnected] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const socketRef = useRef(null);
  const tierRef = useRef("local1");
  const messagesRef = useRef([]);
  const currentTurnTokens = useRef({ input: 0, output: 0, tier: "local" });

  useEffect(() => {
    setTokens({
      local: initialTokens.local || 0,
      cloud: initialTokens.cloud || 0,
    });
  }, [initialTokens.local, initialTokens.cloud]);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    socketRef.current = io(url, {
      withCredentials: true,
      reconnectionAttempts: 5,
      timeout: 60000, // <-- Increase from 10000 to 60000 (60 seconds)
      pingTimeout: 60000, // <-- ADD THIS: Wait longer for server pings
      pingInterval: 25000, // <-- ADD THIS: Standard ping interval
      transports: ["websocket"],
      forceNew: true,
    });
    // ... rest of the code

    const socket = socketRef.current;

    socket.on("connect", () => {
      console.info("[HybridNode WebSocket] Connection established.");
      setIsConnected(true);
    });

    // socket.on("disconnect", () => setIsConnected(false));
    socket.on("disconnect", () => {
      setIsConnected(false);
      setIsGenerating(false); // <--- CRITICAL: Instantly unlocks the text input if the connection drops!
    });
    socket.on("tier_update", (data) => {
      setCurrentTier(data.tier);
      tierRef.current = data.tier;
    });

    socket.on("token", (tokenData) => {
      const text = typeof tokenData === "string" ? tokenData : tokenData.text;

      setMessages((prev) => {
        const lastMsg = prev[prev.length - 1];

        if (lastMsg && lastMsg.role === "assistant") {
          const updated = [...prev];
          updated[updated.length - 1] = {
            ...lastMsg,
            content: lastMsg.content + text,
          };
          return updated;
        }

        return [
          ...prev,
          { role: "assistant", content: text, timestamp: new Date() },
        ];
      });
    });

    socket.on("analytics_update", (data) => {
      const inputTokens = data.inputTokens || data.input_tokens || 0;
      const outputTokens = data.outputTokens || data.output_tokens || 0;
      const tier = data.tier || "20b"; // Default to 20b

      // FIX: Check if tier is exactly "gemini"
      const isGemini = tier === "gemini";

      // Update state names to match the new architecture
      const executionKey = isGemini ? "gemini" : "groq";
      const totalTurnTokens = inputTokens + outputTokens;

      setTokens((prev) => ({
        ...prev,
        [executionKey]: (prev[executionKey] || 0) + totalTurnTokens,
      }));

      currentTurnTokens.current = {
        input: inputTokens,
        output: outputTokens,
        tier: tier, // Pass the specific model tier (e.g., "27b")
      };
    });

    socket.on("done", async () => {
      setIsGenerating(false);

      const metrics = currentTurnTokens.current;
      if (metrics.input === 0 && metrics.output === 0) return;

      try {
        await axios.post(
          `${backendUrl}/api/user/update-tokens`,
          {
            tier: metrics.tier,
            inputTokens: metrics.input,
            outputTokens: metrics.output,
            // ADD THESE TWO FIELDS:
            groqTokens:
              metrics.tier === "gemini" ? 0 : metrics.input + metrics.output,
            geminiTokens:
              metrics.tier === "gemini" ? metrics.input + metrics.output : 0,
          },
          { withCredentials: true },
        );
        console.info(`📊 Telemetry Synced with MongoDB`);
      } catch (error) {
        console.error("⚠️ Failed to sync token telemetry:", error.message);
      } finally {
        currentTurnTokens.current = { input: 0, output: 0, tier: "20b" }; // Reset to default
      }
    });

    return () => {
      socket.off("tier_update");
      socket.off("token");
      socket.off("analytics_update");
      socket.off("done");
      socket.off("connect");
      socket.off("disconnect");
      socket.disconnect();
    };
  }, [url, backendUrl]); // <-- ADDED: backendUrl to dependency array

  const sendMessage = useCallback(
    (text) => {
      if (!text.trim() || !socketRef.current || isGenerating) return;

      const userMessage = {
        role: "user",
        content: text,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setIsGenerating(true);

      socketRef.current.emit("user_message", {
        prompt: text,
        context: messagesRef.current.slice(-5),
      });
    },
    [isGenerating],
  );

  return {
    messages,
    setMessages,
    currentTier,
    tokens,
    sendMessage,
    isConnected,
    isGenerating,
  };
};
