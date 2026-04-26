import React, { useState, useEffect } from "react";
import { Zap, Smartphone, Globe, Copy, Check, ExternalLink, Trash2, Link2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { nanoid } from "nanoid";
import { cleanUrl } from "@/lib/utils";
import { platforms } from "@/lib/data";
import { supabase } from "@/lib/supabase";
import { linkService } from "@/services/linkService";
import LinkGeneratorForm from "@/components/dashboard/LinkGeneratorForm";

interface QuickLink {
  id: string;
  slug: string;
  original_url: string;
  title: string;
  created_at: string;
}

const QuickLinkGenerator = () => {
  const [url, setUrl] = useState("");
  const [customSlug, setCustomSlug] = useState("");
  const [aliasError, setAliasError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [quickLinks, setQuickLinks] = useState<QuickLink[]>([]);
  const [loadingLinks, setLoadingLinks] = useState(true);

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
          .select("id, slug, original_url, title, created_at")
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
      setGeneratedLink(link);
      setQuickLinks(prev => [{ id: created.id, slug: finalSlug, original_url: cleanUrl(url), title: `Quick: ${finalSlug}`, created_at: new Date().toISOString() }, ...prev]);
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
    <div className="px-4 py-6 md:p-12 max-w-5xl mx-auto">
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

          {/* Latest generated link result */}
          {generatedLink && (
            <div className="bg-card border border-primary/30 rounded-2xl p-6 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-300">
              <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-3 flex items-center gap-2">
                <Zap className="w-3 h-3" /> Just Generated
              </p>
              <div className="flex items-center gap-3">
                <a
                  href={generatedLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 text-sm font-medium text-foreground bg-muted/50 px-4 py-3 rounded-xl truncate hover:text-primary transition-colors flex items-center gap-2"
                >
                  {generatedLink}
                  <ExternalLink className="w-3 h-3 shrink-0 opacity-50" />
                </a>
                <button
                  onClick={() => handleCopy(generatedLink)}
                  className="h-11 px-4 rounded-xl bg-primary text-primary-foreground font-bold text-sm flex items-center gap-2 hover:opacity-90 transition shrink-0"
                >
                  {copied === generatedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied === generatedLink ? "Copied!" : "Copy"}
                </button>
              </div>
            </div>
          )}
        </div>

        <aside className="hidden lg:block space-y-6">
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <h4 className="font-display font-bold mb-6 text-sm uppercase tracking-widest text-primary">
              Platform Status
            </h4>
            <div className="space-y-5">
              {[
                { label: "Quick Links", val: quickLinks.length, icon: Zap },
                { label: "Deep Linking", val: "Optimal", icon: Smartphone },
                { label: "Tracking", val: "Active", icon: Globe }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4">
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
                <div key={link.id} className="bg-card border border-border rounded-2xl p-5 flex items-center justify-between shadow-sm hover:border-primary/30 transition-all">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                      <Zap className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold truncate">{fullLink}</p>
                      <p className="text-xs text-muted-foreground truncate opacity-60">{link.original_url}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4 shrink-0">
                    <button
                      onClick={() => handleCopy(fullLink)}
                      className="p-2.5 rounded-xl hover:bg-muted transition-colors text-muted-foreground hover:text-primary"
                      title="Copy link"
                    >
                      {copied === fullLink ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                    <a href={fullLink} target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-xl hover:bg-muted transition-colors text-muted-foreground hover:text-primary">
                      <ExternalLink className="w-4 h-4" />
                    </a>
                    <button
                      onClick={() => handleDelete(link.slug, link.id)}
                      className="p-2.5 rounded-xl hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default QuickLinkGenerator;
