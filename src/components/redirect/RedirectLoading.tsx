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
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] -z-10" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full"
      >
        <div className="mb-10 relative">
          <div className="w-24 h-24 bg-primary/20 rounded-[32px] flex items-center justify-center mx-auto relative z-10">
            {detectedPlatform ? (
              <detectedPlatform.icon className="h-10 w-10 text-primary animate-pulse" />
            ) : (
              <Zap className="h-10 w-10 text-primary animate-pulse" />
            )}
          </div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-primary/20 rounded-full blur-2xl animate-pulse" />
        </div>

        <h2 className="text-4xl md:text-5xl font-display font-bold mb-4 tracking-tighter gradient-text">
          {platform ? `Opening ${platform}` : "Loading native app"}
        </h2>
        <p className="text-slate-400 text-base md:text-lg font-medium mb-12 opacity-80 max-w-[280px] mx-auto leading-relaxed">
          {platform 
            ? `We're launching ${platform} for a better viewing experience.` 
            : "Bypassing the in-app browser to open your app directly."}
        </p>
        
        <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden relative mb-12">
          <motion.div 
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 2.5, ease: "easeInOut" }}
            className="h-full bg-primary w-full origin-left" 
          />
        </div>
      </motion.div>

      <div className="absolute bottom-10 left-1/2 -translate-x-1/2">
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-600">Powered by TapOpen</p>
      </div>
    </div>
  );
};

export default RedirectLoading;
