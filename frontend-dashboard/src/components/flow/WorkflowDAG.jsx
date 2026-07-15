import React, { useMemo } from 'react';
import { ReactFlow, Background } from '@xyflow/react';
import { useTheme } from '../../context/ThemeContext'; 
import '@xyflow/react/dist/style.css';


export default function WorkFlowDAG() {
  // We keep useTheme strictly for styling the SVG canvas elements (Edges & Background)
  const { theme } = useTheme();

  // 1. Dynamic Node Definitions (Optimized: Powered purely by Tailwind)
  const nodes = useMemo(() => {
    const baseClass = 'flex h-8 w-[85px] select-none items-center justify-center rounded-lg border text-[8px] font-black tracking-[0.1em] shadow-sm backdrop-blur-xl transition-all duration-500';
    
    const subNodeClass = 'flex h-6 w-[85px] select-none items-center justify-center rounded-md border text-[6.5px] font-black tracking-normal shadow-sm backdrop-blur-xl transition-all duration-500';
    return [
      { 
        id: 'input', 
        type: 'input', 
        data: { label: 'REQUEST' }, 
        position: { x: 160, y: 0 }, 
        className: `${baseClass} border-slate-200 bg-white text-slate-500 dark:border-white/10 dark:bg-slate-900 dark:text-slate-400` 
      },
      { 
        id: 'router', 
        data: { label: 'SEMANTIC ROUTER' }, 
        position: { x: 160, y: 70 }, 
        // Made this node slightly wider to fit the text
        className: `flex h-8 w-[120px] select-none items-center justify-center rounded-lg border text-[8px] font-black tracking-[0.1em] shadow-sm backdrop-blur-xl transition-all duration-500 border-blue-200 bg-blue-50 text-blue-700 shadow-blue-600/10 dark:border-blue-500/30 dark:bg-blue-600/20 dark:text-blue-400 dark:shadow-blue-500/20` 
      },
      // --- The 4 Routing Tiers ---
      { 
        id: 'tier_20b', 
        data: { label: 'GROQ 20B' }, 
        position: { x: 0, y: 160 }, 
        className: `${subNodeClass} border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-600/20 dark:text-emerald-400` 
      },
      { 
        id: 'tier_27b', 
        data: { label: 'GROQ 27B' }, 
        position: { x: 110, y: 160 }, 
        className: `${subNodeClass} border-cyan-200 bg-cyan-50 text-cyan-700 dark:border-cyan-500/30 dark:bg-cyan-600/20 dark:text-cyan-400` 
      },
      { 
        id: 'tier_120b', 
        data: { label: 'GROQ 120B' }, 
        position: { x: 220, y: 160 }, 
        className: `${subNodeClass} border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-500/30 dark:bg-indigo-600/20 dark:text-indigo-400` 
      },
      { 
        id: 'tier_gemini', 
        data: { label: 'GEMINI' }, 
        position: { x: 330, y: 160 }, 
        className: `${baseClass} border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-600/20 dark:text-amber-400` 
      },
      // --- Output ---
      { 
        id: 'output', 
        type: 'output', 
        data: { label: 'RESPONSE' }, 
        position: { x: 160, y: 250 }, 
        className: `${baseClass} border-slate-200 bg-white text-slate-500 dark:border-white/10 dark:bg-slate-900 dark:text-slate-400` 
      },
    ];
  }, []); 

  // 2. Dynamic Edge Definitions
  const edges = useMemo(() => {
    const isDark = theme === 'dark';
    const labelStyle = { fill: isDark ? '#94a3b8' : '#475569', fontSize: '7px', fontWeight: '900', letterSpacing: '0.05em' };
    const strokeColor = isDark ? '#334155' : '#cbd5e1';

    return [
      // Request -> Router
      { id: 'e1', source: 'input', target: 'router', animated: true, style: { stroke: '#3b82f6', strokeWidth: 2 } },
      
      // Router -> Models (With semantic labels)
      { 
        id: 'e2', source: 'router', target: 'tier_20b', label: 'BASIC CHAT', animated: true, 
        labelStyle, edgePath: 'smoothstep', style: { stroke: '#10b981', strokeWidth: 1.5 } // Emerald stroke
      },
      { 
        id: 'e3', source: 'router', target: 'tier_27b', label: 'LOGIC', animated: true, 
        labelStyle, edgePath: 'smoothstep', style: { stroke: '#06b6d4', strokeWidth: 1.5 } // Cyan stroke
      },
      { 
        id: 'e4', source: 'router', target: 'tier_120b', label: 'DEEP REASONING', animated: true, 
        labelStyle, edgePath: 'smoothstep', style: { stroke: '#6366f1', strokeWidth: 1.5 } // Indigo stroke
      },
      { 
        id: 'e5', source: 'router', target: 'tier_gemini', label: 'CODE / COMPLEX', animated: true, 
        labelStyle, edgePath: 'smoothstep', style: { stroke: '#f59e0b', strokeWidth: 1.5 } // Amber stroke
      },

      // Models -> Output
      { id: 'e6', source: 'tier_20b', target: 'output', style: { stroke: strokeColor } },
      { id: 'e7', source: 'tier_27b', target: 'output', style: { stroke: strokeColor } },
      { id: 'e8', source: 'tier_120b', target: 'output', style: { stroke: strokeColor } },
      { id: 'e9', source: 'tier_gemini', target: 'output', style: { stroke: strokeColor } },
    ];
  }, [theme]);

  return (
    <div className="group relative h-full w-full bg-slate-50/50 transition-colors duration-500 dark:bg-slate-950/20">
      
      {/* Visual Status Indicator */}
      <div className="pointer-events-none absolute left-4 top-4 z-10">
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 opacity-60">Mesh Routing Active</span>
        </div>
      </div>

      <ReactFlow 
        nodes={nodes} 
        edges={edges} 
        fitView 
        colorMode={theme}
        draggable={false}
        panOnDrag={false}
        zoomOnScroll={false}
        nodesConnectable={false}
        className="pointer-events-none sm:pointer-events-auto"
      >
        <Background 
          color={theme === 'dark' ? '#1e293b' : '#cbd5e1'} 
          gap={25} 
          size={1} 
          variant="dots" 
        />
      </ReactFlow>

      {/* Modern UI glass effect overlay */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-white/50 to-transparent dark:from-slate-950/50" />
    </div>
  );
}