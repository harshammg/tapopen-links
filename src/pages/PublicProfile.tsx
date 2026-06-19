import React, { useEffect, useState } from "react";
import { useParams, Navigate, useLocation, useSearchParams } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { 
  Loader2, ArrowRight, ExternalLink, Briefcase, BookOpen, 
  Layout, Globe, Calendar, Clock, Mail, MapPin, Code2, GraduationCap, Save, QrCode, Copy, Share, Search
} from "lucide-react";
import { format } from "date-fns";
import { QRCodeSVG } from "qrcode.react";
import ReactMarkdown from "react-markdown";

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
  const [searchParams] = useSearchParams();
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
  const [linkSearch, setLinkSearch] = useState("");

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

        // 2. Fetch Links by user_id (exclude quick-generated links)
        const { data: linkData } = await supabase
          .from("links")
          .select("*")
          .eq("user_id", profileData.id)
          .or("is_quick.is.null,is_quick.eq.false")
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

  useEffect(() => {
    const blogId = searchParams.get("blog");
    if (blogId && blogs.length > 0) {
      const blog = blogs.find(b => b.id === blogId);
      if (blog && !selectedBlog) {
        setSelectedBlog(blog);
        setActivePage("blogs");
      }
    }
  }, [searchParams, blogs]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
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

  const getAutoTextColor = (hexColor: string) => {
    if (!hexColor || !hexColor.startsWith('#')) return 'white';
    let r = 0, g = 0, b = 0;
    if (hexColor.length === 4) {
      r = parseInt(hexColor[1] + hexColor[1], 16);
      g = parseInt(hexColor[2] + hexColor[2], 16);
      b = parseInt(hexColor[3] + hexColor[3], 16);
    } else if (hexColor.length === 7) {
      r = parseInt(hexColor.slice(1, 3), 16);
      g = parseInt(hexColor.slice(3, 5), 16);
      b = parseInt(hexColor.slice(5, 7), 16);
    } else {
      return 'white';
    }
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? 'black' : 'white';
  };

  const getButtonStyle = (): React.CSSProperties => {
    const isAutoText = !buttonTextColor || buttonTextColor === "auto";
    const customTxt = isAutoText ? getAutoTextColor(buttonColor) : buttonTextColor;
    return {
      borderRadius: "9999px", // Standard Pill Shape
      backgroundColor: buttonColor,
      color: customTxt,
      transition: "all 0.2s",
    };
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
    <div className="min-h-screen w-full relative flex justify-center text-current" style={{ ...bgStyle, ...textColorStyle }}>
      {background.type === "image" && background.overlay && <div style={overlayStyle} />}
      
      {/* Desktop / Mobile Centered Container */}
      <div className="relative w-full max-w-md min-h-screen bg-transparent p-6 flex flex-col items-center space-y-6 pt-16 pb-24 transition-all duration-500">
        
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
                  { id: "links", label: "Link Page", icon: Globe, desc: "All my important links & socials" },
                  { id: "portfolio", label: "Portfolio", icon: Briefcase, desc: "My professional journey & projects" },
                  { id: "blogs", label: "Blogs", icon: BookOpen, desc: "Read my latest articles & thoughts" }
                ]
                .filter(item => profile?.customization?.sections_visibility?.[item.id] !== false)
                .map((item) => (
                  <button 
                    key={item.id}
                    onClick={() => setActivePage(item.id as any)}
                    style={{ backgroundColor: buttonColor, color: getAutoTextColor(buttonColor) }}
                    className="group relative w-full p-6 rounded-[24px] border border-black/10 shadow-lg text-left hover:brightness-110 active:scale-[0.98] transition-all overflow-hidden"
                  >
                    <div className="flex items-center gap-4 relative z-10">
                      <div>
                        <h3 className="text-lg font-bold leading-tight">{item.label}</h3>
                        <p className="text-xs opacity-70">{item.desc}</p>
                      </div>
                      <ArrowRight className="ml-auto w-5 h-5 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
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
                      className="group relative flex flex-col items-center justify-center p-8 rounded-[2.5rem] bg-current text-white shadow-2xl shadow-current/30 hover:scale-[1.02] transition-all overflow-hidden text-center"
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
                    className="flex gap-4 p-4 rounded-2xl bg-current/5 border border-current/10 backdrop-blur-sm cursor-pointer hover:bg-current/10 transition-colors"
                  >
                    {blogs[0].image_url && (
                      <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-current/10">
                        <img src={blogs[0].image_url} alt={blogs[0].title} className="w-full h-full object-cover" />
                      </div>
                    )}
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
                <div className="flex w-full p-0.5 bg-current/5 rounded-lg border border-current/5 mb-2 shrink-0">
                  <button 
                    onClick={() => { setPreviewTab("links"); setLinkSearch(""); }} 
                    style={previewTab === "links" ? { backgroundColor: textColorStyle.color, color: getAutoTextColor(textColorStyle.color as string) } : {}}
                    className={`flex-1 py-1.5 text-[9px] font-black uppercase tracking-wider rounded-md transition-all text-center ${previewTab === "links" ? "shadow-sm" : "opacity-50"}`}
                  >My Links</button>
                  <button 
                    onClick={() => { setPreviewTab("store"); setLinkSearch(""); }} 
                    style={previewTab === "store" ? { backgroundColor: textColorStyle.color, color: getAutoTextColor(textColorStyle.color as string) } : {}}
                    className={`flex-1 py-1.5 text-[9px] font-black uppercase tracking-wider rounded-md transition-all text-center ${previewTab === "store" ? "shadow-sm" : "opacity-50"}`}
                  >My Store</button>
                </div>
              )}

              {/* Search bar below toggle */}
              <div className="relative mb-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 opacity-40" style={textColorStyle} />
                <input
                  type="text"
                  value={linkSearch}
                  onChange={e => setLinkSearch(e.target.value)}
                  placeholder={previewTab === "store" ? "Search store..." : "Search links..."}
                  className="w-full h-8 pl-8 pr-3 rounded-xl bg-current/10 border border-current/10 text-[11px] font-medium backdrop-blur-sm focus:outline-none focus:ring-1 focus:ring-current/20 transition-all"
                  style={{ color: textColorStyle.color }}
                />
              </div>

              <div className={`${isStoreView ? "grid grid-cols-2 gap-4" : "flex flex-col space-y-4"}`}>
                {visibleLinks
                  .filter(l => !linkSearch || l.title.toLowerCase().includes(linkSearch.toLowerCase()))
                  .map((l) => {
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
            <div className="animate-in slide-in-from-bottom-6 duration-700">
              <button onClick={() => setActivePage("home")} className="text-[10px] font-black uppercase tracking-widest opacity-40 hover:opacity-100 flex items-center gap-2 mb-4" style={textColorStyle}>
                <ArrowRight className="w-3 h-3 rotate-180" /> Back to Hub
              </button>
              
              {/* Main Outer Translucent Container */}
              <div className="bg-current/5 border border-current/10 backdrop-blur-xl rounded-[2.5rem] p-4 md:p-6 space-y-4 shadow-2xl">
                
                {/* Nested Box 1: Contact & Quick Stats */}
                {(profile.customization?.portfolio?.contact_email || profile.customization?.portfolio?.location || profile.customization?.portfolio?.website || profile.customization?.portfolio?.resume_url || profile.customization?.portfolio?.linkedin_url || profile.customization?.portfolio?.summary) && (
                <div className="bg-current/5 border border-current/10 rounded-3xl p-6 space-y-5 hover:bg-current/10 transition-colors">
                  <div className="flex flex-wrap gap-4">
                    {profile.customization?.portfolio?.contact_email && (
                      <a href={`mailto:${profile.customization.portfolio.contact_email}`} className="flex items-center gap-2 text-xs font-bold opacity-70 hover:opacity-100 transition-opacity" style={textColorStyle}>
                        <Mail className="w-4 h-4" /> Email Me
                      </a>
                    )}
                    {profile.customization?.portfolio?.location && (
                      <div className="flex items-center gap-2 text-xs font-bold opacity-70" style={textColorStyle}>
                        <MapPin className="w-4 h-4" /> {profile.customization.portfolio.location}
                      </div>
                    )}
                    {profile.customization?.portfolio?.website && (
                      <a href={profile.customization.portfolio.website.startsWith('http') ? profile.customization.portfolio.website : `https://${profile.customization.portfolio.website}`} target="_blank" className="flex items-center gap-2 text-xs font-bold opacity-70 hover:opacity-100 transition-opacity" style={textColorStyle}>
                        <Globe className="w-4 h-4" /> Website
                      </a>
                    )}
                  </div>
                  
                  {(profile.customization?.portfolio?.resume_url || profile.customization?.portfolio?.linkedin_url) && (
                  <div className="flex flex-wrap gap-3 pt-1">
                    {profile.customization?.portfolio?.resume_url && (
                    <Button 
                      className="flex-1 h-10 rounded-2xl font-bold hover:opacity-90 shadow-xl text-xs"
                      style={{ backgroundColor: textColorStyle.color, color: getAutoTextColor(textColorStyle.color as string) }}
                      onClick={() => window.open(profile.customization!.portfolio.resume_url, '_blank')}
                    >
                      <Save className="w-3.5 h-3.5 mr-2" /> Download Resume
                    </Button>
                    )}
                    {profile.customization?.portfolio?.linkedin_url && (
                    <Button 
                      className="flex-1 h-10 rounded-2xl font-bold hover:opacity-90 shadow-xl text-xs"
                      style={{ backgroundColor: textColorStyle.color, color: getAutoTextColor(textColorStyle.color as string) }}
                      onClick={() => window.open(profile.customization!.portfolio.linkedin_url, '_blank')}
                    >
                      <Globe className="w-3.5 h-3.5 mr-2" /> LinkedIn Profile
                    </Button>
                    )}
                  </div>
                  )}

                  {profile.customization?.portfolio?.summary && (
                    <div className="pt-5 border-t border-current/10">
                      <h3 className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-2" style={textColorStyle}>About / Summary</h3>
                      <p className="text-sm leading-relaxed opacity-90" style={textColorStyle}>{profile.customization.portfolio.summary}</p>
                    </div>
                  )}
                </div>
                )}

                {/* Nested Box 2: Experience Section */}
                {portfolio.length > 0 && (
                <div className="bg-current/5 border border-current/10 rounded-3xl overflow-hidden hover:bg-current/10 transition-colors">
                  <div className="p-6 border-b border-current/10 flex items-center gap-3">
                    <Briefcase className="w-4 h-4 opacity-50" style={textColorStyle} />
                    <h3 className="font-bold text-base" style={textColorStyle}>Work Experience</h3>
                  </div>
                  <div className="divide-y divide-current/10">
                    {portfolio.map(item => (
                      <div key={item.id} className="p-6 space-y-4">
                        <div className="flex gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-current/10 overflow-hidden shrink-0 border border-current/10 flex items-center justify-center shadow-sm">
                            {item.image_url ? <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" /> : <Briefcase className="w-5 h-5 opacity-20" style={textColorStyle} />}
                          </div>
                          <div className="flex-1 min-w-0 pt-1">
                            <h4 className="font-bold text-sm md:text-base leading-tight truncate" style={textColorStyle}>{item.title}</h4>
                            <p className="text-[11px] font-medium opacity-60 mt-1" style={textColorStyle}>{item.date_range || "Present"}</p>
                          </div>
                        </div>
                        <p className="text-sm opacity-80 leading-relaxed" style={textColorStyle}>{item.description}</p>
                        {item.tags && item.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {item.tags.map(t => (
                              <span key={t} className="px-2 py-1 bg-current/5 text-[9px] font-bold rounded-lg border border-current/10 opacity-70 shadow-sm">{t}</span>
                            ))}
                          </div>
                        )}
                        {item.project_url && (
                          <a href={item.project_url} target="_blank" className="inline-flex items-center px-4 py-1.5 bg-current/10 hover:bg-current/20 rounded-xl text-[10px] font-black uppercase tracking-widest text-current transition-colors">
                            <ExternalLink className="mr-2 w-3 h-3" /> View Project
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                )}

                {/* Nested Box 3 & 4: Skills & Education Grid */}
                {((profile.customization?.portfolio?.skills && profile.customization.portfolio.skills.length > 0) || 
                  (profile.customization?.portfolio?.education && profile.customization.portfolio.education.length > 0)) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    {profile.customization?.portfolio?.skills && profile.customization.portfolio.skills.length > 0 && (
                      <div className="bg-current/5 border border-current/10 rounded-3xl p-6 hover:bg-current/10 transition-colors">
                        <h3 className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-4 flex items-center gap-2" style={textColorStyle}>
                          <Code2 className="w-3.5 h-3.5" /> Skills & Expertise
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {profile.customization.portfolio.skills.map((skill: string) => (
                            <span 
                              key={skill} 
                              className="px-3 py-1 text-[11px] font-bold rounded-xl shadow-sm hover:scale-105 transition-transform"
                              style={{ 
                                backgroundColor: textColorStyle.color, 
                                color: getAutoTextColor(textColorStyle.color as string) 
                              }}
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {profile.customization?.portfolio?.education && profile.customization.portfolio.education.length > 0 && (
                      <div className="bg-current/5 border border-current/10 rounded-3xl p-6 hover:bg-current/10 transition-colors">
                        <h3 className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-4 flex items-center gap-2" style={textColorStyle}>
                          <GraduationCap className="w-3.5 h-3.5" /> Education
                        </h3>
                        <div className="space-y-5">
                          {(profile.customization.portfolio.education as Education[]).map(edu => (
                            <div key={edu.id} className="relative pl-4 border-l-2 border-current/20">
                              <h4 className="text-[13px] font-bold leading-tight" style={textColorStyle}>{edu.degree}</h4>
                              <p className="text-[11px] opacity-60 mt-1" style={textColorStyle}>{edu.school}</p>
                              <p className="text-[9px] font-bold opacity-30 mt-1" style={textColorStyle}>{edu.year}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
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
                    className="group cursor-pointer bg-current/5 border border-current/10 backdrop-blur-md rounded-[2.5rem] overflow-hidden p-3 hover:bg-current/10 transition-colors flex flex-col"
                  >
                    {post.image_url && (
                      <div className="aspect-video rounded-[2rem] overflow-hidden mb-4 shrink-0">
                        <img src={post.image_url} alt={post.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                      </div>
                    )}
                    <div className="p-5 pt-2 flex-1 flex flex-col">
                      <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest opacity-40 mb-3" style={textColorStyle}>
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {format(new Date(post.created_at), "MMM d")}</span>
                        <span className="w-1 h-1 bg-current rounded-full" />
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> 3 min</span>
                      </div>
                      <h4 className="text-xl font-bold mb-3" style={textColorStyle}>{post.title}</h4>
                      <p className="text-sm opacity-70 leading-relaxed line-clamp-3" style={textColorStyle}>{post.excerpt || post.content.substring(0, 150) + "..."}</p>
                      <button className="mt-auto pt-6 text-xs font-black uppercase tracking-widest underline underline-offset-8 decoration-2 text-left opacity-80 hover:opacity-100 transition-opacity" style={textColorStyle}>Read Full Story</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons Row */}
        <div className="mt-12 flex flex-wrap justify-center gap-2 w-full max-w-[320px] animate-in fade-in slide-in-from-bottom-4 duration-700">
          <button 
            onClick={() => {
              const url = window.location.href;
              navigator.clipboard.writeText(url);
              toast.success("Link copied!");
            }}
            className="flex-1 min-w-[80px] h-11 flex items-center justify-center text-[10px] uppercase tracking-widest font-black bg-current/5 border border-current/10 rounded-2xl shadow-xl hover:bg-current/10 transition-all hover:scale-[1.02] active:scale-[0.98]"
            style={textColorStyle}
          >
            <Copy className="w-3.5 h-3.5 mr-1.5" /> Copy
          </button>
          <button 
            onClick={() => {
              const url = window.location.href;
              if (navigator.share) {
                navigator.share({ title: profile?.full_name || profile?.handle, url }).catch(() => {});
              } else {
                navigator.clipboard.writeText(url);
                toast.success("Link copied!");
              }
            }}
            className="flex-1 min-w-[80px] h-11 flex items-center justify-center text-[10px] uppercase tracking-widest font-black bg-current/5 border border-current/10 rounded-2xl shadow-xl hover:bg-current/10 transition-all hover:scale-[1.02] active:scale-[0.98]"
            style={textColorStyle}
          >
            <Share className="w-3.5 h-3.5 mr-1.5" /> Share
          </button>
          <button 
            onClick={() => setIsScannerOpen(true)}
            style={getButtonStyle()}
            className="flex-1 min-w-[80px] h-11 flex items-center justify-center text-[10px] uppercase tracking-widest font-black shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <QrCode className="w-3.5 h-3.5 mr-1.5" /> Scan
          </button>
        </div>

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

          {/* QR Code Footer */}
          {profile?.customization?.sections_visibility?.qr !== false && (
            <div id="qr-section" className="mt-8 pt-8 pb-12 flex flex-col items-center border-t border-current/10 w-full max-w-sm">
              <QRCodeSVG 
                value={window.location.href}
                size={160}
                level="H"
                includeMargin={false}
                bgColor="transparent"
                fgColor={textColorStyle.color as string || "#000000"}
              />
              <div className="mt-8 flex items-center gap-2" style={textColorStyle}>
                <QrCode className="w-5 h-5" />
                <span className="text-xs font-black uppercase tracking-[0.3em]">Scan to view & share</span>
              </div>
            </div>
          )}

        {/* Branding Footer */}
        <div className="pt-8 pb-16">
          <a href="/" className="text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-3" style={textColorStyle}>
            <div className={`w-6 h-1 bg-current opacity-20 rounded-full`} />
            Powered by TapOpen
          </a>
        </div>
        
      </div>

      {/* Blog Popup Modal */}
      {selectedBlog && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
          <div 
            className="border border-white/20 rounded-[2.5rem] w-full max-w-md max-h-[85vh] flex flex-col shadow-2xl animate-in zoom-in-95 duration-300 relative overflow-hidden"
            style={{ 
              backgroundColor: profile?.customization?.background?.value || '#1a1a1a',
              backgroundImage: profile?.customization?.background?.type === "image" ? `url(${profile.customization.background.value})` : undefined,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            {/* Inner overlay for readability if using image background */}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-xl z-0" />

            {/* Header */}
            <div className="relative z-10 flex justify-between items-center p-6 border-b border-white/10 shrink-0 bg-white/5">
              <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest opacity-60" style={textColorStyle}>
                <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {format(new Date(selectedBlog.created_at), "MMMM d, yyyy")}</span>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    const url = `${window.location.origin}/${slug}?blog=${selectedBlog.id}`;
                    if (navigator.share) {
                      navigator.share({ title: selectedBlog.title, url }).catch(() => {});
                    } else {
                      navigator.clipboard.writeText(url);
                      toast.success("Blog link copied!");
                    }
                  }}
                  className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors backdrop-blur-md"
                >
                  <Share className="w-4 h-4" style={textColorStyle} />
                </button>
                <button 
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    setSelectedBlog(null); 
                    // Optional: remove blog from URL
                    if (searchParams.has("blog")) {
                      window.history.pushState({}, '', `/${slug}`);
                    }
                  }}
                  className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors backdrop-blur-md"
                >
                  <span className="text-sm font-bold" style={textColorStyle}>✕</span>
                </button>
              </div>
            </div>
            
            {/* Content (Scrollable) */}
            <div className="relative z-10 overflow-y-auto p-6 md:p-10 hide-scrollbar bg-white/5">
              {selectedBlog.image_url && (
                <img src={selectedBlog.image_url} alt={selectedBlog.title} className="w-full h-48 md:h-72 object-cover rounded-[2rem] mb-8 shadow-xl border border-white/10" />
              )}
              <h2 className="text-2xl md:text-4xl font-black mb-8 leading-tight tracking-tight" style={textColorStyle}>{selectedBlog.title}</h2>
              <div className="prose prose-invert max-w-none" style={{ ...textColorStyle, opacity: 0.9 }}>
                <ReactMarkdown
                  components={{
                    a: ({ node, ...props }) => <a {...props} target="_blank" rel="noopener noreferrer" className="text-white underline hover:opacity-80 decoration-white/50 underline-offset-4" />
                  }}
                >
                  {selectedBlog.content}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default PublicProfile;
