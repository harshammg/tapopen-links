import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { 
  ChevronRight, Layout, Globe, Briefcase, BookOpen, 
  Mail, MapPin, Code2, GraduationCap, Save, Calendar, Clock, ShoppingBag, ExternalLink, QrCode
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

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
  const [previewSection, setPreviewSection] = useState<"home" | "links" | "portfolio" | "blogs">(initialSection);
  const [linksTab, setLinksTab] = useState<"links" | "store">("links");

  useEffect(() => {
    if (initialSection) setPreviewSection(initialSection);
  }, [initialSection]);

  // Robustly handle missing customization data
  const customization = profile?.customization || {};
  const { 
    background = { type: "color", value: "#ffffff" }, 
    buttonStyle = "filled", 
    buttonColor = "#1d4ed8", 
    buttonTextColor = "auto", 
    cornerRadius = 8, 
    profileTextColor = "dark" 
  } = customization;

  const bgStyle: React.CSSProperties = background.type === "color"
    ? { backgroundColor: background.value || "#ffffff" }
    : { backgroundImage: `url(${background.value})`, backgroundSize: "cover", backgroundPosition: "center" };

  // Calculate text color style with safe fallbacks
  const textColorStyle: React.CSSProperties = { 
    color: profileTextColor && profileTextColor.startsWith('#') 
      ? profileTextColor 
      : (profileTextColor === "light" ? "#ffffff" : "#000000") 
  };

  const getButtonStyle = (): React.CSSProperties => {
    const txt = buttonTextColor === "auto" ? "white" : buttonTextColor;
    return {
      borderRadius: buttonStyle === "pill" ? "9999px" : `${cornerRadius}px`,
      backgroundColor: buttonStyle === "outline" ? "transparent" : buttonColor,
      color: buttonStyle === "outline" ? buttonColor : txt,
      border: buttonStyle === "outline" ? `1px solid ${buttonColor}` : "none",
      transition: "all 0.2s",
    };
  };

  if (!profile) {
    return (
      <div className="w-64 h-[480px] md:w-72 md:h-[550px] rounded-[2.5rem] bg-slate-100 border-[8px] border-slate-900 flex items-center justify-center">
        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest animate-pulse">Initializing Preview...</p>
      </div>
    );
  }

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

      <div className="relative w-64 h-[480px] md:w-72 md:h-[550px] rounded-[2.5rem] shadow-2xl overflow-hidden border-[8px] border-slate-900 bg-slate-50" style={bgStyle}>
        <div className="relative p-6 flex flex-col items-center space-y-4 h-full overflow-y-auto pt-12 no-scrollbar">
          {/* Mock Speaker/Camera */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-20 h-4 bg-slate-900 rounded-full" />
          
          <div className={`w-full p-6 rounded-2xl border-2 border-primary/20 bg-primary/5 backdrop-blur-sm text-center space-y-1`}>
            <h2 className="text-sm font-bold tracking-tight" style={textColorStyle}>{profile.full_name || "Your Name"}</h2>
            <p className="text-[9px] font-black opacity-40 uppercase tracking-widest" style={textColorStyle}>
              @{profile.handle || profile.slug || "username"}
            </p>
            <p className="text-[10px] opacity-70 pt-1" style={textColorStyle}>{profile.bio || "Crafting something amazing..."}</p>
          </div>

          {/* Links/Store Toggle inside Mockup */}
          {previewSection === "links" && 
           links.some(l => l.active && (!l.category || l.category === "links")) && 
           links.some(l => l.active && l.category === "store") && (
            <div className="w-full flex p-1 bg-black/10 backdrop-blur-md rounded-xl border border-white/10 shrink-0">
              <button 
                onClick={() => setLinksTab("links")}
                className={`flex-1 py-1.5 text-[8px] font-black uppercase tracking-widest rounded-lg transition-all ${linksTab === "links" ? "bg-white text-black shadow-sm" : "text-white/60"}`}
              >
                Links
              </button>
              <button 
                onClick={() => setLinksTab("store")}
                className={`flex-1 py-1.5 text-[8px] font-black uppercase tracking-widest rounded-lg transition-all ${linksTab === "store" ? "bg-white text-black shadow-sm" : "text-white/60"}`}
              >
                Store
              </button>
            </div>
          )}
          
          <div className="w-full space-y-4">
            {previewSection === "home" && (
              <div className="space-y-4 animate-in fade-in duration-500">
                <div className="grid grid-cols-1 gap-2">
                  {[
                    { id: "links", label: "Link Page", icon: Globe },
                    { id: "portfolio", label: "Portfolio", icon: Briefcase },
                    { id: "blogs", label: "Blogs", icon: BookOpen }
                  ]
                  .filter(item => profile?.customization?.sections_visibility?.[item.id] !== false)
                  .map(item => (
                    <div 
                      key={item.id} 
                      onClick={() => setPreviewSection(item.id as any)}
                      className="p-3 rounded-xl bg-white/10 border border-white/5 flex items-center justify-between cursor-pointer hover:bg-white/20 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <item.icon className="w-3 h-3 opacity-50" style={textColorStyle} />
                        <div>
                          <span className="text-[10px] font-bold uppercase block" style={textColorStyle}>{item.label}</span>
                          {item.id === "links" && (
                            <span className="text-[8px] opacity-40 lowercase" style={textColorStyle}>
                              tapopen.me/{profile.handle || profile.slug || "username"}
                            </span>
                          )}
                        </div>
                      </div>
                      <ChevronRight className="w-3 h-3 opacity-30" style={textColorStyle} />
                    </div>
                  ))}
                </div>

              </div>
            )}

            {previewSection === "links" && (
              <div className="space-y-2 animate-in fade-in duration-500">
                {linksTab === "links" ? (
                  links.filter(l => l.active && (!l.category || l.category === "links")).slice(0, 10).map((l) => {
                    if (l.type === "header") {
                      return (
                        <div key={l.id} className="w-full text-center py-2 text-[8px] font-black uppercase tracking-[0.2em] opacity-40" style={textColorStyle}>
                          {l.title}
                        </div>
                      );
                    }
                    return (
                      <div key={l.id} style={getButtonStyle()} className="flex items-center justify-center py-2.5 px-4 text-[10px] font-bold shadow-sm">
                        <span className="truncate w-full text-center">{l.title}</span>
                      </div>
                    );
                  })
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {links.filter(l => l.active && l.category === "store").slice(0, 4).map((l) => (
                      <div key={l.id} className="aspect-square bg-white/10 rounded-xl flex flex-col items-center justify-center p-2 text-center space-y-1">
                        <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                          <ShoppingBag className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-[8px] font-bold text-white line-clamp-2">{l.title}</span>
                      </div>
                    ))}
                  </div>
                )}
                {links.filter(l => l.active && (linksTab === "links" ? (!l.category || l.category === "links") : l.category === "store")).length === 0 && (
                  <p className="text-[8px] text-center opacity-40 py-4" style={textColorStyle}>No items found in this section.</p>
                )}
              </div>
            )}

            {previewSection === "portfolio" && (
              <div className="space-y-3 animate-in fade-in duration-500">
                <div className="flex gap-2 mb-2">
                  <div className="flex-1 h-8 rounded-lg bg-white text-black flex items-center justify-center text-[8px] font-bold shadow-md">Resume</div>
                  <div className="flex-1 h-8 rounded-lg bg-white/10 border border-white/20 text-white flex items-center justify-center text-[8px] font-bold">LinkedIn</div>
                </div>
                {portfolio.slice(0, 2).map(item => (
                  <div key={item.id} className="p-3 rounded-xl bg-white/5 border border-white/10 flex gap-3">
                    <div className="w-8 h-8 rounded bg-white/10 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-[10px] font-bold truncate" style={textColorStyle}>{item.title}</h4>
                      <p className="text-[8px] opacity-40 line-clamp-1" style={textColorStyle}>{item.date_range}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {previewSection === "blogs" && (
              <div className="space-y-4 animate-in fade-in duration-500">
                {blogs.slice(0, 2).map(post => (
                  <div key={post.id} className="rounded-xl overflow-hidden bg-white/5 border border-white/10 p-1">
                    <div className="aspect-video bg-white/10 rounded-lg mb-2" />
                    <div className="p-1">
                      <h4 className="text-[10px] font-bold mb-0.5 line-clamp-1" style={textColorStyle}>{post.title}</h4>
                      <p className="text-[8px] opacity-40 line-clamp-2" style={textColorStyle}>{post.excerpt || post.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Mobile Preview Action Buttons */}
          <div className="mt-6 flex flex-wrap justify-center gap-2 w-full px-4">
            <div 
              style={getButtonStyle()}
              className="flex-1 min-w-[60px] h-8 flex items-center justify-center text-[7px] font-bold shadow-sm"
            >
              <ExternalLink className="w-2.5 h-2.5 mr-1" /> Share
            </div>
            {profile?.customization?.sections_visibility?.qr !== false && (
              <div 
                onClick={() => setIsScannerOpen(true)}
                style={getButtonStyle()}
                className="flex-1 min-w-[60px] h-8 flex items-center justify-center text-[7px] font-bold shadow-sm cursor-pointer"
              >
                <QrCode className="w-2.5 h-2.5 mr-1" /> Scan
              </div>
            )}
          </div>

          {/* Global Footer QR Code */}
          {profile?.customization?.sections_visibility?.qr !== false && (
            <div id="preview-qr-section" className="w-full pt-6 pb-12 flex flex-col items-center border-t border-white/5">
              <div className="bg-white/70 backdrop-blur-md p-4 rounded-3xl shadow-lg border border-white/10 opacity-70">
                <QRCodeSVG 
                  value={`${window.location.origin}/${profile.handle || ""}`}
                  size={100}
                  level="H"
                  includeMargin={false}
                />
              </div>
              <div className="mt-4 flex items-center gap-1.5 opacity-30" style={textColorStyle}>
                <QrCode className="w-3 h-3" />
                <span className="text-[8px] font-black uppercase tracking-widest">Scan to view & share</span>
              </div>
              <p className="mt-12 text-[7px] font-black uppercase tracking-widest opacity-10" style={textColorStyle}>Powered by TapOpen</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
