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
      const slug = nanoid(8); // Use secure nanoid for slugs

      const { data, error } = await supabase
        .from("links")
        .insert([
          { 
            original_url: url, 
            platform, 
            slug, 
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
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to generate link");
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
    <div className="p-6 md:p-12 max-w-5xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-5xl font-display font-bold mb-4">Quick Link Redirect</h1>
        <p className="text-muted-foreground">The fastest way to bypass in-app browsers. Direct. Solid. Seamless.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Generator Panel */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-card border border-primary rounded-2xl p-8 shadow-sm relative overflow-hidden">
            <h3 className="text-xl font-display font-bold mb-6 flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" /> Create New Redirect
            </h3>

            <div className="space-y-6">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Paste your link here..."
                  value={url}
                  disabled={isGenerating}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full bg-background border-2 border-border focus:border-primary rounded-xl px-6 py-5 text-lg font-medium transition-all focus:outline-none disabled:opacity-50"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  {isGenerating ? <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" /> : <Link2 className="h-6 w-6 text-muted-foreground" />}
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
                className="w-full h-16 text-lg font-bold" 
                variant="gradient"
                disabled={!url || isGenerating}
                onClick={handleGenerate}
              >
                {isGenerating ? "Generating..." : "Generate Deep Link"} <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-2xl p-6">
            <h4 className="font-display font-bold mb-4">
              Creator Dashboard
            </h4>
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
      <div className="mt-16">
        <h3 className="text-2xl font-display font-bold mb-8">Manage Your Redirects</h3>
        {generatedLinks.length === 0 ? (
          <div className="text-center py-20 border-2 border-border border-dashed rounded-2xl">
            <Link2 className="h-10 w-10 text-muted-foreground mx-auto mb-4 opacity-20" />
            <p className="text-muted-foreground">No links generated yet. Create your first one above!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {generatedLinks.map((link) => (
              <div key={link.slug} className="bg-card border border-border rounded-xl p-6 flex flex-col md:flex-row items-center gap-6 group hover:border-primary transition-all">
                <div className="w-12 h-12 rounded-lg bg-primary/5 flex items-center justify-center text-primary shrink-0 relative">
                  <Globe className="h-6 w-6" />
                  <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-[8px] font-bold px-1.5 py-0.5 rounded-full">{link.platform}</span>
                </div>
                <div className="flex-1 min-w-0 text-center md:text-left">
                  <p className="font-mono text-lg font-bold text-primary mb-1">{window.location.origin}/{link.slug}</p>
                  <p className="text-xs text-muted-foreground truncate opacity-70">{link.original_url}</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center px-4">
                    <p className="text-xl font-bold text-primary">{link.clicks}</p>
                    <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Clicks</p>
                  </div>
                  <div className="flex items-center gap-3 w-full md:w-auto">
                    <Button variant="outline" className="flex-1 md:flex-none h-11 px-6 rounded-lg font-bold" onClick={() => handleCopy(link.slug)}>
                      {copied === link.slug ? <Check className="h-4 w-4 mr-2 text-success" /> : <Copy className="h-4 w-4 mr-2" />}
                      {copied === link.slug ? "Copied" : "Copy"}
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-11 w-11 text-muted-foreground hover:text-destructive rounded-lg transition-colors"
                      onClick={() => handleDelete(link.slug)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" className="opacity-0 group-hover:opacity-100 transition-opacity text-xs font-bold uppercase tracking-widest">
                      Manage
                      <span className="ml-1 text-[8px] bg-primary/10 text-primary px-1.5 py-0.5 rounded">SOON</span>
                    </Button>
                  </div>
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
