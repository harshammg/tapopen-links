import React, { useState, useEffect } from "react";
import { 
  ChevronRight, Layout, Globe, Briefcase, BookOpen, 
  Mail, MapPin, Calendar, Clock, ShoppingBag, QrCode, Copy, Share, ArrowRight, ExternalLink
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { format } from "date-fns";

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

  const textColorStyle: React.CSSProperties = { 
    color: profileTextColor && profileTextColor.startsWith('#') 
      ? profileTextColor 
      : (profileTextColor === "light" ? "#ffffff" : "#000000") 
  };

  const getButtonStyle = (): React.CSSProperties => {
    const txt = buttonTextColor === "auto" ? "white" : buttonTextColor;
    const base: React.CSSProperties = {
      borderRadius: buttonStyle === "pill" ? "9999px" : `${cornerRadius}px`,
      color: txt,
      transition: "all 0.2s",
    };
    switch (buttonStyle) {
      case "filled":
      case "pill":
        return { ...base, backgroundColor: buttonColor };
      case "outline":
        return { ...base, border: `1px solid ${buttonColor}`, color: buttonColor, backgroundColor: "transparent" };
      case "soft":
        return { ...base, backgroundColor: `${buttonColor}33`, color: buttonColor };
      case "ghost":
        return { ...base, backgroundColor: "transparent", color: buttonColor };
      default:
        return { ...base, backgroundColor: buttonColor };
    }
  };

  if (!profile) {
    return (
      <div className="w-64 h-[480px] md:w-72 md:h-[550px] rounded-[2.5rem] bg-slate-100 border-[8px] border-slate-900 flex items-center justify-center">
        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest animate-pulse">Initializing Preview...</p>
      </div>
    );
  }

  const visibleLinks = links.filter(l => l.active !== false);
  const hasLinks = visibleLinks.some(l => !l.category || l.category === "links");
  const hasStore = visibleLinks.some(l => l.category === "store");
  const isStoreView = (hasLinks && linksTab === "store") || (!hasLinks && hasStore);

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
        <div className="relative p-4 flex flex-col items-center space-y-3 h-full overflow-y-auto pt-10 no-scrollbar pb-8">
          {/* Mock Speaker/Camera */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-20 h-4 bg-slate-900 rounded-full" />
          
          {/* Profile Card */}
          <div className="w-full p-4 rounded-2xl border-2 border-primary/20 bg-primary/5 backdrop-blur-sm text-center space-y-1">
            <h2 className="text-sm font-bold tracking-tight" style={textColorStyle}>{profile.full_name || "Your Name"}</h2>
            <p className="text-[8px] font-black opacity-40 uppercase tracking-widest" style={textColorStyle}>
              @{profile.handle || "username"}
            </p>
            {profile.bio && <p className="text-[9px] opacity-70 pt-0.5 leading-relaxed" style={textColorStyle}>{profile.bio}</p>}
          </div>

          {/* ───────── HOME ───────── */}
          {previewSection === "home" && (
            <div className="w-full space-y-2 animate-in fade-in duration-500">
              {/* Hub Nav Cards */}
              <div className="grid grid-cols-1 gap-2">
                {[
                  { id: "links", label: "Link Page", icon: Globe, desc: "All my important links", color: "from-blue-600/20 to-blue-400/20" },
                  { id: "portfolio", label: "Portfolio", icon: Briefcase, desc: "My professional journey", color: "from-purple-600/20 to-purple-400/20" },
                  { id: "blogs", label: "Blogs", icon: BookOpen, desc: "Read my articles", color: "from-emerald-600/20 to-emerald-400/20" }
                ]
                .filter(item => profile?.customization?.sections_visibility?.[item.id] !== false)
                .map(item => (
                  <div 
                    key={item.id} 
                    onClick={() => setPreviewSection(item.id as any)}
                    className={`w-full p-2.5 rounded-xl bg-gradient-to-br ${item.color} border border-white/10 flex items-center justify-between cursor-pointer hover:bg-white/20 transition-colors`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center">
                        <item.icon className="w-3 h-3 opacity-70" style={textColorStyle} />
                      </div>
                      <div>
                        <span className="text-[9px] font-bold uppercase block" style={textColorStyle}>{item.label}</span>
                        <span className="text-[7px] opacity-40" style={textColorStyle}>{item.desc}</span>
                      </div>
                    </div>
                    <ChevronRight className="w-3 h-3 opacity-30" style={textColorStyle} />
                  </div>
                ))}
              </div>

              {/* Pinned Link (Hub preview) */}
              {visibleLinks.filter(l => l.is_pinned).slice(0, 1).map(l => (
                <div key={l.id} className="w-full p-3 rounded-2xl bg-gradient-to-br from-primary/30 to-primary/10 border border-primary/20 text-center">
                  <span className="text-[7px] font-black uppercase tracking-widest opacity-50 block mb-1" style={textColorStyle}>Pinned</span>
                  <span className="text-[10px] font-bold" style={textColorStyle}>{l.title}</span>
                </div>
              ))}

              {/* Latest Blog (Hub preview) */}
              {blogs.length > 0 && (
                <div className="w-full flex gap-2 p-2 rounded-xl bg-white/5 border border-white/10">
                  {blogs[0].image_url && (
                    <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0">
                      <img src={blogs[0].image_url} alt="" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0 py-0.5">
                    <span className="text-[8px] font-black uppercase tracking-widest opacity-40 block" style={textColorStyle}>Latest Read</span>
                    <span className="text-[9px] font-bold line-clamp-2 leading-tight" style={textColorStyle}>{blogs[0].title}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ───────── LINKS ───────── */}
          {previewSection === "links" && (
            <div className="w-full space-y-2 animate-in fade-in duration-500">
              {/* Back button */}
              <button onClick={() => setPreviewSection("home")} className="text-[8px] font-black uppercase tracking-widest opacity-40 flex items-center gap-1 mb-1" style={textColorStyle}>
                <ArrowRight className="w-2.5 h-2.5 rotate-180" /> Back
              </button>

              {/* Links/Store Toggle */}
              {hasLinks && hasStore && (
                <div className="w-full flex p-0.5 bg-black/10 rounded-lg border border-white/10 shrink-0">
                  <button 
                    onClick={() => setLinksTab("links")}
                    className={`flex-1 py-1 text-[7px] font-black uppercase tracking-widest rounded-md transition-all ${linksTab === "links" ? "bg-white text-black shadow-sm" : "text-white/60"}`}
                  >My Links</button>
                  <button 
                    onClick={() => setLinksTab("store")}
                    className={`flex-1 py-1 text-[7px] font-black uppercase tracking-widest rounded-md transition-all ${linksTab === "store" ? "bg-white text-black shadow-sm" : "text-white/60"}`}
                  >My Store</button>
                </div>
              )}

              {/* Link items */}
              {isStoreView ? (
                <div className="grid grid-cols-2 gap-2">
                  {visibleLinks.filter(l => l.category === "store").slice(0, 4).map(l => (
                    <div key={l.id} className="aspect-square bg-white/10 rounded-xl flex flex-col items-center justify-end p-2 relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent z-10" />
                      <span className="relative z-20 text-[7px] font-bold text-white text-center line-clamp-2">{l.title}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-1.5">
                  {visibleLinks.filter(l => !l.category || l.category === "links").slice(0, 8).map(l => {
                    if (l.type === "header") return (
                      <div key={l.id} className="text-center py-1.5 text-[7px] font-black uppercase tracking-widest opacity-40" style={textColorStyle}>{l.title}</div>
                    );
                    return (
                      <div key={l.id} style={getButtonStyle()} className="flex items-center justify-center py-2 px-3 text-[9px] font-bold shadow-sm">
                        <span className="truncate w-full text-center">{l.title}</span>
                      </div>
                    );
                  })}
                </div>
              )}
              {visibleLinks.length === 0 && (
                <p className="text-[8px] text-center opacity-40 py-4" style={textColorStyle}>No links yet.</p>
              )}
            </div>
          )}

          {/* ───────── PORTFOLIO ───────── */}
          {previewSection === "portfolio" && (
            <div className="w-full space-y-2 animate-in fade-in duration-500">
              <button onClick={() => setPreviewSection("home")} className="text-[8px] font-black uppercase tracking-widest opacity-40 flex items-center gap-1 mb-1" style={textColorStyle}>
                <ArrowRight className="w-2.5 h-2.5 rotate-180" /> Back
              </button>
              {/* Contact info */}
              <div className="w-full p-2.5 rounded-xl bg-white/5 border border-white/10 space-y-1.5">
                {profile.customization?.portfolio?.contact_email && (
                  <div className="flex items-center gap-1.5 text-[8px] opacity-60" style={textColorStyle}>
                    <Mail className="w-2.5 h-2.5" /> {profile.customization.portfolio.contact_email}
                  </div>
                )}
                {profile.customization?.portfolio?.location && (
                  <div className="flex items-center gap-1.5 text-[8px] opacity-60" style={textColorStyle}>
                    <MapPin className="w-2.5 h-2.5" /> {profile.customization.portfolio.location}
                  </div>
                )}
              </div>
              {portfolio.slice(0, 2).map(item => (
                <div key={item.id} className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex gap-2">
                  {item.image_url ? (
                    <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0">
                      <img src={item.image_url} alt="" className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-lg bg-white/10 shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-[9px] font-bold truncate" style={textColorStyle}>{item.title}</h4>
                    <p className="text-[7px] opacity-40 line-clamp-1" style={textColorStyle}>{item.date_range || item.description}</p>
                  </div>
                </div>
              ))}
              {portfolio.length === 0 && <p className="text-[8px] text-center opacity-40 py-4" style={textColorStyle}>No portfolio items yet.</p>}
            </div>
          )}

          {/* ───────── BLOGS ───────── */}
          {previewSection === "blogs" && (
            <div className="w-full space-y-3 animate-in fade-in duration-500">
              <button onClick={() => setPreviewSection("home")} className="text-[8px] font-black uppercase tracking-widest opacity-40 flex items-center gap-1 mb-1" style={textColorStyle}>
                <ArrowRight className="w-2.5 h-2.5 rotate-180" /> Back
              </button>
              {blogs.slice(0, 2).map(post => (
                <div key={post.id} className="rounded-2xl overflow-hidden bg-white/5 border border-white/10 flex flex-col">
                  {post.image_url && (
                    <div className="aspect-video overflow-hidden">
                      <img src={post.image_url} alt="" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="p-2.5 flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-[7px] opacity-40" style={textColorStyle}>
                      <span className="flex items-center gap-0.5"><Calendar className="w-2 h-2" /> {format(new Date(post.created_at), "MMM d")}</span>
                      <span className="flex items-center gap-0.5"><Clock className="w-2 h-2" /> 3 min</span>
                    </div>
                    <h4 className="text-[9px] font-bold line-clamp-2 leading-tight" style={textColorStyle}>{post.title}</h4>
                    <p className="text-[7px] opacity-60 line-clamp-2 leading-relaxed" style={textColorStyle}>{post.excerpt || post.content?.substring(0, 80)}</p>
                    <span className="text-[7px] font-black uppercase tracking-widest underline underline-offset-2 opacity-70 mt-1" style={textColorStyle}>Read Full Story</span>
                  </div>
                </div>
              ))}
              {blogs.length === 0 && <p className="text-[8px] text-center opacity-40 py-4" style={textColorStyle}>No blog posts yet.</p>}
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-4 flex flex-wrap justify-center gap-1.5 w-full">
            <button className="flex-1 min-w-[60px] h-8 flex items-center justify-center text-[7px] uppercase tracking-widest font-black bg-white/5 border border-white/10 rounded-xl transition-all" style={textColorStyle}>
              <Copy className="w-2.5 h-2.5 mr-1" /> Copy
            </button>
            <button className="flex-1 min-w-[60px] h-8 flex items-center justify-center text-[7px] uppercase tracking-widest font-black bg-white/5 border border-white/10 rounded-xl transition-all" style={textColorStyle}>
              <Share className="w-2.5 h-2.5 mr-1" /> Share
            </button>
            {profile?.customization?.sections_visibility?.qr !== false && (
              <button className="flex-1 min-w-[60px] h-8 flex items-center justify-center text-[7px] uppercase tracking-widest font-black rounded-xl transition-all" style={{ ...getButtonStyle(), minHeight: '2rem' }}>
                <QrCode className="w-2.5 h-2.5 mr-1" /> Scan
              </button>
            )}
          </div>

          {/* QR Code Footer */}
          {profile?.customization?.sections_visibility?.qr !== false && (
            <div className="w-full pt-4 pb-6 flex flex-col items-center border-t border-white/5">
              <div className="bg-white/70 backdrop-blur-md p-3 rounded-2xl shadow-lg border border-white/10 opacity-70">
                <QRCodeSVG 
                  value={`${window.location.origin}/${profile.handle || ""}`}
                  size={80}
                  level="H"
                  includeMargin={false}
                />
              </div>
              <div className="mt-3 flex items-center gap-1 opacity-30" style={textColorStyle}>
                <QrCode className="w-2.5 h-2.5" />
                <span className="text-[7px] font-black uppercase tracking-widest">Scan to view & share</span>
              </div>
              <p className="mt-6 text-[7px] font-black uppercase tracking-widest opacity-10" style={textColorStyle}>Powered by TapOpen</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
