import React from "react";

export const DiamondLoader = ({ text = "Loading...", fullScreen = false }) => {
  const content = (
    <div className="flex flex-col items-center gap-6 animate-in fade-in zoom-in duration-500">
      {/* Premium TapOpen Logo / Loader */}
      <div className="relative flex items-center justify-center w-16 h-16">
        <div className="absolute inset-0 border-[3px] border-[#E5E7EB] rounded-2xl rotate-45"></div>
        <div className="absolute inset-0 border-[3px] border-[#111827] rounded-2xl border-t-transparent border-r-transparent animate-spin"></div>
        <div className="w-3 h-3 bg-[#111827] rounded-sm rotate-45 animate-pulse"></div>
      </div>
      
      {/* Brand Text */}
      <div className="flex flex-col items-center gap-2">
        {text && <span className="text-sm font-extrabold tracking-widest uppercase text-[#111827]">{text}</span>}
        <div className="flex items-center gap-1.5 mt-1">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: '0ms' }}></span>
          <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: '150ms' }}></span>
          <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: '300ms' }}></span>
        </div>
      </div>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-[60vh] flex flex-1 items-center justify-center">
        {content}
      </div>
    );
  }

  return content;
};
