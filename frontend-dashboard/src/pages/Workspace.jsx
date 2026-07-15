import React, {
  useState,
  useContext,
  useCallback,
  useEffect,
  useRef,
  useMemo
} from "react";
import { AuthContext } from "../context/AuthContext.jsx";
import { useAgentStream } from "../hooks/useAgentStream";
import { useChatActions } from "../hooks/useChatActions";
import Sidebar from "../components/layout/Sidebar";
import ChatWindow from "../components/layout/ChatWindow";
import ExecutionPanel from "../components/layout/ExecutionPanel";
import SettingsModal from "../components/modals/SettingsModal";
import {
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
  Activity,
} from "lucide-react";

const Workspace = () => {
  const { isLoggedIn, userData } = useContext(AuthContext);

  // --- 1. UI LAYOUT STATE ---
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isExecutionOpen, setExecutionOpen] = useState(false);
  const [isSettingsOpen, setSettingsOpen] = useState(false);

  // --- 2. DATA ORCHESTRATION STATE ---
  const [activeChatId, setActiveChatId] = useState(null);
  const isInitialMount = useRef(true);

  // Replace the const savedTokens line with this:
  const savedTokens = useMemo(
    () => ({
      local: userData?.analytics?.totalLocalTokens || 0,
      cloud: userData?.analytics?.totalCloudTokens || 0,
    }),
    [userData],
  ); // Now it updates whenever userData changes!

  // --- 3. CUSTOM HOOKS (Fully Wired) ---
  const {
    history,
    persistChat,
    createNewSession,
    deleteSession, 
    renameSession, 
    togglePin, 
    messages: dbMessages,
  } = useChatActions(activeChatId);

  // --- UPDATED: Pass the savedTokens into your agent stream hook! ---
  const {
    messages: streamMessages,
    setMessages: setStreamMessages,
    currentTier,
    tokens,
    sendMessage,
    isGenerating, // Pass this to UI to disable input
  } = useAgentStream(
    import.meta.env.VITE_AI_ENGINE_URL || "http://localhost:8000",
    savedTokens,
  );

  // --- 4. ORCHESTRATION LOGIC ---

  // Sync: Load DB messages into the Live Stream view when chat changes
  useEffect(() => {
    if (dbMessages) {
      setStreamMessages(dbMessages);
    }
  }, [dbMessages, setStreamMessages]);

  // Sync: Auto-save stream to DB after AI finishes a message
  useEffect(() => {
    if (streamMessages.length > 0 && activeChatId && !isGenerating) {
      const timer = setTimeout(() => {
        persistChat(streamMessages);
      }, 500); // Small delay to ensure state is settled
      return () => clearTimeout(timer);
    }
  }, [streamMessages, persistChat, activeChatId, isGenerating]);

  // Handle: Starting a fresh node
  const handleNewSession = useCallback(async () => {
    setStreamMessages([]);
    setActiveChatId(null);

    if (isLoggedIn) {
      try {
        const newId = await createNewSession(false);
        if (newId) setActiveChatId(newId);
      } catch (err) {
        console.error("Workspace Initialization Failed:", err);
      }
    }
  }, [isLoggedIn, createNewSession, setStreamMessages]);

  // Initial Logic One time run only
  useEffect(() => {
    if (isInitialMount.current) {
      if (!activeChatId && isLoggedIn) handleNewSession();
      isInitialMount.current = false;
    }
  }, [isLoggedIn, activeChatId, handleNewSession]);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 text-slate-900 transition-colors duration-200 dark:bg-slate-950 dark:text-slate-200">
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setSettingsOpen(false)}
      />

      {/* SIDEBAR: NAVIGATION & HISTORY */}
      <aside
        className={`relative flex-shrink-0 border-r border-slate-200 bg-white transition-all duration-300 ease-in-out dark:border-white/5 dark:bg-slate-950 ${
          isSidebarOpen ? "w-64" : "w-0 overflow-hidden"
        }`}
      >
        <div className="w-64 h-full">
          <Sidebar
            isLoggedIn={isLoggedIn}
            userData={userData}
            chatHistory={history}
            activeChatId={activeChatId}
            onOpenSettings={() => setSettingsOpen(true)}
            onNewSession={handleNewSession}
            onSelectSession={(id) => setActiveChatId(id)}
            /* --- THE MISSING WIRES ARE CONNECTED HERE --- */
            onPinSession={togglePin}
            onRenameSession={renameSession}
            onDeleteSession={(id) => {
              deleteSession(id);
              // If you delete the chat you are currently looking at, open a new one
              if (activeChatId === id) handleNewSession();
            }}
          />
        </div>
      </aside>

      {/* MAIN CONTENT: CHAT */}
      <main className="flex-1 flex flex-col min-w-0 relative">
        <header className="flex h-14 z-10 items-center justify-between border-b border-slate-200 bg-white/80 px-4 backdrop-blur-xl dark:border-white/5 dark:bg-slate-950/50">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!isSidebarOpen)}
              className="rounded-xl p-2 text-slate-500 transition-all hover:bg-blue-500/10 hover:text-blue-500"
            >
              {isSidebarOpen ? (
                <PanelLeftClose size={18} />
              ) : (
                <PanelLeftOpen size={18} />
              )}
            </button>

            <div className="hidden h-4 w-[1px] bg-slate-500/20 md:block" />

            <div className="flex items-center gap-2 rounded-full border border-slate-500/10 bg-slate-500/5 px-3 py-1">
              <Activity
                size={12}
                className={
                  isLoggedIn
                    ? "animate-pulse text-emerald-500"
                    : "text-slate-400"
                }
              />
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">
                {isLoggedIn ? `NODE ACTIVE: ${userData?.name}` : "SANDBOX MODE"}
              </span>
            </div>
          </div>

          <button
            onClick={() => setExecutionOpen(!isExecutionOpen)}
            className="rounded-xl p-2 text-slate-500 transition-all hover:bg-blue-500/10 hover:text-blue-500"
          >
            {isExecutionOpen ? (
              <PanelRightClose size={18} />
            ) : (
              <PanelRightOpen size={18} />
            )}
          </button>
        </header>

        <section className="relative flex-1 overflow-hidden">
          <ChatWindow
            messages={streamMessages}
            currentTier={currentTier}
            onSendMessage={sendMessage}
            isGenerating={isGenerating}
          />
        </section>
      </main>

      {/* METRICS PANEL */}
      <aside
        className={`relative flex-shrink-0 border-l border-slate-200 bg-white transition-all duration-300 ease-in-out dark:border-white/5 dark:bg-slate-950 ${
          isExecutionOpen ? "w-80" : "w-0 overflow-hidden"
        }`}
      >
        <div className="w-80 h-full">
          <ExecutionPanel tokens={tokens} />
        </div>
      </aside>
    </div>
  );
};

export default Workspace;
