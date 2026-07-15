import React from 'react';
// useTheme removed: Relying entirely on native Tailwind dark: classes

/**
 * ModelTierBadge
 * Displays the currently active AI routing tier with a live pulse indicator.
 * @param {string} tier - The active model tier ('20b', '27b', '120b', 'gemini')
 */
export const ModelTierBadge = ({ tier = '20b' }) => {
    const tierConfig = {
        "20b": { 
            label: 'GROQ 20B', 
            dot: 'bg-emerald-500',
            classes: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400'
        },
        "27b": { 
            label: 'GROQ 27B', 
            dot: 'bg-cyan-500',
            classes: 'border-cyan-200 bg-cyan-50 text-cyan-700 dark:border-cyan-500/20 dark:bg-cyan-500/10 dark:text-cyan-400'
        },
        "120b": { 
            label: 'GROQ 120B', 
            dot: 'bg-indigo-500',
            classes: 'border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-500/20 dark:bg-indigo-500/10 dark:text-indigo-400'
        },
        "gemini": { 
            label: 'GEMINI CLOUD', 
            dot: 'bg-amber-500',
            classes: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-400'
        }
    };

    // Fallback to the lowest tier (20b) if an unknown string is passed
    const active = tierConfig[tier] || tierConfig["20b"];

    return (
        <div className={`inline-flex select-none items-center gap-2 rounded-md border px-2 py-0.5 text-[9px] font-black uppercase tracking-widest transition-all duration-500 ${active.classes}`}>
            
            {/* Status Pulse */}
            <span className="relative flex h-1.5 w-1.5">
                <span className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-40 ${active.dot}`} />
                <span className={`relative inline-flex h-1.5 w-1.5 rounded-full ${active.dot}`} />
            </span>
            
            {active.label}
        </div>
    );
};