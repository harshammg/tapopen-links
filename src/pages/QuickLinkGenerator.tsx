import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Zap, Copy, Check, Share2, ArrowRight, Smartphone, Globe, Link2, Trash2, Loader2 } from "lucide-react";
import { platforms } from "@/lib/data";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { nanoid } from "nanoid";

const QuickLinkGenerator = () => {
  const [url, setUrl] = useState("");
  const [customSlug, setCustomSlug] = useState("");
  const [generatedLinks, setGeneratedLinks] = useState<{original_url: string, slug: string, platform: string, clicks: number}[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  // Fetch links and user profile directly from Supabase
  const fetchUserData = async () => {
    if (!supabase) return;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Fetch Links for this user
      const { data, error } = await supabase
        .from("links")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      if (data) setGeneratedLinks(data);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const getPlatform = (url: string) => {
    url = url.toLowerCase();
    if (url.includes("instagram.com")) return "Instagram";
    if (url.includes("youtube.com") || url.includes("youtu.be")) return "YouTube";
    if (url.includes("spotify.com")) return "Spotify";
    if (url.includes("twitter.com") || url.includes("x.com")) return "Twitter/X";
    if (url.includes("tiktok.com")) return "TikTok";
    if (url.includes("linkedin.com")) return "LinkedIn";
    if (url.includes("wa.me") || url.includes("whatsapp.com")) return "WhatsApp";
    if (url.includes("t.me") || url.includes("telegram.org")) return "Telegram";
    if (url.includes("snapchat.com")) return "Snapchat";
    return "Unknown";
  };

  const handleGenerate = async () => {
    if (!url) return;
    
    if (!supabase) {
      toast.error("Database not connected. Please check your .env keys.");
      return;
    }

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast.error("Please log in to generate links.");
      return;
    }

    setIsGenerating(true);
    try {
      const platform = getPlatform(url);
      
      // Slug Logic: Use custom if provided, otherwise random
      let finalSlug = customSlug.trim().toLowerCase().replace(/\s+/g, '-');
      if (!finalSlug) {
        finalSlug = nanoid(8);
      } else {
        // Basic validation for custom slug
        if (!/^[a-z0-9-_]+$/.test(finalSlug)) {
          toast.error("Alias can only contain letters, numbers, dashes, and underscores.");
          setIsGenerating(false);
          return;
        }
      }

      const { data, error } = await supabase
        .from("links")
        .insert([
          { 
            original_url: url, 
            platform, 
            slug: finalSlug, 
            clicks: 0,
            user_id: session.user.id 
          }
        ])
        .select();


      if (error) throw error;

      if (data) {
        toast.success("Deep link generated!");
        fetchUserData();
        setUrl("");
        setCustomSlug("");
      }
    } catch (error: any) {
      if (error?.code === '23505') {
        toast.error("This alias is already taken. Try another!");
      } else {
        toast.error(error.message || "Failed to generate link");
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = (slug: string) => {
    const fullUrl = `${window.location.origin}/${slug}`;
    navigator.clipboard.writeText(fullUrl);
    setCopied(slug);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleDelete = async (slug: string) => {
    if (!supabase) return;
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Please log in to manage links.");
        return;
      }

      const { error } = await supabase
        .from("links")
        .delete()
        .eq("slug", slug)
        .eq("user_id", session.user.id); // Security: Link must belong to user

      if (error) throw error;
      
      toast.success("Link deleted successfully");
      fetchUserData(); // Refresh the list
    } catch (error: any) {
      toast.error(error.message || "Failed to delete link");
    }
  };

  const detectedPlatform = platforms.find(p => url.toLowerCase().includes(p.name.toLowerCase().split('/')[0].toLowerCase()));
  const isLimitReached = generatedLinks.length >= 2;

  return (
    <div className="px-4 py-6 md:p-12 max-w-5xl mx-auto">
      <div className="text-center mb-8 md:mb-12">
        <h1 className="text-2xl md:text-5xl font-display font-bold mb-3">Quick Link Redirect</h1>
        <p className="text-sm md:text-base text-muted-foreground">Bypass in-app browsers. Direct. Solid. Seamless.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Generator Panel */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card border border-primary rounded-2xl p-5 md:p-8 shadow-sm relative overflow-hidden">
            <h3 className="text-lg md:text-xl font-display font-bold mb-5 flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" /> Create New Redirect
            </h3>

            <div className="space-y-5">
              <div className="relative">
                <input
                  type="url"
                  inputMode="url"
                  placeholder="Paste your link here..."
                  value={url}
                  disabled={isGenerating}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full bg-background border-2 border-border focus:border-primary rounded-xl px-4 pr-12 py-4 text-base font-medium transition-all focus:outline-none disabled:opacity-50"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  {isGenerating ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary" /> : <Link2 className="h-5 w-5 text-muted-foreground" />}
                </div>
              </div>

              <div className="space-y-1.5 px-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">
                  Custom Alias (Optional)
                </label>
                <div className="flex items-center gap-2">
                  <div className="bg-muted px-3 py-3 rounded-xl text-xs font-bold text-muted-foreground border border-border">
                    tapopen.online/
                  </div>
                  <input
                    type="text"
                    placeholder="my-cool-link"
                    value={customSlug}
                    onChange={(e) => setCustomSlug(e.target.value)}
                    className="flex-1 bg-background border border-border focus:border-primary rounded-xl px-4 py-3 text-sm font-medium transition-all focus:outline-none"
                  />
                </div>
              </div>

              {detectedPlatform && (
                <div className="flex items-center gap-2 px-4 py-2 bg-primary/5 border border-primary/20 rounded-pill w-max animate-fade-in-up">
                  <detectedPlatform.icon className="h-4 w-4 text-primary" />
                  <span className="text-xs font-medium text-primary uppercase tracking-wider">{detectedPlatform.name} Detected</span>
                </div>
              )}

              <Button 
                size="lg" 
                className="w-full h-14 text-base font-bold" 
                variant="gradient"
                disabled={!url || isGenerating}
                onClick={handleGenerate}
              >
                {isGenerating ? "Generating..." : "Generate Deep Link"} <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Sidebar Info — hidden on mobile to save space */}
        <div className="hidden lg:block space-y-6">
          <div className="bg-card border border-border rounded-2xl p-6">
            <h4 className="font-display font-bold mb-4">Creator Dashboard</h4>
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-sm text-foreground/80">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary"><Zap className="h-4 w-4" /></div>
                Unlimited Links
              </div>
              <div className="flex items-center gap-3 text-sm text-foreground/80">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary"><Smartphone className="h-4 w-4" /></div>
                Native App Opens
              </div>
              <div className="flex items-center gap-3 text-sm text-foreground/80">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary"><Globe className="h-4 w-4" /></div>
                Global Analytics
              </div>
            </div>
            <p className="text-[10px] text-muted-foreground leading-relaxed mt-6 uppercase font-bold tracking-[0.1em]">
              TapOpen is 100% Free for Creators
            </p>
          </div>
        </div>
      </div>

      {/* Manage Links Section */}
      <div className="mt-10 md:mt-16">
        <h3 className="text-xl md:text-2xl font-display font-bold mb-4">Your Redirects</h3>
        {generatedLinks.length === 0 ? (
          <div className="text-center py-14 border-2 border-border border-dashed rounded-2xl">
            <Link2 className="h-8 w-8 text-muted-foreground mx-auto mb-3 opacity-20" />
            <p className="text-muted-foreground text-sm">No links yet. Create your first one above!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {generatedLinks.map((link) => (
              <div key={link.slug} className="bg-card border border-border rounded-2xl p-4 flex flex-col gap-3 hover:border-primary transition-all">

                {/* Platform badge + Clicks */}
                <div className="flex items-center justify-between">
                  <span className="bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full">
                    {link.platform}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-base font-bold text-primary">{link.clicks}</span>
                    <span className="text-[9px] uppercase font-bold text-muted-foreground tracking-widest">Clicks</span>
                  </div>
                </div>

                {/* Deep link URL in code block */}
                <div className="bg-muted/40 rounded-xl px-3 py-2.5">
                  <p className="font-mono text-xs font-bold text-primary break-all leading-relaxed">
                    {window.location.origin}/{link.slug}
                  </p>
                </div>

                {/* Original URL */}
                <p className="text-[11px] text-muted-foreground truncate px-1">
                  ↳ {link.original_url}
                </p>

                {/* Action buttons */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    className="flex-1 h-10 rounded-xl font-bold text-sm"
                    onClick={() => handleCopy(link.slug)}
                  >
                    {copied === link.slug ? <Check className="h-4 w-4 mr-2 text-success" /> : <Copy className="h-4 w-4 mr-2" />}
                    {copied === link.slug ? "Copied!" : "Copy Link"}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 text-muted-foreground hover:text-destructive rounded-xl transition-colors shrink-0"
                    onClick={() => handleDelete(link.slug)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default QuickLinkGenerator;
