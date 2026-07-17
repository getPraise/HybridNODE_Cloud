import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Shield, Zap, Globe, ArrowUpRight } from 'lucide-react';
import Logo from '../components/brand/Logo'; 

const Home = () => {
  const navigate = useNavigate();
  
  // Note: We don't need useTheme here anymore. 
  // Tailwind's dark: modifier handles everything automatically based on the HTML class!

  return (
    <div className="min-h-screen overflow-x-hidden bg-white text-slate-900 selection:bg-blue-500/30 transition-colors duration-500 dark:bg-slate-950 dark:text-slate-200">
      
      {/* --- DYNAMIC BACKGROUND LAYER --- */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {/* Grid adjusts opacity automatically in dark mode */}
        <div className="absolute inset-0 opacity-[0.05] bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] dark:opacity-20" />
        
        {/* Ambient Glows */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] blur-[120px] rounded-full bg-blue-600/[0.03] dark:bg-blue-600/10" />
      </div>

      {/* --- CONTENT SECTION --- */}
      <div className="relative z-10 pt-32 pb-20 px-6 flex flex-col items-center">
        
        {/* Status Badge */}
        <div className="mb-8 flex items-center gap-2 px-4 py-1.5 rounded-full border border-blue-200 bg-blue-50/50 backdrop-blur-md dark:border-blue-500/20 dark:bg-blue-500/10">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
          </span>
          <span className="text-[9px] font-black uppercase tracking-[0.3em] text-blue-600 dark:text-blue-400">
            System Under Testing
          </span>
        </div>

        {/* Brand Title & Logo Area */}
        <div className="text-center max-w-5xl mb-12 flex flex-col items-center">
          {/* Injecting your Logo component here */}
          <div className="mb-6 flex justify-center drop-shadow-xl">
             <Logo className="w-16 h-16 md:w-20 md:h-20" />
          </div>

          <h1 className="text-6xl md:text-8xl font-[1000] italic tracking-[-0.05em] leading-[0.85] mb-8 scale-x-110 origin-center text-slate-950 transition-colors dark:text-white">
            Hybrid<span className="text-blue-600">NODE</span>
          </h1>
          <p className="text-base md:text-lg max-w-2xl mx-auto leading-relaxed font-medium text-slate-500 dark:text-slate-400">
            Deploy intelligence where it matters. Efficiently route workloads across 
            <span className="text-blue-500"> intelligent LPU tiers</span> and 
            <span className="text-blue-600 font-bold"> frontier cloud models</span> for peak performance.
          </p>
        </div>

       {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-lg">
          <button 
            onClick={() => navigate('/workspace')}
            className="w-full px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-2xl transition-all flex items-center justify-center gap-3 active:scale-95 shadow-xl shadow-blue-600/20 text-[11px] tracking-widest uppercase italic"
          >
            Launch Workspace <ChevronRight size={16} strokeWidth={3} />
          </button>
          
          <button 
            onClick={() => navigate('/login')}
            /* ADDED font-black HERE to match the primary button */
            className="w-full px-8 py-4 backdrop-blur-xl border rounded-2xl transition-all flex items-center justify-center gap-3 active:scale-95 text-[11px] font-black tracking-widest uppercase italic bg-white border-slate-200 text-slate-900 hover:bg-slate-50 shadow-sm dark:bg-slate-900/50 dark:border-white/10 dark:text-white dark:hover:bg-slate-800"
          >
            Sign In <ArrowUpRight size={16} className="opacity-50" />
          </button>
        </div>

        {/* Feature Grid */}
        {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-32 max-w-6xl w-full">
          {[
            { icon: <Shield size={18} />, title: "Incognito Mode", desc: "Enable zero-persistence sessions where conversations are held in temporary memory and never synced to the database." },
            { icon: <Zap size={18} />, title: "Cost Efficiency", desc: "Automated routing logic reduces API expenses by prioritizing local inference." },
            { icon: <Globe size={18} />, title: "Hybrid Edge", desc: "Seamlessly switch to cloud frontier models when task complexity requires high compute." }
          ].map((feature, i) => (
            <div key={i} className="group p-8 border rounded-[2rem] transition-all duration-500 bg-white border-slate-100 hover:border-blue-200 shadow-sm dark:bg-slate-900/20 dark:border-white/5 dark:hover:border-blue-500/30">
              <div className="w-10 h-10 bg-blue-600/10 rounded-xl flex items-center justify-center text-blue-500 mb-6 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                {feature.icon}
              </div>
              <h3 className="font-bold text-xs tracking-widest mb-3 uppercase text-slate-900 dark:text-white">
                {feature.title}
              </h3>
              <p className="text-slate-500 text-sm leading-relaxed font-medium">
                {feature.desc}
              </p>
            </div>
          ))}
        </div> */}
      </div>

      {/* Footer */}
      <footer className="relative z-10 py-12 border-t text-center transition-colors bg-slate-50 border-slate-100 dark:bg-slate-950 dark:border-white/5">
        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.4em]">
          HybridNode Framework &copy; 2026 • v1.0.0 • Software Intelligence
        </p>
      </footer>
    </div>
  );
};

export default Home;
