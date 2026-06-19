import React from 'react';

export const BackgroundGlow: React.FC = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10 bg-transparent">
      {/* Top Left Blob */}
      <div 
        className="absolute -top-[200px] -left-[200px] w-[600px] h-[600px] bg-purple-500/15 rounded-full blur-[100px]"
      />
      
      {/* Bottom Right Blob */}
      <div 
        className="absolute -bottom-[200px] -right-[200px] w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[100px]"
      />
      
      {/* Center Blob (Subtle) */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-500/5 rounded-full blur-[120px]"
      />
    </div>
  );
};
