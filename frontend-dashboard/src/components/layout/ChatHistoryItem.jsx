import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Pin, Trash2, Edit2 } from 'lucide-react';

/**
 * ChatHistoryItem
 * Individual session entry in the Sidebar.
 * Handles inline renaming, pinning logic, and deletion triggers.
 */
const ChatHistoryItem = ({ chat, onRename, onDelete, onPin, isActive, onClick }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [newName, setNewName] = useState(chat.title);
    const inputRef = useRef(null);

    // Focus management for professional UX
    useEffect(() => {
        if (isEditing) {
            inputRef.current?.focus();
            inputRef.current?.select(); // Auto-select text for faster editing
        }
    }, [isEditing]);

    const handleRename = () => {
        const trimmed = newName.trim();
        if (trimmed && trimmed !== chat.title) {
            // FIX: Sidebar only expects the new string!
            onRename(trimmed); 
        } else {
            setNewName(chat.title);
        }
        setIsEditing(false);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') handleRename();
        if (e.key === 'Escape') {
            setNewName(chat.title);
            setIsEditing(false);
        }
    };

    return (
        <div 
            onClick={onClick}
            className={`group relative mb-1 flex cursor-pointer items-center justify-between rounded-xl border p-2.5 transition-all duration-300 ${
                isActive 
                ? 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-500/20 dark:bg-blue-600/10 dark:text-white'
                : 'border-transparent text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/5'
            }`}
        >
            <div className="flex flex-1 items-center gap-3 truncate">
                <MessageSquare 
                    size={14} 
                    className={`shrink-0 transition-colors ${
                        chat.isPinned ? 'text-blue-500' : 'text-slate-400 group-hover:text-blue-500'
                    }`} 
                />
                
                {isEditing ? (
                    <input
                        ref={inputRef}
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        onBlur={handleRename}
                        onKeyDown={handleKeyDown}
                        onClick={(e) => e.stopPropagation()} 
                        className="w-full rounded border border-blue-400 bg-white px-2 py-0.5 text-xs font-bold text-slate-900 outline-none ring-2 ring-blue-500/20 dark:border-blue-500/50 dark:bg-slate-900 dark:text-white"
                    />
                ) : (
                    <span className={`truncate text-[11px] font-bold tracking-tight transition-colors ${
                        isActive || chat.isPinned ? 'text-slate-950 dark:text-white' : 'text-slate-600 dark:text-slate-400'
                    }`}>
                        {chat.title}
                    </span>
                )}
            </div>

            {/* ACTION TOOLBAR: Hidden by default, visible on hover */}
            {!isEditing && (
                <div className="ml-2 flex shrink-0 items-center gap-0.5 opacity-0 transition-all duration-200 group-hover:opacity-100">
                    <button 
                        // FIX: Sidebar handles the ID, just call the function
                        onClick={(e) => { e.stopPropagation(); onPin(); }}
                        className={`rounded-lg p-1.5 transition-all hover:bg-slate-200 dark:hover:bg-slate-800 ${
                            chat.isPinned ? 'text-blue-500' : 'text-slate-400 hover:text-blue-500'
                        }`}
                        title={chat.isPinned ? "Unpin Session" : "Pin Session"}
                    >
                        <Pin size={12} className={chat.isPinned ? 'fill-current' : ''} />
                    </button>
                    
                    <button 
                        onClick={(e) => { e.stopPropagation(); setIsEditing(true); }}
                        className="rounded-lg p-1.5 text-slate-400 transition-all hover:bg-blue-500/10 hover:text-blue-600 dark:hover:bg-blue-500/20 dark:hover:text-blue-400"
                        title="Rename Session"
                    >
                        <Edit2 size={12} />
                    </button>
                    
                    <button 
                        // FIX: Sidebar handles the ID, just call the function
                        onClick={(e) => { e.stopPropagation(); onDelete(); }}
                        className="rounded-lg p-1.5 text-slate-400 transition-all hover:bg-red-500/10 hover:text-red-600 dark:hover:bg-red-500/20 dark:hover:text-red-400"
                        title="Delete Session"
                    >
                        <Trash2 size={12} />
                    </button>
                </div>
            )}
            
            {/* PIN INDICATOR: Subtle dot when not hovering */}
            {chat.isPinned && !isEditing && (
                <div className="absolute right-1 top-1.5 opacity-100 transition-opacity group-hover:opacity-0">
                    <div className="h-1.5 w-1.5 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.6)]" />
                </div>
            )}
        </div>
    );
};

export default ChatHistoryItem;