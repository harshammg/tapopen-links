import React, { useEffect, useState } from "react";
import { useParams, useLocation, useSearchParams } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import {
  Loader2, ArrowLeft, ExternalLink, Briefcase, BookOpen,
  Globe, Calendar, Clock, Mail, MapPin, Code2, GraduationCap,
  Save, QrCode, Copy, Share, Search, ArrowRight, Zap
} from "lucide-react";
import { format } from "date-fns";
import { QRCodeSVG } from "qrcode.react";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";
import { Helmet } from "react-helmet-async";
import { isAndroid, toAndroidIntent } from "@/lib/deepLinkUtils";

/* ── Types ────────────────────────────────────────────── */
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

interface PublicProfileProps {
  previewData?: {
    profile: any;
    links: any[];
    portfolio: any[];
    blogs: any[];
    initialSection?: "home" | "links" | "portfolio" | "blogs";
  };
}

/* ── Component ────────────────────────────────────────── */
const PublicProfile: React.FC<PublicProfileProps> = ({ previewData }) => {
  const { slug } = useParams<{ slug: string }>();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const subPath = location.pathname.split("/").filter(Boolean)[1] || "";

  const [loading, setLoading] = useState(!previewData);
  const [profile, setProfile] = useState<any>(previewData?.profile || null);
  const [links, setLinks] = useState<Link[]>(previewData?.links || []);
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>(previewData?.portfolio || []);
  const [blogs, setBlogs] = useState<BlogPost[]>(previewData?.blogs || []);
  const [previewTab, setPreviewTab] = useState<"links" | "store">(
    subPath === "store" ? "store" : "links"
  );
  const [activePage, setActivePage] = useState<"home" | "links" | "portfolio" | "blogs">("home");
  const [linkSearch, setLinkSearch] = useState("");
  const [selectedBlog, setSelectedBlog] = useState<BlogPost | null>(null);

  /* ── Sync previewData ─── */
  useEffect(() => {
    if (previewData?.initialSection) setActivePage(previewData.initialSection);
  }, [previewData?.initialSection]);

  useEffect(() => {
    if (previewData) {
      setProfile(previewData.profile);
      setLinks(previewData.links);
      setPortfolio(previewData.portfolio);
      setBlogs(previewData.blogs);
      setLoading(false);
    }
  }, [previewData]);

  /* ── Fetch from Supabase ─── */
  useEffect(() => {
    if (previewData) return;
    const fetchData = async () => {
      if (!slug) return;
      try {
        const { data: profileData, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("handle", slug)
          .single();

        if (error || !profileData) { setProfile(null); setLoading(false); return; }
        setProfile(profileData);

        const [linkRes, portRes, blogRes] = await Promise.all([
          supabase
            .from("links")
            .select("*")
            .eq("user_id", profileData.id)
            .or("is_quick.is.null,is_quick.eq.false")
            .order("sort_order", { ascending: true }),
          supabase
            .from("portfolio_items")
            .select("*")
            .eq("user_id", profileData.id)
            .order("created_at", { ascending: false }),
          supabase
            .from("blog_posts")
            .select("*")
            .eq("user_id", profileData.id)
            .order("created_at", { ascending: false })
        ]);

        if (linkRes.data) {
          const mapped: Link[] = linkRes.data.map(l => ({
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
          setLinks(mapped);
          const hasStore = mapped.some(l => l.active && l.category === "store");
          const hasLinks = mapped.some(l => l.active && (!l.category || l.category === "links"));
          if (!hasLinks && hasStore) setPreviewTab("store");
        }

        if (portRes.data) setPortfolio(portRes.data);
        if (blogRes.data) setBlogs(blogRes.data);
      } catch (err) {
        console.error("PublicProfile fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [slug]);

  /* ── Blog deep-link via ?blog=id ─── */
  useEffect(() => {
    const blogId = searchParams.get("blog");
    if (blogId && blogs.length > 0) {
      const found = blogs.find(b => b.id === blogId);
      if (found && !selectedBlog) { setSelectedBlog(found); setActivePage("blogs"); }
    }
  }, [searchParams, blogs]);

  /* ── Active page from URL subpath ─── */
  useEffect(() => {
    const page =
      subPath === "links" || subPath === "link" ? "links"
      : subPath === "portfolio" ? "portfolio"
      : subPath === "blogs" ? "blogs"
      : "home";
      
    const visibility = profile?.customization?.sections_visibility || {};
    const sections = ["links", "portfolio", "blogs"];
    const visibleSections = sections.filter(s => visibility[s] !== false);
    
    // If navigating directly to a hidden page, redirect to home menu
    if (page !== "home" && visibility[page] === false) {
      setActivePage("home");
    } else if (page === "home" && visibleSections.length === 1) {
      // If landing on home but only one section is visible, skip straight to it
      setActivePage(visibleSections[0] as any);
    } else {
      setActivePage(page);
    }
  }, [subPath, profile?.customization?.sections_visibility]);

  /* ── Loading ─── */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="flex flex-col items-center gap-8">
          <div className="relative flex items-center justify-center w-20 h-20">
            <div className="absolute inset-0 border-[3px] border-[#E5E7EB] rounded-2xl rotate-45"></div>
            <div className="absolute inset-0 border-[3px] border-[#111827] rounded-2xl border-t-transparent border-r-transparent animate-spin"></div>
            <div className="w-4 h-4 bg-[#111827] rounded-sm rotate-45 animate-pulse"></div>
          </div>
          <div className="flex flex-col items-center gap-2">
            <span className="text-xl font-extrabold tracking-tight text-[#111827]">TapOpen</span>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: '0ms' }}></span>
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: '150ms' }}></span>
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: '300ms' }}></span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ── Not found ─── */
  if (!profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white p-6 text-center text-[#111827]">
        <div className="w-14 h-14 rounded-2xl bg-[#F8FAFC] border border-[#E5E7EB] flex items-center justify-center mb-5">
          <Zap className="w-6 h-6 text-[#9CA3AF]" />
        </div>
        <h1 className="text-xl font-extrabold mb-2">Profile not found</h1>
        <p className="text-sm text-[#6B7280] mb-6">This handle doesn't exist or the link may have changed.</p>
        <a href="/" className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-[#111827] text-white text-xs font-bold rounded-full hover:bg-black/90 transition-colors">
          Create your own TapOpen
        </a>
      </div>
    );
  }

  const initials = profile.full_name
    ? profile.full_name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : (profile.handle || "U")[0].toUpperCase();

  const visibleLinks = links.filter(l => l.active);
  const hasRegular = visibleLinks.some(l => !l.category || l.category === "links");
  const hasStore = visibleLinks.some(l => l.category === "store");
  const isStoreView = previewTab === "store" && hasStore;

  const copyUrl = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied!");
  };

  const shareUrl = () => {
    if (navigator.share) {
      navigator.share({ title: profile.full_name || profile.handle, url: window.location.href }).catch(() => {});
    } else {
      copyUrl();
    }
  };

  /* ─────────────────────────────────────────────────────
     RENDER — default light theme
  ───────────────────────────────────────────────────── */
  const profileName = profile.full_name || `@${profile.handle}`;
  const profileTitle = `${profileName} | TapOpen`;
  const profileDesc = profile.bio || `Check out ${profileName}'s links, portfolio, and blogs on TapOpen.`;

  return (
    <div className="min-h-screen w-full bg-[#F8FAFC] font-inter text-[#111827]">
      <Helmet>
        <title>{profileTitle}</title>
        <meta name="description" content={profileDesc} />
      </Helmet>

      {/* ── Centered narrow container ── */}
      <div className="mx-auto max-w-md min-h-screen flex flex-col pb-20">

        {/* ── Profile header card ── */}
        <div className="bg-white border-b border-[#E5E7EB] px-6 pt-12 pb-8 text-center">
          <h1 className="text-xl font-extrabold tracking-tight text-[#111827]">
            {profile.full_name || `@${profile.handle}`}
          </h1>
          {profile.handle && (
            <p className="text-[11px] text-[#9CA3AF] font-semibold mt-0.5">@{profile.handle}</p>
          )}
          {profile.bio && (
            <p className="text-sm text-[#6B7280] mt-3 leading-relaxed max-w-xs mx-auto">
              {profile.bio}
            </p>
          )}

          {/* Quick action row */}
          <div className="mt-5 flex items-center justify-center gap-2">
            <button
              onClick={copyUrl}
              className="flex items-center gap-1.5 h-8 px-3 rounded-full border border-[#E5E7EB] text-[10px] font-bold text-[#6B7280] hover:bg-[#F8FAFC] hover:text-[#111827] transition-all"
            >
              <Copy className="w-3 h-3" /> Copy link
            </button>
            <button
              onClick={shareUrl}
              className="flex items-center gap-1.5 h-8 px-3 rounded-full border border-[#E5E7EB] text-[10px] font-bold text-[#6B7280] hover:bg-[#F8FAFC] hover:text-[#111827] transition-all"
            >
              <Share className="w-3 h-3" /> Share
            </button>
          </div>
        </div>

        {/* ── Section nav tabs ── */}
        {activePage !== "home" && (
          <div className="px-6 pt-4 pb-0">
            {["links", "portfolio", "blogs"].filter(s => profile?.customization?.sections_visibility?.[s] !== false).length > 1 && (
              <button
                onClick={() => setActivePage("home")}
                className="flex items-center gap-1.5 text-[11px] font-bold text-[#6B7280] hover:text-[#111827] transition-colors mb-4"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back
              </button>
            )}
          </div>
        )}

        {/* ── HOME ── */}
        {activePage === "home" && (
          <div className="px-6 pt-6 space-y-3">
            {[
              { id: "links", label: "Links", icon: Globe, desc: "All my links & socials" },
              { id: "portfolio", label: "Portfolio", icon: Briefcase, desc: "Projects & experience" },
              { id: "blogs", label: "Blog", icon: BookOpen, desc: "Articles & thoughts" },
            ]
              .filter(item => profile?.customization?.sections_visibility?.[item.id] !== false)
              .map(item => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActivePage(item.id as any)}
                    className="group w-full flex items-center gap-4 p-4 bg-white border border-[#E5E7EB] rounded-2xl hover:border-[#111827] hover:shadow-sm transition-all text-left"
                  >
                    <div className="w-10 h-10 rounded-xl bg-[#F8FAFC] border border-[#E5E7EB] flex items-center justify-center shrink-0 group-hover:bg-[#111827] group-hover:border-[#111827] transition-all">
                      <Icon className="w-4 h-4 text-[#6B7280] group-hover:text-white transition-colors" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold text-[#111827]">{item.label}</div>
                      <div className="text-[10px] text-[#9CA3AF] font-medium">{item.desc}</div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[#9CA3AF] group-hover:text-[#111827] group-hover:translate-x-0.5 transition-all shrink-0" />
                  </button>
                );
              })}

            {/* Latest blog preview */}
            {blogs.length > 0 && profile?.customization?.sections_visibility?.blogs !== false && (
              <div className="pt-2">
                <div className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest mb-3">Latest Post</div>
                <button
                  onClick={() => { setSelectedBlog(blogs[0]); setActivePage("blogs"); }}
                  className="w-full flex gap-3 p-4 bg-white border border-[#E5E7EB] rounded-2xl hover:border-[#111827] transition-all text-left"
                >
                  {blogs[0].image_url && (
                    <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-[#F8FAFC]">
                      <img src={blogs[0].image_url} alt={blogs[0].title} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-[#111827] line-clamp-2 leading-tight">{blogs[0].title}</p>
                    <p className="text-[10px] text-[#9CA3AF] mt-1 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Read article
                    </p>
                  </div>
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── LINKS ── */}
        {activePage === "links" && (
          <div className="px-6 pt-2 pb-6 space-y-4">
            {/* Links / Store tab toggle */}
            {hasRegular && hasStore && (
              <div className="flex p-0.5 bg-[#F3F4F6] rounded-xl border border-[#E5E7EB]">
                <button
                  onClick={() => { setPreviewTab("links"); setLinkSearch(""); }}
                  className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg transition-all ${previewTab === "links" ? "bg-white shadow-sm text-[#111827]" : "text-[#9CA3AF]"}`}
                >
                  Links
                </button>
                <button
                  onClick={() => { setPreviewTab("store"); setLinkSearch(""); }}
                  className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg transition-all ${previewTab === "store" ? "bg-white shadow-sm text-[#111827]" : "text-[#9CA3AF]"}`}
                >
                  Store
                </button>
              </div>
            )}

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#9CA3AF]" />
              <input
                type="text"
                value={linkSearch}
                onChange={e => setLinkSearch(e.target.value)}
                placeholder={isStoreView ? "Search store..." : "Search links..."}
                className="w-full h-9 pl-9 pr-3 rounded-xl bg-white border border-[#E5E7EB] text-[11px] font-medium text-[#111827] focus:outline-none focus:border-[#111827] transition-all placeholder:text-[#9CA3AF]"
              />
            </div>

            {/* Link cards */}
            <div className={isStoreView ? "grid grid-cols-2 gap-3" : "flex flex-col gap-3"}>
              {visibleLinks
                .filter(l => !linkSearch || l.title.toLowerCase().includes(linkSearch.toLowerCase()))
                .map(l => {
                  if (l.type === "header") {
                    const crossCategory = isStoreView ? l.category === "links" : l.category === "store";
                    if (crossCategory) return null;
                    return (
                      <div key={l.id} className={`${isStoreView ? "col-span-2" : ""} text-center py-2 text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest`}>
                        {l.title}
                      </div>
                    );
                  }

                  if (isStoreView && l.category === "store") {
                    return (
                      <a
                        key={l.id}
                        href={l.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="relative flex flex-col items-center justify-end aspect-square rounded-2xl overflow-hidden border border-[#E5E7EB] shadow-sm hover:shadow-md transition-all group"
                      >
                        <img
                          src={`https://api.microlink.io/?url=${encodeURIComponent(l.originalUrl || l.url || "")}&embed=image.url`}
                          alt={l.title}
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                        <span className="relative text-[12px] font-bold text-white text-center p-3 w-full line-clamp-2 leading-tight">
                          {l.title}
                        </span>
                      </a>
                    );
                  }

                  if (!isStoreView && l.category === "links") {
                    return (
                      <a
                        key={l.id}
                        href={l.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 py-3.5 px-5 bg-white border border-[#E5E7EB] rounded-2xl text-sm font-bold text-[#111827] hover:border-[#111827] hover:shadow-sm transition-all"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-[#9CA3AF] shrink-0" />
                        <span className="truncate">{l.title}</span>
                      </a>
                    );
                  }
                  return null;
                })}
            </div>
          </div>
        )}

        {/* ── PORTFOLIO ── */}
        {activePage === "portfolio" && (
          <div className="px-6 pt-2 pb-6 space-y-4">
            {/* Contact info */}
            {(profile.customization?.portfolio?.contact_email ||
              profile.customization?.portfolio?.location ||
              profile.customization?.portfolio?.website) && (
              <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 space-y-4">
                <div className="flex flex-wrap gap-3">
                  {profile.customization?.portfolio?.contact_email && (
                    <a href={`mailto:${profile.customization.portfolio.contact_email}`} className="flex items-center gap-1.5 text-xs font-semibold text-[#6B7280] hover:text-[#111827] transition-colors">
                      <Mail className="w-3.5 h-3.5" /> Email
                    </a>
                  )}
                  {profile.customization?.portfolio?.location && (
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-[#6B7280]">
                      <MapPin className="w-3.5 h-3.5" /> {profile.customization.portfolio.location}
                    </span>
                  )}
                  {profile.customization?.portfolio?.website && (
                    <a href={profile.customization.portfolio.website.startsWith("http") ? profile.customization.portfolio.website : `https://${profile.customization.portfolio.website}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs font-semibold text-[#6B7280] hover:text-[#111827] transition-colors">
                      <Globe className="w-3.5 h-3.5" /> Website
                    </a>
                  )}
                </div>

                {(profile.customization?.portfolio?.resume_url || profile.customization?.portfolio?.linkedin_url) && (
                  <div className="flex gap-2">
                    {profile.customization?.portfolio?.resume_url && (
                      <button onClick={() => window.open(profile.customization.portfolio.resume_url, "_blank")} className="flex-1 flex items-center justify-center gap-1.5 h-9 bg-[#111827] text-white text-[10px] font-bold rounded-full hover:bg-black/90 transition-colors">
                        <Save className="w-3 h-3" /> Resume
                      </button>
                    )}
                    {profile.customization?.portfolio?.linkedin_url && (
                      <button onClick={() => window.open(profile.customization.portfolio.linkedin_url, "_blank")} className="flex-1 flex items-center justify-center gap-1.5 h-9 border border-[#E5E7EB] text-[#111827] text-[10px] font-bold rounded-full hover:bg-[#F8FAFC] transition-colors">
                        <Globe className="w-3 h-3" /> LinkedIn
                      </button>
                    )}
                  </div>
                )}

                {profile.customization?.portfolio?.summary && (
                  <div className="pt-3 border-t border-[#E5E7EB]">
                    <div className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest mb-2">About</div>
                    <p className="text-sm text-[#6B7280] leading-relaxed">{profile.customization.portfolio.summary}</p>
                  </div>
                )}
              </div>
            )}

            {/* Experience */}
            {portfolio.length > 0 && (
              <div className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden">
                <div className="px-5 py-4 border-b border-[#E5E7EB] flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-[#6B7280]" />
                  <span className="text-sm font-bold text-[#111827]">Experience</span>
                </div>
                <div className="divide-y divide-[#E5E7EB]">
                  {portfolio.map(item => (
                    <div key={item.id} className="p-5 space-y-3">
                      <div className="flex gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#F8FAFC] border border-[#E5E7EB] overflow-hidden shrink-0 flex items-center justify-center">
                          {item.image_url
                            ? <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
                            : <Briefcase className="w-4 h-4 text-[#9CA3AF]" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-bold text-[#111827] truncate">{item.title}</div>
                          <div className="text-[10px] text-[#9CA3AF] font-semibold mt-0.5">{item.date_range || "Present"}</div>
                        </div>
                      </div>
                      <p className="text-[11px] text-[#6B7280] leading-relaxed">{item.description}</p>
                      {item.tags && item.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {item.tags.map(t => (
                            <span key={t} className="px-2 py-0.5 bg-[#F8FAFC] border border-[#E5E7EB] text-[9px] font-bold text-[#6B7280] rounded-full">{t}</span>
                          ))}
                        </div>
                      )}
                      {item.project_url && (
                        <a href={item.project_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-[10px] font-bold text-[#111827] hover:underline">
                          <ExternalLink className="w-3 h-3" /> View project
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Skills & Education */}
            {((profile.customization?.portfolio?.skills?.length > 0) ||
              (profile.customization?.portfolio?.education?.length > 0)) && (
              <div className="grid grid-cols-1 gap-4">
                {profile.customization?.portfolio?.skills?.length > 0 && (
                  <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5">
                    <div className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest mb-3 flex items-center gap-1.5">
                      <Code2 className="w-3.5 h-3.5" /> Skills
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {profile.customization.portfolio.skills.map((skill: string) => (
                        <span key={skill} className="px-3 py-1 bg-[#111827] text-white text-[10px] font-bold rounded-full">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {profile.customization?.portfolio?.education?.length > 0 && (
                  <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5">
                    <div className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest mb-3 flex items-center gap-1.5">
                      <GraduationCap className="w-3.5 h-3.5" /> Education
                    </div>
                    <div className="space-y-4">
                      {(profile.customization.portfolio.education as Education[]).map(edu => (
                        <div key={edu.id} className="pl-3 border-l-2 border-[#E5E7EB]">
                          <div className="text-sm font-bold text-[#111827]">{edu.degree}</div>
                          <div className="text-[11px] text-[#6B7280] mt-0.5">{edu.school}</div>
                          <div className="text-[10px] text-[#9CA3AF] mt-0.5">{edu.year}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── BLOGS ── */}
        {activePage === "blogs" && (
          <div className="px-6 pt-2 pb-6 space-y-3">
            {blogs.map(post => (
              <button
                key={post.id}
                onClick={() => setSelectedBlog(post)}
                className="w-full bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden hover:border-[#111827] transition-all text-left group"
              >
                {post.image_url && (
                  <div className="aspect-video overflow-hidden">
                    <img src={post.image_url} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                )}
                <div className="p-4">
                  <div className="flex items-center gap-2 text-[10px] text-[#9CA3AF] font-semibold mb-2">
                    <Calendar className="w-3 h-3" />
                    {format(new Date(post.created_at), "MMM d, yyyy")}
                    <span>·</span>
                    <Clock className="w-3 h-3" />
                    3 min read
                  </div>
                  <h3 className="text-sm font-bold text-[#111827] mb-1 leading-tight">{post.title}</h3>
                  <p className="text-[11px] text-[#6B7280] line-clamp-2 leading-relaxed">
                    {post.excerpt || post.content.substring(0, 120) + "..."}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}



        {/* ── Branding footer ── */}
        <div className="mt-auto pt-10 pb-6 flex justify-center">
          <a 
            href="/" 
            onClick={(e) => {
              if (isAndroid()) {
                e.preventDefault();
                window.location.href = toAndroidIntent(window.location.origin);
              }
            }}
            className="flex items-center gap-1.5 text-[10px] font-bold text-[#9CA3AF] hover:text-[#6B7280] transition-colors uppercase tracking-widest"
          >
            <Zap className="w-3 h-3" /> Powered by TapOpen
          </a>
        </div>
      </div>

      {/* ── Blog full-screen modal ── */}
      {selectedBlog && (
        <div className="fixed inset-0 z-[100] bg-white flex flex-col animate-in fade-in duration-200">
          {/* Modal header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#E5E7EB] shrink-0">
            <div className="flex items-center gap-2 text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest">
              <Calendar className="w-3.5 h-3.5" />
              {format(new Date(selectedBlog.created_at), "MMM d, yyyy")}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const url = `${window.location.origin}/${slug}?blog=${selectedBlog.id}`;
                  if (navigator.share) navigator.share({ title: selectedBlog.title, url }).catch(() => {});
                  else { navigator.clipboard.writeText(url); toast.success("Blog link copied!"); }
                }}
                className="w-9 h-9 rounded-full border border-[#E5E7EB] flex items-center justify-center text-[#6B7280] hover:bg-[#F8FAFC] transition-colors"
              >
                <Share className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => { setSelectedBlog(null); if (searchParams.has("blog")) window.history.pushState({}, "", `/${slug}`); }}
                className="w-9 h-9 rounded-full border border-[#E5E7EB] flex items-center justify-center text-[#6B7280] hover:bg-[#F8FAFC] transition-colors text-sm font-bold"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Modal content */}
          <div className="flex-1 overflow-y-auto px-5 py-8 max-w-xl mx-auto w-full">
            {selectedBlog.image_url && (
              <img src={selectedBlog.image_url} alt={selectedBlog.title} className="w-full aspect-video object-cover rounded-2xl mb-6 border border-[#E5E7EB]" />
            )}
            <h2 className="text-2xl font-extrabold text-[#111827] leading-tight mb-6 tracking-tight">
              {selectedBlog.title}
            </h2>
            <div className="prose prose-sm max-w-none text-[#374151] leading-relaxed">
              <ReactMarkdown
                components={{
                  a: ({ node, ...props }) => (
                    <a {...props} target="_blank" rel="noopener noreferrer" className="text-[#111827] underline underline-offset-4 hover:opacity-70 transition-opacity" />
                  ),
                }}
              >
                {selectedBlog.content}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PublicProfile;
