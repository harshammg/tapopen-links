import React, { useEffect, useState } from "react";
import { useParams, Navigate, useLocation } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { 
  Loader2, ArrowRight, ExternalLink, Briefcase, BookOpen, 
  Layout, Globe, Calendar, Clock, Mail, MapPin, Code2, GraduationCap, Save, QrCode
} from "lucide-react";
import { format } from "date-fns";
import { QRCodeSVG } from "qrcode.react";

interface ProfileCustomization {
  background: { type: "color" | "image"; value: string; overlay?: boolean; opacity?: number };
  buttonStyle: "filled" | "outline" | "soft" | "ghost" | "pill";
  buttonColor: string;
  buttonTextColor: "white" | "black" | "auto";
  cornerRadius: number;
  profileTextColor: "light" | "dark";
  defaultPage?: string;
}

interface Link {
  id: string;
  title: string;
  url: string;
  originalUrl?: string;
  type: "regular" | "affiliate" | "header";
  category: "links" | "store";
  active: boolean;
  deepLink?: boolean;
  is_pinned?: boolean;
}

interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  image_url: string;
  project_url: string;
  tags?: string[];
  date_range?: string;
}

interface Education {
  id: string;
  school: string;
  degree: string;
  year: string;
}

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  image_url: string;
  created_at: string;
}

import { QRScannerModal } from "@/components/dashboard/QRScannerModal";

const PublicProfile = () => {
  const { slug } = useParams<{ slug: string }>();
  const location = useLocation();
  const subPath = location.pathname.split('/').filter(Boolean)[1] || ""; // Get part after /username/
  
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [links, setLinks] = useState<Link[]>([]);
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [previewTab, setPreviewTab] = useState<"links" | "store">(
    subPath === "store" ? "store" : "links"
  );
  const [activePage, setActivePage] = useState<"home" | "links" | "portfolio" | "blogs">("home");
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  useEffect(() => {
    if (profile?.customization?.defaultPage && !subPath) {
      const page = profile.customization.defaultPage;
      setActivePage(page === "all" ? "home" : page as any);
    } else {
      const page = (subPath === "links" || subPath === "link") ? "links" : 
                   subPath === "portfolio" ? "portfolio" : 
                   subPath === "blogs" ? "blogs" : 
                   !subPath ? "home" : "links";
      setActivePage(page);
    }
  }, [subPath, profile]);

  useEffect(() => {
    const fetchData = async () => {
      if (!slug) return;
      
      try {
        // 1. Fetch Profile by handle
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("handle", slug)
          .single();
          
        if (profileError || !profileData) {
          setProfile(null);
          return;
        }

        setProfile(profileData);

        // 2. Fetch Links by user_id
        const { data: linkData } = await supabase
          .from("links")
          .select("*")
          .eq("user_id", profileData.id)
          .order("sort_order", { ascending: true });

        if (linkData) {
          const mappedLinks: Link[] = linkData.map(l => ({
            id: l.id || l.slug,
            title: l.title || l.original_url || "",
            url: l.slug ? `${window.location.origin}/${l.slug}` : l.original_url,
            originalUrl: l.original_url,
            type: (l.type as any) || "regular",
            category: (l.category as any) || "links",
            active: l.active !== false,
            deepLink: !!l.deep_link,
            is_pinned: !!l.is_pinned,
          }));
          
          setLinks(mappedLinks);
          
          // 3. Fetch Portfolio
          const { data: portData } = await supabase
            .from("portfolio_items")
            .select("*")
            .eq("user_id", profileData.id)
            .order("created_at", { ascending: false });
          if (portData) setPortfolio(portData);

          // 4. Fetch Blogs
          const { data: blogData } = await supabase
            .from("blog_posts")
            .select("*")
            .eq("user_id", profileData.id)
            .order("created_at", { ascending: false });
          if (blogData) setBlogs(blogData);

          // Auto-select tab if only one is available
          const hasLinks = mappedLinks.some(l => l.active && (!l.category || l.category === "links"));
          const hasStore = mappedLinks.some(l => l.active && l.category === "store");
          if (!hasLinks && hasStore) setPreviewTab("store");
        }
      } catch (error) {
        console.error("Error fetching public profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [slug]);

  const [selectedBlog, setSelectedBlog] = useState<BlogPost | null>(null);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (selectedBlog) {
    return (
      <div className="min-h-screen w-full relative flex justify-center py-20 px-6" style={bgStyle}>
        <div className="max-w-2xl w-full space-y-8 animate-in slide-in-from-bottom-8 duration-700">
          <button onClick={() => setSelectedBlog(null)} className="flex items-center gap-2 text-xs font-black uppercase tracking-widest opacity-50 hover:opacity-100 mb-8" style={textColorStyle}>
            <ArrowRight className="w-4 h-4 rotate-180" /> Back to Articles
          </button>
          
          {selectedBlog.image_url && (
            <div className="aspect-[2/1] rounded-[2.5rem] overflow-hidden shadow-2xl">
              <img src={selectedBlog.image_url} alt={selectedBlog.title} className="w-full h-full object-cover" />
            </div>
          )}
          
          <div className="space-y-6">
            <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-widest opacity-40 text-white">
              <span>{format(new Date(selectedBlog.created_at), "MMMM d, yyyy")}</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold leading-tight" style={textColorStyle}>{selectedBlog.title}</h1>
            <div className="prose prose-invert max-w-none text-lg leading-relaxed opacity-90 whitespace-pre-line" style={textColorStyle}>
              {selectedBlog.content}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    // If not found, it might be a short link, so RedirectHandler should handle it.
    // However, if we reached here from RedirectHandler falling back, it means not found.
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 text-center">
        <h1 className="text-2xl font-bold mb-2">Page Not Found</h1>
        <p className="text-muted-foreground mb-6">This profile or link does not exist.</p>
        <a href="/" className="px-6 py-2 bg-primary text-primary-foreground rounded-full font-bold">Create your own TapOpen</a>
      </div>
    );
  }

  const customization: ProfileCustomization = profile.customization || {
    background: { type: "color", value: "#ffffff" },
    buttonStyle: "filled",
    buttonColor: "#1d4ed8",
    buttonTextColor: "auto",
    cornerRadius: 8,
    profileTextColor: "dark",
  };

  const { background, buttonStyle, buttonColor, buttonTextColor, cornerRadius, profileTextColor } = customization;

  const bgStyle: React.CSSProperties = background.type === "color"
    ? { backgroundColor: background.value }
    : { backgroundImage: `url(${background.value})`, backgroundSize: "cover", backgroundPosition: "center", backgroundAttachment: "fixed" };

  const overlayStyle: React.CSSProperties =
    background.type === "image" && background.overlay
      ? {
          backgroundColor: "rgba(0,0,0," + (background.opacity ?? 0.5) + ")",
          inset: 0,
          position: "absolute",
        }
      : {};

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
        return { ...base, border: `1px solid ${buttonColor}`, color: buttonColor };
      case "soft":
        return { ...base, backgroundColor: `${buttonColor}33`, color: buttonColor };
      case "ghost":
        return { ...base, backgroundColor: "transparent", color: buttonColor };
      default:
        return base;
    }
  };

  const textColorStyle: React.CSSProperties = { color: profileTextColor && profileTextColor.startsWith('#') ? profileTextColor : (profileTextColor === "light" ? "#ffffff" : "#000000") };
  
  const getInitials = (name: string) => {
    return name ? name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) : "U";
  };

  const visibleLinks = links.filter((l) => l.active);
  const hasRegular = visibleLinks.some(l => l.type === "regular");
  const hasAffiliate = visibleLinks.some(l => l.type === "affiliate");
  const isStoreView = (hasRegular && previewTab === "store") || (!hasRegular && hasAffiliate);

  return (
    <div className="min-h-screen w-full relative flex justify-center" style={bgStyle}>
      {background.type === "image" && background.overlay && <div style={overlayStyle} />}
      
      {/* Desktop / Mobile Centered Container */}
      <div className={`relative w-full ${activePage === 'portfolio' || activePage === 'blogs' ? 'max-w-4xl' : 'max-w-md'} min-h-screen bg-transparent p-6 flex flex-col items-center space-y-6 pt-16 pb-24 transition-all duration-500`}>
        
        {/* Profile Info */}

        <div className={`w-full p-8 rounded-3xl border-2 border-primary/20 bg-primary/5 backdrop-blur-md shadow-lg text-center space-y-3`}>
          <h1 className="text-2xl font-bold tracking-tight" style={textColorStyle}>{profile.full_name || `@${profile.handle}`}</h1>
          {profile.bio && <p className="text-base opacity-90" style={textColorStyle}>{profile.bio}</p>}
        </div>
        
        {/* Conditional Content Rendering */}
        <div className="w-full space-y-8">
          {activePage === "home" && (
            <div className="space-y-10 animate-in fade-in duration-700">
              
              {/* Hub Navigation Cards */}
              <div className="grid grid-cols-1 gap-4">
                {[
                  { id: "links", label: "Link Page", icon: Globe, desc: "All my important links & socials", color: "from-blue-600/20 to-blue-400/20" },
                  { id: "portfolio", label: "Portfolio", icon: Briefcase, desc: "My professional journey & projects", color: "from-purple-600/20 to-purple-400/20" },
                  { id: "blogs", label: "Blogs", icon: BookOpen, desc: "Read my latest articles & thoughts", color: "from-emerald-600/20 to-emerald-400/20" }
                ]
                .filter(item => profile?.customization?.sections_visibility?.[item.id] !== false)
                .map((item) => (
                  <button 
                    key={item.id}
                    onClick={() => setActivePage(item.id as any)}
                    className={`group relative w-full p-6 rounded-[2rem] bg-gradient-to-br ${item.color} border border-white/10 backdrop-blur-md text-left hover:scale-[1.02] active:scale-[0.98] transition-all overflow-hidden`}
                  >
                    <div className="flex items-center gap-4 relative z-10">
                      <div className="p-3 rounded-2xl bg-white/10 text-white">
                        <item.icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold leading-tight" style={textColorStyle}>{item.label}</h3>
                        <p className="text-xs opacity-60" style={textColorStyle}>{item.desc}</p>
                      </div>
                      <ArrowRight className="ml-auto w-5 h-5 opacity-30 group-hover:opacity-100 group-hover:translate-x-1 transition-all" style={textColorStyle} />
                    </div>
                  </button>
                ))}
              </div>

              {/* Pinned Feature Link */}
              {visibleLinks.find(l => (l as any).is_pinned) && (
                <div className="space-y-4">
                  <h3 className="text-[11px] font-black uppercase tracking-[0.2em] px-2 opacity-70" style={textColorStyle}>Featured Now</h3>
                  {visibleLinks.filter(l => (l as any).is_pinned).slice(0, 1).map(l => (
                    <a 
                      key={l.id} 
                      href={l.url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="group relative flex flex-col items-center justify-center p-8 rounded-[2.5rem] bg-primary text-white shadow-2xl shadow-primary/30 hover:scale-[1.02] transition-all overflow-hidden text-center"
                    >
                      <div className="absolute top-0 right-0 p-4 opacity-20">
                        <Layout className="w-12 h-12" />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-[0.3em] mb-3 opacity-70">Pinned Selection</span>
                      <h4 className="text-xl font-black mb-2">{l.title}</h4>
                      <div className="flex items-center gap-2 text-xs font-bold bg-white/20 px-4 py-2 rounded-full backdrop-blur-sm">
                        Visit Now <ExternalLink className="w-3 h-3" />
                      </div>
                    </a>
                  ))}
                </div>
              )}

              {/* Hub: Latest Blog Preview (Smaller) */}
              {blogs.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between px-2">
                    <h3 className="text-[11px] font-black uppercase tracking-[0.2em] opacity-70" style={textColorStyle}>Latest Read</h3>
                  </div>
                  <div 
                    onClick={() => setSelectedBlog(blogs[0])}
                    className="flex gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm cursor-pointer hover:bg-white/10 transition-colors"
                  >
                    <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-white/10">
                      {blogs[0].image_url && <img src={blogs[0].image_url} alt={blogs[0].title} className="w-full h-full object-cover" />}
                    </div>
                    <div className="flex-1 py-1">
                      <h4 className="text-sm font-bold line-clamp-2 leading-tight mb-2" style={textColorStyle}>{blogs[0].title}</h4>
                      <p className="text-[10px] opacity-50 flex items-center gap-2" style={textColorStyle}>
                        <Clock className="w-3 h-3" /> Read Article
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activePage === "links" && (
            <div className="space-y-6 animate-in fade-in duration-500">
              <button onClick={() => setActivePage("home")} className="text-[10px] font-black uppercase tracking-widest opacity-40 hover:opacity-100 flex items-center gap-2 mb-2" style={textColorStyle}>
                <ArrowRight className="w-3 h-3 rotate-180" /> Back to Hub
              </button>
              
              {links.some(l => l.active && (!l.category || l.category === "links")) && 
               links.some(l => l.active && l.category === "store") && (
                <div className="flex w-full p-0.5 bg-black/5 rounded-lg border border-black/5 mb-2 shrink-0">
                  <button onClick={() => setPreviewTab("links")} className={`flex-1 py-1.5 text-[9px] font-black uppercase tracking-wider rounded-md transition-all text-center ${previewTab === "links" ? "bg-white shadow-sm text-primary" : "text-slate-500"}`}>My Links</button>
                  <button onClick={() => setPreviewTab("store")} className={`flex-1 py-1.5 text-[9px] font-black uppercase tracking-wider rounded-md transition-all text-center ${previewTab === "store" ? "bg-white shadow-sm text-primary" : "text-slate-500"}`}>My Store</button>
                </div>
              )}

              <div className={`${isStoreView ? "grid grid-cols-2 gap-4" : "flex flex-col space-y-4"}`}>
                {visibleLinks.map((l) => {
                  if (l.type === "header") {
                    if ((isStoreView && l.category === "links") || (!isStoreView && l.category === "store")) return null;
                    return (
                      <div key={l.id} className={`${isStoreView ? "col-span-2" : ""} text-center pt-6 pb-2 text-xs font-black uppercase tracking-[0.2em] opacity-70`} style={textColorStyle}>{l.title}</div>
                    );
                  }

                  if (isStoreView && l.category === "store") {
                    return (
                      <a key={l.id} href={l.url} target="_blank" rel="noopener noreferrer" style={{ ...getButtonStyle(), borderRadius: 24, padding: 0, overflow: 'hidden', border: 'none' }} className="relative flex flex-col items-center justify-end aspect-square shadow-sm hover:scale-[1.02] transition-transform group">
                        <img src={`https://api.microlink.io/?url=${encodeURIComponent(l.originalUrl || l.url || "")}&embed=image.url`} alt={l.title} className="absolute inset-0 w-full h-full object-cover z-0 bg-muted" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent z-10" />
                        <span className="relative z-20 text-[13px] font-bold text-white text-center line-clamp-2 leading-tight p-4 w-full">{l.title}</span>
                      </a>
                    );
                  }

                  if (!isStoreView && l.category === "links") {
                    return (
                      <a key={l.id} href={l.url} target="_blank" rel="noopener noreferrer" style={getButtonStyle()} className="flex items-center justify-center py-4 px-6 text-[15px] font-bold shadow-sm hover:scale-[1.02] transition-transform">
                        <span className="truncate w-full text-center">{l.title}</span>
                      </a>
                    );
                  }
                  return null;
                })}
              </div>
            </div>
          )}

          {activePage === "portfolio" && (
            <div className="space-y-8 animate-in slide-in-from-bottom-6 duration-700">
              <button onClick={() => setActivePage("home")} className="text-[10px] font-black uppercase tracking-widest opacity-40 hover:opacity-100 flex items-center gap-2 mb-2" style={textColorStyle}>
                <ArrowRight className="w-3 h-3 rotate-180" /> Back to Hub
              </button>
              
              {/* LinkedIn: Contact & Quick Stats */}
              <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-[2.5rem] p-8 space-y-6">
                <div className="flex flex-wrap gap-4">
                  {profile.contact_email && (
                    <a href={`mailto:${profile.contact_email}`} className="flex items-center gap-2 text-xs font-bold opacity-70 hover:opacity-100 transition-opacity" style={textColorStyle}>
                      <Mail className="w-4 h-4" /> Email Me
                    </a>
                  )}
                  {profile.location && (
                    <div className="flex items-center gap-2 text-xs font-bold opacity-70" style={textColorStyle}>
                      <MapPin className="w-4 h-4" /> {profile.location}
                    </div>
                  )}
                  {profile.website && (
                    <a href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`} target="_blank" className="flex items-center gap-2 text-xs font-bold opacity-70 hover:opacity-100 transition-opacity" style={textColorStyle}>
                      <Globe className="w-4 h-4" /> Website
                    </a>
                  )}
                </div>
                
                {/* Primary Actions */}
                <div className="flex flex-wrap gap-4 pt-2">
                  <Button 
                    className="flex-1 h-12 rounded-2xl font-bold bg-white text-black hover:bg-white/90 shadow-xl"
                    onClick={() => {
                      if (profile.resume_url) window.open(profile.resume_url, '_blank');
                    }}
                  >
                    <Save className="w-4 h-4 mr-2" /> Download Resume
                  </Button>
                  <Button 
                    className="flex-1 h-12 rounded-2xl font-bold bg-white text-black hover:bg-white/90 shadow-xl"
                    onClick={() => {
                      if (profile.linkedin_url) window.open(profile.linkedin_url, '_blank');
                    }}
                  >
                    <Globe className="w-4 h-4 mr-2" /> LinkedIn Profile
                  </Button>
                </div>

                {profile.summary && (
                  <div className="pt-6 border-t border-white/10">
                    <h3 className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-3" style={textColorStyle}>About / Summary</h3>
                    <p className="text-sm leading-relaxed opacity-90" style={textColorStyle}>{profile.summary}</p>
                  </div>
                )}
              </div>

              {/* LinkedIn: Experience Section */}
              <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-[2.5rem] overflow-hidden">
                <div className="p-6 border-b border-white/10 flex items-center gap-3">
                  <Briefcase className="w-5 h-5 opacity-50" style={textColorStyle} />
                  <h3 className="font-bold text-lg" style={textColorStyle}>Work Experience</h3>
                </div>
                <div className="divide-y divide-white/10">
                  {portfolio.length === 0 ? (
                    <p className="p-10 text-center text-xs opacity-40 text-white italic">Experience entries will appear here.</p>
                  ) : (
                    portfolio.map(item => (
                      <div key={item.id} className="p-8 space-y-4">
                        <div className="flex gap-4">
                          <div className="w-14 h-14 rounded-xl bg-white/10 overflow-hidden shrink-0 border border-white/10 flex items-center justify-center">
                            {item.image_url ? <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" /> : <Briefcase className="w-6 h-6 opacity-20" style={textColorStyle} />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-base leading-tight truncate" style={textColorStyle}>{item.title}</h4>
                            <p className="text-xs font-medium opacity-60 mt-1" style={textColorStyle}>{item.date_range || "Present"}</p>
                          </div>
                        </div>
                        <p className="text-sm opacity-80 leading-relaxed" style={textColorStyle}>{item.description}</p>
                        {item.tags && item.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {item.tags.map(t => (
                              <span key={t} className="px-2 py-1 bg-white/5 text-[10px] font-bold rounded-md border border-white/10 text-white/70">{t}</span>
                            ))}
                          </div>
                        )}
                        {item.project_url && (
                          <a href={item.project_url} target="_blank" className="inline-flex items-center px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-[10px] font-black uppercase tracking-widest text-white transition-colors">
                            <ExternalLink className="mr-2 w-3 h-3" /> View Project
                          </a>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* LinkedIn: Skills & Education Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {profile.skills && profile.skills.length > 0 && (
                  <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-[2.5rem] p-8">
                    <h3 className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-6 flex items-center gap-2" style={textColorStyle}>
                      <Code2 className="w-4 h-4" /> Skills & Expertise
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {profile.skills.map(skill => (
                        <span key={skill} className="px-3 py-1.5 bg-white text-black text-xs font-bold rounded-xl border border-white/20 shadow-sm">{skill}</span>
                      ))}
                    </div>
                  </div>
                )}

                {profile.education && profile.education.length > 0 && (
                  <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-[2.5rem] p-8">
                    <h3 className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-6 flex items-center gap-2" style={textColorStyle}>
                      <GraduationCap className="w-4 h-4" /> Education
                    </h3>
                    <div className="space-y-6">
                      {(profile.education as Education[]).map(edu => (
                        <div key={edu.id} className="relative pl-6 border-l-2 border-white/10">
                          <h4 className="text-sm font-bold" style={textColorStyle}>{edu.degree}</h4>
                          <p className="text-xs opacity-60 mt-1" style={textColorStyle}>{edu.school}</p>
                          <p className="text-[10px] font-bold opacity-30 mt-1" style={textColorStyle}>{edu.year}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activePage === "blogs" && (
            <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
              <button onClick={() => setActivePage("home")} className="text-[10px] font-black uppercase tracking-widest opacity-40 hover:opacity-100 flex items-center gap-2 mb-2" style={textColorStyle}>
                <ArrowRight className="w-3 h-3 rotate-180" /> Back to Hub
              </button>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {blogs.map(post => (
                  <div 
                    key={post.id} 
                    onClick={() => setSelectedBlog(post)}
                    className="group cursor-pointer bg-white/5 border border-white/10 backdrop-blur-md rounded-[2.5rem] overflow-hidden p-3 hover:bg-white/10 transition-colors flex flex-col"
                  >
                    {post.image_url && (
                      <div className="aspect-video rounded-[2rem] overflow-hidden mb-4 shrink-0">
                        <img src={post.image_url} alt={post.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                      </div>
                    )}
                    <div className="p-5 pt-2 flex-1 flex flex-col">
                      <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest opacity-40 mb-3 text-white">
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {format(new Date(post.created_at), "MMM d")}</span>
                        <span className="w-1 h-1 bg-white rounded-full" />
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> 3 min</span>
                      </div>
                      <h4 className="text-xl font-bold mb-3" style={textColorStyle}>{post.title}</h4>
                      <p className="text-sm opacity-70 leading-relaxed line-clamp-3" style={textColorStyle}>{post.excerpt || post.content.substring(0, 150) + "..."}</p>
                      <button className="mt-auto pt-6 text-xs font-black uppercase tracking-widest text-white underline underline-offset-8 decoration-primary decoration-2 text-left">Read Full Story</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons Row */}
        <div className="mt-12 flex flex-wrap justify-center gap-3 w-full max-w-[320px] animate-in fade-in slide-in-from-bottom-4 duration-700">
          <button 
            onClick={() => {
              if (navigator.share) {
                navigator.share({ title: profile.full_name, url: window.location.href });
              } else {
                navigator.clipboard.writeText(window.location.href);
                toast.success("Link copied to clipboard!");
              }
            }}
            style={getButtonStyle()}
            className="flex-1 min-w-[120px] h-10 flex items-center justify-center text-xs font-bold shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <ExternalLink className="w-3.5 h-3.5 mr-2" /> Share
          </button>
          {profile?.customization?.sections_visibility?.qr !== false && (
            <button 
              onClick={() => setIsScannerOpen(true)}
              style={getButtonStyle()}
              className="flex-1 min-w-[120px] h-10 flex items-center justify-center text-xs font-bold shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <QrCode className="w-3.5 h-3.5 mr-2" /> Scan
            </button>
          )}
        </div>

          {profile?.customization?.sections_visibility?.qr !== false && (
            <QRScannerModal 
              isOpen={isScannerOpen} 
              onClose={() => setIsScannerOpen(false)}
              onScan={(text) => {
                setIsScannerOpen(false);
                if (text.startsWith("http")) {
                  window.location.href = text;
                } else {
                  toast.info(`Scanned: ${text}`);
                }
              }}
            />
          )}

          {/* QR Code Footer */}
          {profile?.customization?.sections_visibility?.qr !== false && (
            <div id="qr-section" className="mt-4 pt-2 pb-12 flex flex-col items-center border-t border-white/10 w-full max-w-sm">
              <div className="bg-white/70 backdrop-blur-xl p-6 rounded-[3rem] shadow-2xl border border-white/20 opacity-70 transition-all hover:opacity-100">
                <QRCodeSVG 
                  value={window.location.href}
                  size={160}
                  level="H"
                  includeMargin={false}
                />
              </div>
              <div className="mt-8 flex items-center gap-2 opacity-30" style={textColorStyle}>
                <QrCode className="w-5 h-5" />
                <span className="text-xs font-black uppercase tracking-[0.3em]">Scan to view & share</span>
              </div>
            </div>
          )}

        {/* Branding Footer */}
        <div className="pt-8 pb-16 opacity-30 hover:opacity-100 transition-opacity">
          <a href="/" className="text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-3" style={textColorStyle}>
            <div className={`w-6 h-1 bg-current opacity-20 rounded-full`} />
            Powered by TapOpen
          </a>
        </div>
        
      </div>
    </div>
  );
};

export default PublicProfile;
