import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Zap, 
  ArrowRight, 
  Link2, 
  ClipboardPaste,
  Loader2
} from "lucide-react";
import { toast } from "sonner";
import { 
  cleanUrl, 
  getPlatform 
} from "@/lib/utils";
import { platforms } from "@/lib/data";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";
import { linkService } from "@/services/linkService";
import { nanoid } from "nanoid";

const AnonymousGenerator = ({ session }: { session: any }) => {
  const [url, setUrl] = useState("");
  const [customSlug, setCustomSlug] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isNamingModalOpen, setIsNamingModalOpen] = useState(false);
  const [aliasError, setAliasError] = useState<string | null>(null);

  const navigate = useNavigate();

  const detectedPlatform = platforms.find(p => p.name.toLowerCase() === getPlatform(url).toLowerCase());

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setUrl(text);
        toast.success("Link pasted!");
      }
    } catch (err) {
      toast.error("Failed to read clipboard.");
    }
  };

  const handleGenerateClick = () => {
    if (!url) return;
    
    const cleaned = cleanUrl(url);
    if (cleaned !== url) {
      setUrl(cleaned);
    }

    setIsNamingModalOpen(true);
  };

  const handleFinalAction = async (overrideSkip?: boolean) => {
    setAliasError(null);
    const finalSlug = (overrideSkip !== true && customSlug.trim()) 
      ? customSlug.trim().toLowerCase().replace(/\s+/g, '-') 
      : nanoid(8);
    
    const linkData = {
      original_url: url,
      platform: getPlatform(url) === "Unknown" ? "App" : getPlatform(url),
      slug: finalSlug,
      created_at: new Date().toISOString()
    };

    if (!session) {
      // Check if alias exists before redirecting to signup
      setIsGenerating(true);
      try {
        const exists = await linkService.getLinkBySlug(linkData.slug);
        if (exists) {
          setAliasError("This alias is already taken. Try another or leave blank for a random one.");
          setIsGenerating(false);
          return;
        }
      } catch (err) {
        // Not found is good!
      } finally {
        setIsGenerating(false);
      }

      localStorage.setItem("pending_tapopen_link", JSON.stringify(linkData));
      toast.info("Step 1 Complete! Claim your link to activate it.");
      setIsNamingModalOpen(false);
      navigate("/auth/signup");
    } else {
      // Logged in: Save immediately
      setIsGenerating(true);
      try {
        await linkService.createLink({
          ...linkData,
          user_id: session.user.id
        });
        toast.success("Link active! Redirecting to dashboard...");
        setIsNamingModalOpen(false);
        navigate("/dashboard");
      } catch (error: any) {
        if (error?.code === '23505') {
          setAliasError("Alias taken! Change it or click again with blank for random.");
        } else {
          toast.error(error.message || "Failed to save link");
        }
      } finally {
        setIsGenerating(false);
      }
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-card border-2 border-primary/20 rounded-[32px] p-2 shadow-2xl overflow-hidden relative group">
        <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity -z-10 pointer-events-none" />
        
        <div className="flex flex-col md:flex-row gap-2">
          <div className="flex-1 relative">
            <input
              type="url"
              placeholder="Paste your social link here..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full h-14 md:h-16 bg-transparent border-none focus:ring-0 focus:outline-none pl-6 pr-16 text-base md:text-lg font-medium placeholder:text-muted-foreground/50"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <button 
                onClick={handlePaste}
                className="p-2 hover:bg-primary/10 rounded-xl transition-colors text-muted-foreground hover:text-primary"
                title="Paste"
              >
                <ClipboardPaste className="h-5 w-5" />
              </button>
            </div>
          </div>
          
          <Button 
            variant="gradient" 
            size="lg" 
            className="h-14 md:h-16 px-8 rounded-[24px] text-base font-bold shadow-lg"
            onClick={handleGenerateClick}
            disabled={!url || isGenerating}
          >
            {isGenerating ? <Loader2 className="h-5 w-5 animate-spin" /> : "Create Link"}
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>

      <p className="mt-4 text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground opacity-60">
        Supports YouTube, Instagram, Spotify, and more.
      </p>

      {/* Naming Modal */}
      <Dialog open={isNamingModalOpen} onOpenChange={setIsNamingModalOpen}>
        <DialogContent className="sm:max-w-md bg-card border-border shadow-2xl rounded-3xl p-0 overflow-hidden">
          <div className="bg-primary/5 p-6 border-b border-border text-center">
            <DialogHeader>
              <DialogTitle className="text-2xl font-display font-bold">Name Your Link</DialogTitle>
              <DialogDescription className="text-muted-foreground">
                This name appears on the redirect loading screen.
              </DialogDescription>
            </DialogHeader>
          </div>
          
          <div className="p-8 space-y-6">
            <div className="space-y-3">
              <div className="flex justify-between items-center ml-1">
                <Label htmlFor="custom-slug" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  Custom Alias (Optional)
                </Label>
                <span className="text-[10px] text-primary font-bold uppercase tracking-wider">tapopen.online/</span>
              </div>
              <Input
                id="custom-slug"
                placeholder="my-link"
                value={customSlug}
                onChange={(e) => { setCustomSlug(e.target.value); setAliasError(null); }}
                className={`h-12 rounded-xl border-border focus:ring-primary focus:border-primary text-base ${aliasError ? "border-destructive focus:ring-destructive" : ""}`}
                autoFocus
              />
              {aliasError && (
                <div className="mt-2 animate-fade-in">
                  <p className="text-[10px] text-destructive font-bold uppercase tracking-tight ml-1">{aliasError}</p>
                </div>
              )}
            </div>


            <DialogFooter className="flex flex-col sm:flex-row gap-3">
              <Button 
                type="button" 
                variant="gradient" 
                className="flex-[2] h-12 rounded-xl font-bold"
                onClick={() => handleFinalAction()}
                disabled={isGenerating}
              >
                {session ? (isGenerating ? "Creating..." : "Create & Save") : (isGenerating ? "Processing..." : "Claim & Activate Link")}
              </Button>
              {!session && (
                <Button 
                  type="button" 
                  variant="secondary" 
                  className="flex-1 h-12 rounded-xl font-bold"
                  onClick={() => handleFinalAction(aliasError ? true : false)}
                >
                  {aliasError ? "Clear & Skip" : "Skip"}
                </Button>
              )}
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AnonymousGenerator;
