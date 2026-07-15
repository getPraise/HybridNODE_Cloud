import React, { useContext } from 'react';
import WorkFlowDAG from '../flow/WorkflowDAG';
import { CostSavingsMeter } from '../agent/CostSavingsMeter.jsx';
import { AuthContext } from '../../context/AuthContext'; 
// useTheme removed: Relying entirely on native Tailwind dark: classes
import { Activity, Zap, Cpu, BarChart3, Lock } from 'lucide-react';

const ExecutionPanel = ({ tokens = { groq: 0, gemini: 0 } }) => {
  const { isLoggedIn } = useContext(AuthContext);

  return (
    <div className="flex h-full w-full flex-col border-l border-slate-200 bg-white transition-colors duration-500 dark:border-white/5 dark:bg-slate-950">
      
      {/* 1. Header: System Status */}
      <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 p-4 transition-colors dark:border-white/5 dark:bg-slate-900/10">
        <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">
          <Activity size={14} className="text-blue-500" />
          Live Execution
        </div>
        <div className="flex items-center gap-1.5 rounded-md border border-emerald-200 bg-emerald-50 px-2 py-1 text-[8px] font-black text-emerald-600 transition-all dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400">
           <Zap size={10} fill="currentColor" className="animate-pulse" /> SYNCED
        </div>
      </div>
      
      {/* 2. Visual Logic Flow (The DAG) */}
      <div className="relative flex min-h-0 flex-1 flex-col">
        <div className="flex items-center gap-2 p-4">
            <Cpu size={12} className="text-slate-500" />
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">Routing Pipeline</span>
        </div>
        
        {/* Delegates scrolling/panning securely to the XYFlow Canvas */}
        <div className="flex-1 overflow-hidden opacity-90 transition-opacity dark:opacity-100">
            <WorkFlowDAG />
        </div>
      </div>

      {/* 3. Performance Metrics Section */}
      {isLoggedIn ? (
        <div className="animate-in fade-in slide-in-from-bottom-4 border-t border-slate-200 bg-slate-50 p-5 duration-500 transition-colors dark:border-white/5 dark:bg-slate-900/20">
          <div className="mb-4 flex items-center gap-2">
              <BarChart3 size={14} className="text-slate-500" />
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">Efficiency Metrics</span>
          </div>
          
          {/* Passed the new Groq/Gemini variables to the meter */}
          <CostSavingsMeter 
              groqTokens={tokens?.groq || 0} 
              geminiTokens={tokens?.gemini || 0} 
          />

          <div className="mt-4 grid grid-cols-2 gap-2">
              <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm transition-all dark:border-white/5 dark:bg-slate-950 dark:shadow-inner">
                  <p className="mb-1 text-[7px] font-black uppercase leading-none tracking-widest text-slate-500">Groq Compute</p>
                  <p className="font-mono text-xs font-bold text-emerald-500">
                      {tokens?.groq?.toLocaleString() || 0} <span className="text-[8px] opacity-60">TKS</span>
                  </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm transition-all dark:border-white/5 dark:bg-slate-950 dark:shadow-inner">
                  <p className="mb-1 text-[7px] font-black uppercase leading-none tracking-widest text-slate-500">Gemini Cloud</p>
                  <p className="font-mono text-xs font-bold text-amber-500">
                      {tokens?.gemini?.toLocaleString() || 0} <span className="text-[8px] opacity-60">TKS</span>
                  </p>
              </div>
          </div>
          
          <div className="mt-3 flex items-center justify-between px-1">
               <span className="text-[8px] font-black uppercase tracking-tighter text-slate-500">Savings Est.</span>
               {/* Note: Your CostSavingsMeter also shows savings at the top, so this is just a static placeholder in your design! */}
               <span className="font-mono text-[10px] font-bold text-emerald-600 dark:text-emerald-400">+$0.0000</span>
          </div>
        </div>
      ) : (
        /* GUEST PLACEHOLDER */
        <div className="border-t border-slate-200 bg-slate-50 p-8 text-center transition-colors dark:border-white/5 dark:bg-slate-900/10">
          <Lock size={20} className="mx-auto mb-3 text-slate-600 opacity-20" />
          <p className="text-[10px] font-black uppercase leading-relaxed tracking-widest text-slate-500">
            Register to unlock <br/> Efficiency Metrics
          </p>
        </div>
      )}
    </div>
  );
};

export default ExecutionPanel;