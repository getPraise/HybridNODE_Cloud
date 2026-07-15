import React from 'react';
import { Plus, Clock, Settings, Activity, Bookmark } from 'lucide-react'; 
import { useNavigate } from 'react-router-dom';
import ChatHistoryItem from './ChatHistoryItem';
import Logo from '../brand/Logo';

const Sidebar = ({ 
  isLoggedIn, 
  userData, 
  onOpenSettings, 
  chatHistory = [], 
  onNewSession,
  activeChatId,
  onSelectSession,
  onDeleteSession, 
  onPinSession,    
  onRenameSession  
}) => {
  const navigate = useNavigate();

  return (
    <div className="flex h-full w-full flex-col border-r border-slate-200 bg-white transition-colors duration-500 dark:border-white/5 dark:bg-slate-950">
      
      {/* 1. BRAND HEADER */}
      <div 
        onClick={() => {
            if (onNewSession) onNewSession(); 
            navigate('/workspace');
        }}
        className="group flex cursor-pointer items-center gap-3 p-6"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 shadow-lg shadow-blue-600/20 transition-transform group-hover:scale-110">
          <Logo size={18} className="text-white" />
        </div>
        <span className="text-lg font-black italic tracking-tighter text-slate-950 dark:text-white">
          Hybrid<span className="text-blue-600">NODE</span>
        </span>
      </div>

      {/* 2. PRIMARY ACTION */}
      <div className="mb-6 px-4">
        <button 
          onClick={onNewSession}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 py-3 text-xs font-black uppercase tracking-widest text-white shadow-md transition-all hover:bg-slate-800 active:scale-[0.98] dark:bg-white dark:text-black dark:hover:bg-slate-200"
        >
          <Plus size={14} strokeWidth={3} /> New Session
        </button>
      </div>

      {/* 3. HISTORY LIST */}
      <div className="custom-scrollbar flex-1 space-y-6 overflow-y-auto px-4">
        <div>
          <div className="mb-4 ml-1 flex items-center justify-between pr-2">
            <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 opacity-70">
                <Clock size={12} /> Recent History
            </div>
            {chatHistory.some(c => c.isPinned) && (
                 <Bookmark size={10} className="fill-blue-500/20 text-blue-500" />
            )}
          </div>

          {isLoggedIn ? (
            <div className="space-y-1">
              {chatHistory.length > 0 ? (
                chatHistory.map((chat) => {
                  const id = chat._id || chat.id;
                  return (
                    <ChatHistoryItem 
                      key={id} 
                      chat={chat} 
                      isActive={activeChatId === id}
                      onClick={() => onSelectSession?.(id)}
                      onRename={(newName) => onRenameSession?.(id, newName)} 
                      onDelete={() => onDeleteSession?.(id)} 
                      
                      /* CRITICAL FIX: Pass the current pin status to the hook */
                      onPin={() => onPinSession?.(id, chat.isPinned)} 
                    />
                  );
                })
              ) : (
                <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-center dark:border-white/5 dark:bg-white/[0.02]">
                  <p className="text-[10px] font-bold uppercase tracking-tight text-slate-500">No recent sessions</p>
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 transition-all dark:border-white/5 dark:bg-slate-900/40">
              <p className="mb-4 text-[10px] font-medium leading-relaxed text-slate-500">Sign in to sync your workspace history.</p>
              <button 
                onClick={() => navigate('/login')} 
                className="w-full rounded-lg bg-blue-600 py-2.5 text-[9px] font-black uppercase tracking-widest text-white shadow-lg shadow-blue-600/20 hover:bg-blue-500"
              >
                Sign In
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 4. USER PROFILE FOOTER */}
      <div className="border-t border-slate-100 bg-white p-4 transition-colors dark:border-white/5 dark:bg-slate-950">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-100 text-sm font-black text-blue-600 transition-all dark:border-white/10 dark:bg-slate-900 dark:text-blue-400">
              {isLoggedIn && userData?.name ? (
                  userData.name[0].toUpperCase()
              ) : (
                  <Logo size={16} className="opacity-60" />
              )}
            </div>
            <div className="flex flex-col truncate">
              <span className="truncate text-xs font-black leading-tight text-slate-950 dark:text-white">
                {isLoggedIn ? userData.name : 'Guest User'}
              </span>
              <div className="flex items-center gap-1.5">
                <Activity size={8} className={isLoggedIn ? 'text-emerald-500' : 'text-slate-400'} />
                <span className={`text-[8px] font-black uppercase tracking-tighter ${isLoggedIn ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'}`}>
                  {isLoggedIn ? 'Cloud Sync Active' : 'Local Sandbox'}
                </span>
              </div>
            </div>
          </div>
          <button 
            onClick={onOpenSettings} 
            className="rounded-xl p-2 text-slate-400 transition-all hover:bg-slate-100 hover:text-slate-950 dark:text-slate-500 dark:hover:bg-white/5 dark:hover:text-white"
          >
            <Settings size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;