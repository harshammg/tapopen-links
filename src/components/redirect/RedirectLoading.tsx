import React from "react";
import { motion } from "framer-motion";
import { Zap } from "lucide-react";
import { PlatformConfig } from "@/types";

interface RedirectLoadingProps {
  platform: string | null;
  detectedPlatform?: PlatformConfig | null;
}

const RedirectLoading: React.FC<RedirectLoadingProps> = ({ platform, detectedPlatform }) => {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 text-center relative overflow-hidden font-display">
      {/* Cinematic Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(var(--primary),0.05),transparent_70%)]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[140px] -z-10" />
      
      {/* Subtle Grid Pattern */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-md w-full flex flex-col items-center"
      >
        {/* Hero Handshake Module */}
        <div className="mb-20 relative">
          <div className="w-40 h-40 bg-slate-900/50 backdrop-blur-3xl border border-white/10 rounded-[48px] flex items-center justify-center relative z-10 overflow-hidden shadow-[0_0_80px_rgba(var(--primary),0.2)] group">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-primary/10 animate-pulse" />
            
            {/* Precision Scanning Beam */}
            <motion.div 
              className="absolute top-0 left-0 w-full h-[30%] bg-gradient-to-b from-primary/40 via-primary/10 to-transparent z-20 pointer-events-none"
              animate={{ top: ["-30%", "100%", "-30%"] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />

            {detectedPlatform ? (
              <detectedPlatform.icon className="h-16 w-16 text-primary relative z-30 drop-shadow-[0_0_15px_rgba(var(--primary),0.6)]" />
            ) : (
              <Zap className="h-16 w-16 text-primary relative z-30 drop-shadow-[0_0_15px_rgba(var(--primary),0.6)]" />
            )}
          </div>
          
          {/* Animated Glow Halos */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-56 h-56 bg-primary/10 rounded-[64px] blur-3xl animate-pulse -z-20" />
          <motion.div 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border border-primary/20 rounded-[60px] -z-10"
            animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 3, repeat: Infinity }}
          />
        </div>
        
        {/* High-End Loading Indicator */}
        <div className="w-full max-w-[300px] space-y-6">
          <div className="relative">
            <div className="w-full h-[2px] bg-slate-900 rounded-full overflow-hidden border border-white/5">
              <motion.div 
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 2, ease: [0.65, 0, 0.35, 1] }}
                className="h-full bg-gradient-to-r from-primary/40 via-primary to-primary/40 w-full origin-left shadow-[0_0_20px_rgba(var(--primary),0.7)]" 
              />
            </div>
          </div>
          
          <div className="flex justify-between items-center px-2">
            <div className="flex items-center gap-2">
              <div className="w-1 h-1 bg-primary rounded-full animate-ping" />
              <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-primary/80">Connecting</span>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-slate-500">Secure Protocol</span>
          </div>
        </div>
      </motion.div>

      {/* Footer Branding */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-white/[0.03] backdrop-blur-2xl px-6 py-2.5 rounded-full border border-white/5 shadow-2xl">
        <Zap className="h-3.5 w-3.5 text-primary" />
        <div className="h-3 w-[1px] bg-white/10" />
        <p className="text-[10px] font-bold uppercase tracking-[0.5em] text-slate-400">TapOpen Engine</p>
      </div>
    </div>
  );
};

export default RedirectLoading;
