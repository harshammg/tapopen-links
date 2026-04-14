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
        <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <ExternalLink className="h-8 w-8 text-primary" />
        </div>
        <h2 className="text-3xl font-display font-bold mb-3 text-white">One More Step</h2>
        <p className="text-slate-400 mb-2">Instagram is blocking the automatic redirect.</p>
        <p className="text-slate-500 text-sm mb-10">Tap the button below to open the link in your browser, which will launch the app.</p>
        
        <a href={url} target="_blank" rel="noopener noreferrer" className="block">
          <Button className="w-full h-14 text-base font-bold rounded-2xl" variant="gradient">
            Open Link in Browser <ExternalLink className="ml-2 h-4 w-4" />
          </Button>
        </a>
        <p className="mt-6 text-[10px] uppercase tracking-widest text-slate-600 font-bold">
          Or copy this link manually: {window.location.href}
        </p>
      </div>
    </div>
  );
};

export default ManualOpenPrompt;
