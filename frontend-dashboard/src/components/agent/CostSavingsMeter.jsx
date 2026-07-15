import React, { useMemo } from 'react';

/**
 * CostSavingsMeter (Updated for Groq + Gemini)
 * Tracks the efficiency and estimated cost savings of routing workloads to the free Groq API.
 * @param {number} groqTokens - Tokens processed by the free Groq models (20b, 27b, 120b).
 * @param {number} geminiTokens - Tokens processed by the Gemini cloud API.
 */
export const CostSavingsMeter = ({ groqTokens = 0, geminiTokens = 0 }) => {
    const stats = useMemo(() => {
        const total = groqTokens + geminiTokens || 1;
        const percentage = Math.min((groqTokens / total) * 100, 100);
        
        // Simulating savings: What it would have cost if Groq tokens were sent to a paid API
        // Using your original $0.015 per 1k tokens baseline
        const savingsValue = (groqTokens / 1000) * 0.015;
        
        const formattedSavings = savingsValue === 0 
            ? "$0.0000" 
            : savingsValue < 0.01 
                ? `$${savingsValue.toFixed(5)}` 
                : savingsValue.toLocaleString('en-US', { 
                    style: 'currency', 
                    currency: 'USD', 
                    minimumFractionDigits: 4 
                  });

        return { percentage, formattedSavings };
    }, [groqTokens, geminiTokens]);

    return (
        <div className="space-y-4 py-2">
            {/* Header Stats */}
            <div className="flex items-end justify-between">
                <div className="space-y-1">
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">
                        Free Tier Efficiency
                    </p>
                    <p className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">
                        {stats.percentage.toFixed(1)}% Groq-Routed
                    </p>
                </div>
                <div className="text-right">
                    <span className="mb-1 block text-[9px] font-black uppercase tracking-tight text-slate-500">
                        Est. Savings
                    </span>
                    <span className="tabular-nums font-mono text-sm font-bold text-emerald-600 dark:text-emerald-400">
                        {stats.formattedSavings}
                    </span>
                </div>
            </div>

            {/* Progress Track */}
            <div className="relative h-2 w-full overflow-hidden rounded-full border border-slate-200 bg-slate-100 shadow-inner transition-all duration-500 dark:border-white/5 dark:bg-slate-900 dark:shadow-none">
                {/* Animated Fill */}
                <div 
                    className="absolute left-0 top-0 h-full bg-gradient-to-r from-blue-600 to-cyan-400 shadow-none transition-all duration-1000 ease-out dark:shadow-[0_0_12px_rgba(37,99,235,0.4)]" 
                    style={{ width: `${stats.percentage}%` }}
                />
            </div>
            
            {/* Logic Label */}
            <p className="text-center text-[8px] font-bold uppercase tracking-widest text-slate-500 opacity-60">
                {groqTokens > 0 ? "Semantic Router Optimization Active" : "Waiting for Neural Input"}
            </p>
        </div>
    );
};