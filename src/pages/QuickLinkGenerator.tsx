import React, { useState, useEffect } from "react";
import { Zap, Smartphone, Globe, Copy, Check, ExternalLink, Trash2, Link2, Loader2, MousePointer2 } from "lucide-react";
import { toast } from "sonner";
import { nanoid } from "nanoid";
import { cleanUrl } from "@/lib/utils";
import { platforms } from "@/lib/data";
import { supabase } from "@/lib/supabase";
import { linkService } from "@/services/linkService";
import LinkGeneratorForm from "@/components/dashboard/LinkGeneratorForm";
import { format, subDays, startOfDay, isSameDay } from "date-fns";
import AnalyticsModal from "@/components/dashboard/AnalyticsModal";

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
  const [customSlug, setCustomSlug] = useState("");
  const [aliasError, setAliasError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [quickLinks, setQuickLinks] = useState<QuickLink[]>([]);
  const [loadingLinks, setLoadingLinks] = useState(true);
  const [analysisLink, setAnalysisLink] = useState<QuickLink | "global" | null>(null);

  const detectedPlatform = platforms.find(p =>
    url.toLowerCase().includes(p.name.toLowerCase().split('/')[0].toLowerCase())
  );

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

  const handleConfirmGenerate = async (skipAlias?: boolean) => {
    setAliasError(null);
    setIsGenerating(true);
    try {
      let finalSlug = skipAlias ? "" : customSlug.trim().toLowerCase().replace(/\s+/g, '-');
      if (!finalSlug) finalSlug = nanoid(8);
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
      if (err?.code === '23505') {
        setAliasError("Alias taken! Try another or leave blank for a random one.");
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
    <div className="px-4 py-6 md:p-12 max-w-5xl mx-auto w-full overflow-x-hidden">
      <header className="text-center mb-10 md:mb-16">
        <h1 className="text-3xl md:text-5xl font-display font-bold mb-3 tracking-tight">
          Quick Link Generator
        </h1>
        <p className="text-sm md:text-base text-muted-foreground font-medium opacity-80">
          Instantly generate short redirect links. Separate from your managed Link Page.
        </p>
      </header>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <LinkGeneratorForm
            url={url}
            setUrl={setUrl}
            customSlug={customSlug}
            setCustomSlug={setCustomSlug}
            isGenerating={isGenerating}
            onPaste={handlePaste}
            onGenerate={handleGenerateClick}
            detectedPlatform={detectedPlatform}
            aliasError={aliasError}
            setAliasError={setAliasError}
          />

        </div>

        <aside className="hidden lg:block space-y-6">
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <h4 className="font-display font-bold mb-6 text-sm uppercase tracking-widest text-primary">
              Platform Status
            </h4>
            <div className="space-y-5">
              {[
                { label: "Quick Links", val: quickLinks.length, icon: Zap },
                { 
                  label: "Total Clicks", 
                  val: quickLinks.reduce((acc, link) => acc + (link.clicks || 0), 0), 
                  icon: MousePointer2,
                  clickable: true 
                },
                { label: "Deep Linking", val: "Optimal", icon: Smartphone },
                { label: "Tracking", val: "Active", icon: Globe }
              ].map((item, i) => (
                <div 
                  key={i} 
                  className={`flex items-center gap-4 ${item.clickable ? "cursor-pointer hover:bg-primary/5 p-2 -m-2 rounded-xl transition-colors" : ""}`}
                  onClick={() => item.clickable && setAnalysisLink("global")}
                >
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{item.label}</p>
                    <p className="text-sm font-bold text-foreground">{item.val}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>

      {/* Quick Links History */}
      <div className="mt-12 md:mt-20">
        {/* Mobile Stats Bar */}
        <div className="lg:hidden grid grid-cols-2 gap-4 mb-8">
          <div className="bg-card border border-border rounded-2xl p-4 shadow-sm flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <Zap className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground">Total Links</p>
              <p className="text-sm font-bold text-foreground">{quickLinks.length}</p>
            </div>
          </div>
          <div 
            className="bg-card border border-border rounded-2xl p-4 shadow-sm flex items-center gap-3 cursor-pointer hover:bg-primary/5 transition-colors active:scale-95"
            onClick={() => setAnalysisLink("global")}
          >
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <MousePointer2 className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground">Total Clicks</p>
              <p className="text-sm font-bold text-foreground">{quickLinks.reduce((acc, link) => acc + (link.clicks || 0), 0)}</p>
            </div>
          </div>
        </div>

        <h3 className="text-xl md:text-2xl font-display font-bold mb-8 flex items-center gap-3">
          Your Quick Links
          <span className="bg-muted px-2 py-0.5 rounded-lg text-xs text-muted-foreground">{quickLinks.length}</span>
        </h3>

        {loadingLinks ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="animate-spin text-primary w-6 h-6" />
          </div>
        ) : quickLinks.length === 0 ? (
          <div className="text-center py-20 border-2 border-border border-dashed rounded-[32px] bg-muted/20">
            <Link2 className="h-10 w-10 text-muted-foreground/20 mx-auto mb-4" />
            <p className="text-muted-foreground font-medium">No quick links yet. Generate one above.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {quickLinks.map((link) => {
              const fullLink = `${window.location.origin}/${link.slug}`;
              return (
                <div key={link.id} className="bg-card border border-border rounded-2xl p-5 flex flex-col space-y-4 shadow-sm hover:border-primary/30 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                      <Zap className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 flex-1 overflow-hidden">
                      <p className="text-sm font-bold truncate hover:text-primary transition-colors">
                        {fullLink.length > 30 ? fullLink.substring(0, 30) + "..." : fullLink}
                      </p>
                      <p className="text-xs text-muted-foreground truncate opacity-50 mt-0.5">
                        {link.original_url}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-border/50">
                    <div 
                      className="flex flex-col cursor-pointer hover:bg-primary/5 p-2 -m-2 rounded-xl transition-colors group"
                      onClick={() => setAnalysisLink(link)}
                    >
                      <span className="text-sm font-black text-primary group-hover:scale-110 transition-transform origin-left">{link.clicks || 0}</span>
                      <span className="text-[8px] font-bold uppercase tracking-widest opacity-40">Total Clicks</span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleCopy(fullLink)}
                        className="flex items-center gap-2 px-2 sm:px-3 py-1.5 rounded-lg bg-muted/50 hover:bg-primary hover:text-primary-foreground transition-all text-muted-foreground text-xs font-bold shrink-0"
                        title="Copy link"
                      >
                        {copied === fullLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span className="hidden sm:inline">{copied === fullLink ? "Copied" : "Copy"}</span>
                      </button>
                      <a 
                        href={fullLink} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-primary shrink-0"
                        title="Open Link"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                      <button
                        onClick={() => handleDelete(link.slug, link.id)}
                        className="p-2 rounded-lg hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive shrink-0"
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
