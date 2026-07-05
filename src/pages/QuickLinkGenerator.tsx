import React, { useState, useEffect } from "react";
import { Zap, Smartphone, Globe, Copy, Check, ExternalLink, Trash2, Link2, Loader2, MousePointer2, BarChart3 } from "lucide-react";
import { toast } from "sonner";
import { nanoid } from "nanoid";
import { cleanUrl } from "@/lib/utils";
import { platforms } from "@/lib/data";
import { supabase } from "@/lib/supabase";
import { linkService } from "@/services/linkService";
import LinkGeneratorForm from "@/components/dashboard/LinkGeneratorForm";
import { format, subDays, startOfDay, isSameDay } from "date-fns";
import AnalyticsModal from "@/components/dashboard/AnalyticsModal";
import { DiamondLoader } from "@/components/ui/DiamondLoader";

interface QuickLink {
  id: string;
  slug: string;
  original_url: string;
  title: string;
  created_at: string;
  clicks: number;
  clicks_daily?: Record<string, number>;
}

const QuickLinkGenerator = () => {
  const [url, setUrl] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [quickLinks, setQuickLinks] = useState<QuickLink[]>([]);
  const [loadingLinks, setLoadingLinks] = useState(true);
  const [analysisLink, setAnalysisLink] = useState<QuickLink | "global" | null>(null);

  const [customSlug, setCustomSlug] = useState("");
  const [aliasError, setAliasError] = useState<string | null>(null);

  const detectedPlatform = platforms.find(p =>
    url.toLowerCase().includes(p.name.toLowerCase().split('/')[0].toLowerCase())
  );

  // Auto-populate URL from landing-page generator (pre-login flow)
  useEffect(() => {
    const pending = localStorage.getItem("pending_tapopen_link");
    if (pending) {
      setUrl(pending);
      localStorage.removeItem("pending_tapopen_link");
      toast.info("URL ready — click Generate to shorten it!", { duration: 4000 });
    }
  }, []);

  // Fetch existing quick links on mount
  useEffect(() => {
    const fetchQuickLinks = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;
        const { data } = await supabase
          .from("links")
          .select("id, slug, original_url, title, created_at, clicks, clicks_daily")
          .eq("user_id", session.user.id)
          .eq("is_quick", true)
          .order("created_at", { ascending: false });
        if (data) setQuickLinks(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingLinks(false);
      }
    };
    fetchQuickLinks();
  }, []);

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) setUrl(text);
    } catch {
      toast.error("Clipboard access denied.");
    }
  };

  const handleGenerateClick = (skip?: boolean) => {
    if (!url) return;
    const cleaned = cleanUrl(url);
    if (cleaned !== url) {
      setUrl(cleaned);
      toast.info("Link parameters cleaned.");
    }
    handleConfirmGenerate(skip);
  };

  const handleConfirmGenerate = async () => {
    if (customSlug && !/^[a-zA-Z0-9-_]+$/.test(customSlug)) {
      setAliasError("Use letters, numbers, hyphens, or underscores only.");
      return;
    }
    
    setAliasError(null);
    setIsGenerating(true);
    try {
      const finalSlug = customSlug || Math.random().toString(36).substr(2, 4).toUpperCase();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { toast.error("Not logged in"); return; }
      const created = await linkService.createLink({
        original_url: cleanUrl(url),
        slug: finalSlug,
        user_id: session.user.id,
        title: `Quick: ${finalSlug}`,
        type: "regular" as any,
        platform: "Web",
        is_quick: true,
        active: true,
      });
      const link = `${window.location.origin}/${finalSlug}`;
      setQuickLinks(prev => [{ id: created.id, slug: finalSlug, original_url: cleanUrl(url), title: `Quick: ${finalSlug}`, created_at: new Date().toISOString(), clicks: 0 }, ...prev]);
      setUrl("");
      setCustomSlug("");
      toast.success("Quick link saved & generated!");
    } catch (err: any) {
      if (err?.code === "23505" || err?.message?.includes("duplicate")) {
        setAliasError("Alias is already taken.");
      } else {
        toast.error("Failed to generate link.");
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = (link: string) => {
    navigator.clipboard.writeText(link);
    setCopied(link);
    setTimeout(() => setCopied(null), 2000);
    toast.success("Copied to clipboard!");
  };

  const handleDelete = async (slug: string, id: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      await linkService.deleteLink(slug, session.user.id);
      setQuickLinks(prev => prev.filter(l => l.id !== id));
      toast.success("Quick link deleted.");
    } catch {
      toast.error("Failed to delete link.");
    }
  };

  return (
    <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 py-8 md:py-12 bg-white sm:bg-[#F8FAFC] min-h-[calc(100vh-4rem)]">
      
      {/* ── Page Header ── */}
      <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#111827] tracking-tight mb-2">
            Quick Links
          </h1>
          <p className="text-sm text-[#6B7280] font-medium">
            Generate and manage fast, secure short links.
          </p>
        </div>
      </header>

      {/* ── KPI Stats Row ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-4 shadow-sm flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-2">
            <Link2 className="w-4 h-4 text-blue-600" />
            <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">Total Links</span>
          </div>
          <span className="text-2xl font-black text-[#111827]">{quickLinks.length}</span>
        </div>

        <div 
          onClick={() => setAnalysisLink("global")}
          className="bg-white border border-[#E5E7EB] rounded-xl p-4 shadow-sm flex flex-col justify-center cursor-pointer hover:border-[#111827] transition-colors"
        >
          <div className="flex items-center gap-2 mb-2">
            <MousePointer2 className="w-4 h-4 text-blue-600" />
            <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">Total Clicks</span>
          </div>
          <span className="text-2xl font-black text-[#111827]">{quickLinks.reduce((acc, link) => acc + (link.clicks || 0), 0)}</span>
        </div>

        <div className="bg-white border border-[#E5E7EB] rounded-xl p-4 shadow-sm flex-col justify-center hidden md:flex">
          <div className="flex items-center gap-2 mb-2">
            <Globe className="w-4 h-4 text-blue-600" />
            <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">Tracking</span>
          </div>
          <span className="text-sm font-bold text-[#111827]">Active</span>
        </div>

        <div className="bg-white border border-[#E5E7EB] rounded-xl p-4 shadow-sm flex-col justify-center hidden md:flex">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-blue-600" />
            <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">Routing Speed</span>
          </div>
          <span className="text-sm font-bold text-[#111827]">&lt; 50ms</span>
        </div>
      </div>

      {/* ── Generator ── */}
      <div className="mb-10">
        <LinkGeneratorForm
          url={url}
          setUrl={setUrl}
          customSlug={customSlug}
          setCustomSlug={setCustomSlug}
          aliasError={aliasError}
          setAliasError={setAliasError}
          isGenerating={isGenerating}
          onPaste={handlePaste}
          onGenerate={handleGenerateClick}
          detectedPlatform={detectedPlatform}
        />
      </div>

      {/* ── Link History ── */}
      <div>
        <h3 className="text-lg font-bold text-[#111827] mb-4">Your Links</h3>
        
        {loadingLinks ? (
          <div className="flex items-center justify-center py-20 bg-white border border-[#E5E7EB] rounded-2xl shadow-sm">
            <DiamondLoader text="Loading Links" />
          </div>
        ) : quickLinks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white border border-[#E5E7EB] rounded-2xl shadow-sm text-center px-4">
            <div className="w-12 h-12 bg-[#F8FAFC] border border-[#E5E7EB] rounded-xl flex items-center justify-center mb-4">
              <Link2 className="h-6 w-6 text-[#9CA3AF]" />
            </div>
            <p className="text-sm text-[#111827] font-bold">No links created yet</p>
            <p className="text-xs text-[#6B7280] mt-1">Paste a URL above to generate your first short link.</p>
          </div>
        ) : (
          <div className="bg-white border border-[#E5E7EB] rounded-2xl shadow-sm overflow-hidden">
            {quickLinks.map((link, idx) => {
              const fullLink = `${window.location.origin}/${link.slug}`;
              return (
                <div 
                  key={link.id} 
                  className={`flex flex-col md:flex-row md:items-center justify-between p-4 sm:p-5 gap-4 hover:bg-[#F8FAFC] transition-colors ${idx !== quickLinks.length - 1 ? 'border-b border-[#E5E7EB]' : ''}`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <a href={fullLink} target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-[#111827] hover:text-blue-600 truncate transition-colors">
                        tapopen.online/{link.slug}
                      </a>
                      <span className="px-2 py-0.5 bg-[#F8FAFC] border border-[#E5E7EB] rounded text-[9px] font-bold text-[#6B7280]">
                        {format(new Date(link.created_at), 'MMM d, yyyy')}
                      </span>
                    </div>
                    <p className="text-xs text-[#6B7280] truncate max-w-lg" title={link.original_url}>
                      {link.original_url}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <button 
                      onClick={() => setAnalysisLink(link)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-[#E5E7EB]/50 transition-colors group"
                    >
                      <BarChart3 className="w-4 h-4 text-[#9CA3AF] group-hover:text-blue-600" />
                      <span className="text-xs font-bold text-[#111827] group-hover:text-blue-600">{link.clicks || 0}</span>
                    </button>

                    <div className="h-4 w-px bg-[#E5E7EB]"></div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleCopy(fullLink)}
                        className="p-1.5 rounded-lg text-[#6B7280] hover:bg-[#E5E7EB]/50 hover:text-[#111827] transition-colors"
                        title="Copy link"
                      >
                        {copied === fullLink ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                      </button>
                      <a 
                        href={fullLink} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="p-1.5 rounded-lg text-[#6B7280] hover:bg-[#E5E7EB]/50 hover:text-[#111827] transition-colors"
                        title="Open Link"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                      <button
                        onClick={() => handleDelete(link.slug, link.id)}
                        className="p-1.5 rounded-lg text-[#9CA3AF] hover:bg-red-50 hover:text-red-600 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <AnalyticsModal 
        isOpen={!!analysisLink} 
        onClose={() => setAnalysisLink(null)} 
        link={
          analysisLink === "global" 
            ? {
                id: "global",
                slug: "All Quick Links",
                title: "Global Quick Links",
                original_url: "",
                type: "regular",
                category: "links",
                active: true,
                clicks: quickLinks.reduce((acc, l) => acc + (l.clicks || 0), 0),
                clicks_daily: quickLinks.reduce((acc, l) => {
                  Object.keys(l.clicks_daily || {}).forEach(date => {
                    acc[date] = (acc[date] || 0) + (l.clicks_daily![date] || 0);
                  });
                  return acc;
                }, {} as Record<string, number>)
              } as any
            : analysisLink as any
        } 
      />
    </div>
  );
};

export default QuickLinkGenerator;
