import React from "react";
import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ManualOpenPromptProps {
  url: string;
}

const ManualOpenPrompt: React.FC<ManualOpenPromptProps> = ({ url }) => {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] -z-10" />
      
      <div className="max-w-md w-full animate-in fade-in zoom-in duration-700">
        <div className="w-20 h-20 bg-primary/10 border border-primary/20 rounded-[28px] flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-primary/20">
          <ExternalLink className="h-10 w-10 text-primary" />
        </div>
        
        <h2 className="text-3xl md:text-4xl font-display font-bold mb-4 text-white tracking-tight">Almost there!</h2>
        
        <div className="space-y-3 mb-10">
          <p className="text-slate-300 font-medium">In-app browsers sometimes limit automatic redirects to keep you inside their app.</p>
          <p className="text-slate-500 text-sm">Please use the manual backup below to open the destination in your preferred browser.</p>
        </div>

        <div className="mt-10 pt-8 border-t border-white/5">
          <p className="text-[10px] uppercase tracking-[0.2em] text-slate-600 font-black mb-3">
            Manual Backup
          </p>
          <div className="bg-slate-900/50 border border-white/5 rounded-xl p-3 flex items-center gap-3">
            <p className="text-[11px] text-slate-400 font-mono truncate flex-1 text-left">
              {url}
            </p>
            <button 
              onClick={() => {
                navigator.clipboard.writeText(url);
              }}
              className="text-[10px] font-bold text-primary hover:text-white transition-colors"
            >
              COPY
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManualOpenPrompt;
