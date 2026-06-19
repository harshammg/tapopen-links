import React, { useState, useEffect } from "react";
import PublicProfile from "@/pages/PublicProfile";

interface LivePreviewProps {
  profile: any;
  links?: any[];
  portfolio?: any[];
  blogs?: any[];
  initialSection?: "home" | "links" | "portfolio" | "blogs";
  hideTabs?: boolean;
}

export const LivePreview: React.FC<LivePreviewProps> = ({ 
  profile, 
  links = [], 
  portfolio = [], 
  blogs = [],
  initialSection = "home",
  hideTabs = false
}) => {
  const [previewSection, setPreviewSection] = useState(initialSection);

  useEffect(() => {
    if (initialSection) setPreviewSection(initialSection);
  }, [initialSection]);

  if (!profile) {
    return (
      <div className="w-64 h-[480px] md:w-[288px] md:h-[580px] rounded-[2.5rem] bg-slate-100 border-[8px] border-slate-900 flex items-center justify-center">
        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest animate-pulse">Initializing Preview...</p>
      </div>
    );
  }

  // Dashboard right panel container is w-[320px], inner is w-[288px].
  // Standard mobile canvas is 390x844. 
  // 288 / 390 = 0.7384 scale.
  const scale = 0.7384;
  const targetHeight = 580;
  const scaledInnerHeight = targetHeight / scale; 

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Preview Tab Selector */}
      {!hideTabs && (
        <div className="flex gap-1 p-1 bg-muted rounded-xl border border-border overflow-x-auto max-w-full no-scrollbar">
          {["home", "links", "portfolio", "blogs"].map((tab) => (
            <button
              key={tab}
              onClick={() => setPreviewSection(tab as any)}
              className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${previewSection === tab ? "bg-background text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
            >
              {tab}
            </button>
          ))}
        </div>
      )}

      {/* Scaled Device Frame Container */}
      <div 
        className="relative shadow-2xl overflow-hidden border-[8px] border-slate-900 bg-background"
        style={{ width: "288px", height: `${targetHeight}px`, borderRadius: "2.5rem" }}
      >
        {/* Hardware Frame Elements (Not Scaled) */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-20 h-4 bg-slate-900 rounded-full z-50 pointer-events-none" />
        <div className="absolute -left-2 top-24 w-1 h-12 bg-slate-900 rounded-r-md z-50 pointer-events-none" />
        <div className="absolute -left-2 top-40 w-1 h-12 bg-slate-900 rounded-r-md z-50 pointer-events-none" />
        <div className="absolute -right-2 top-32 w-1 h-16 bg-slate-900 rounded-l-md z-50 pointer-events-none" />

        {/* Scaled Inner Content Window */}
        <div 
          className="absolute top-0 left-0 origin-top-left overflow-y-auto no-scrollbar"
          style={{ 
            width: '390px', 
            height: `${scaledInnerHeight}px`,
            transform: `scale(${scale})`
          }}
          onClickCapture={(e) => {
            // Prevent clicking links from navigating away inside the builder
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          {/* 100% Accurate Public Profile Representation */}
          <PublicProfile 
            previewData={{
              profile,
              links,
              portfolio,
              blogs,
              initialSection: previewSection
            }}
          />
        </div>
      </div>
    </div>
  );
};
