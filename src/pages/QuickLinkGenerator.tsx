import { useState, useEffect } from "react";
import { Link as RouterLink } from "react-router-dom";
import { Zap, Smartphone, Globe, Link2 } from "lucide-react";
import { toast } from "sonner";
import { nanoid } from "nanoid";

// Hooks & Services
import { useLinks } from "@/hooks/useLinks";
import { supabase } from "@/lib/supabase";

// Utils & Data
import { cleanUrl, getPlatform } from "@/lib/utils";
import { platforms } from "@/lib/data";
import { Link as LinkType } from "@/types";

// Components
import ShareModal from "@/components/ShareModal";
import LinkGeneratorForm from "@/components/dashboard/LinkGeneratorForm";
import LinkItem from "@/components/dashboard/LinkItem";
import AnalyticsModal from "@/components/dashboard/AnalyticsModal";
import EditLinkModal from "@/components/dashboard/EditLinkModal";
import NamingModal from "@/components/dashboard/NamingModal";

const QuickLinkGenerator = () => {
  const { links, isLoading, createLink, updateLink, deleteLink, fetchLinks } = useLinks();
  
  // Local UI State
  const [url, setUrl] = useState("");
  const [customSlug, setCustomSlug] = useState("");
  const [copied, setCopied] = useState<string | null>(null);
  const [activeShareLink, setActiveShareLink] = useState<{ slug: string, platform: string } | null>(null);
  const [tempPlatformName, setTempPlatformName] = useState("");
  const [aliasError, setAliasError] = useState<string | null>(null);
  
  // Modal State
  const [isNamingModalOpen, setIsNamingModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAnalyticsModalOpen, setIsAnalyticsModalOpen] = useState(false);
  const [selectedLink, setSelectedLink] = useState<LinkType | null>(null);

  // ── Actions ─────────────────────────────────────────────────────────────────
  const handleGenerateClick = (skip?: boolean) => {
    if (!url) return;
    const cleaned = cleanUrl(url);
    if (cleaned !== url) {
      setUrl(cleaned);
      toast.info("Link parameters cleaned.");
    }
    const detected = getPlatform(cleaned);
    setTempPlatformName(detected === "Unknown" ? "" : detected);
    
    if (skip) {
      handleConfirmGenerate(true);
    } else {
      setIsNamingModalOpen(true);
    }
  };

  const handleConfirmGenerate = async (skipAlias?: boolean) => {
    setAliasError(null);
    let finalSlug = skipAlias === true ? "" : customSlug.trim().toLowerCase().replace(/\s+/g, '-');
    if (!finalSlug) finalSlug = nanoid(8);
    
    const result = await createLink({
      original_url: url,
      platform: tempPlatformName.trim() || (skipAlias ? (getPlatform(url) === "Unknown" ? "App" : getPlatform(url)) : "App"),
      slug: finalSlug,
    });

    if (result.success) {
      setUrl("");
      setCustomSlug("");
      setAliasError(null);
      setIsNamingModalOpen(false);
    } else if (result.error === 'CONFLICT') {
      setAliasError("Alias taken! Try another or clear it for a random one.");
    }
  };

  const handleCopy = (slug: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/${slug}`);
    setCopied(slug);
    setTimeout(() => setCopied(null), 2000);
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) setUrl(text);
    } catch {
      toast.error("Clipboard access denied.");
    }
  };

  const detectedPlatform = platforms.find(p => url.toLowerCase().includes(p.name.toLowerCase().split('/')[0].toLowerCase()));

  return (
    <div className="px-4 py-6 md:p-12 max-w-5xl mx-auto">
      <header className="text-center mb-10 md:mb-16">
        <h1 className="text-3xl md:text-5xl font-display font-bold mb-3 tracking-tight">TapOpen Dashboard</h1>
        <p className="text-sm md:text-base text-muted-foreground font-medium opacity-80">Manage your native redirects and track engagement.</p>
      </header>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <LinkGeneratorForm 
            url={url}
            setUrl={setUrl}
            customSlug={customSlug}
            setCustomSlug={setCustomSlug}
            isGenerating={isLoading}
            onPaste={handlePaste}
            onGenerate={handleGenerateClick}
            detectedPlatform={detectedPlatform}
            aliasError={aliasError}
            setAliasError={setAliasError}
          />
        </div>

        <aside className="hidden lg:block space-y-6">
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <h4 className="font-display font-bold mb-6 text-sm uppercase tracking-widest text-primary">Platform Status</h4>
            <div className="space-y-5">
              {[
                { label: "Active Links", val: links.length, icon: Zap },
                { label: "Deep Linking", val: "Optimal", icon: Smartphone },
                { label: "Tracking", val: "Active", icon: Globe }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary"><item.icon className="h-5 w-5" /></div>
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

      <div className="mt-12 md:mt-20">
        <h3 className="text-xl md:text-2xl font-display font-bold mb-8 flex items-center gap-3">
          Your Redirects <span className="bg-muted px-2 py-0.5 rounded-lg text-xs text-muted-foreground">{links.length}</span>
        </h3>
        
        {links.length === 0 ? (
          <div className="text-center py-20 border-2 border-border border-dashed rounded-[32px] bg-muted/20">
            <Link2 className="h-10 w-10 text-muted-foreground/20 mx-auto mb-4" />
            <p className="text-muted-foreground font-medium">No redirects active yet. Launch one above.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {links.map((link) => (
              <LinkItem 
                key={link.slug}
                link={link}
                copied={copied}
                onCopy={handleCopy}
                onDelete={deleteLink}
                onEdit={(link) => { setSelectedLink(link); setIsEditModalOpen(true); }}
                onAnalytics={(link) => { setSelectedLink(link); setIsAnalyticsModalOpen(true); }}
                onShare={setActiveShareLink}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <NamingModal 
        isOpen={isNamingModalOpen}
        onClose={() => setIsNamingModalOpen(false)}
        tempPlatformName={tempPlatformName}
        setTempPlatformName={setTempPlatformName}
        onConfirm={handleConfirmGenerate}
      />

      <EditLinkModal 
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        link={selectedLink}
        onUpdate={updateLink}
      />

      <AnalyticsModal 
        isOpen={isAnalyticsModalOpen}
        onClose={() => setIsAnalyticsModalOpen(false)}
        link={selectedLink}
      />

      <ShareModal 
        isOpen={!!activeShareLink}
        onClose={() => setActiveShareLink(null)}
        slug={activeShareLink?.slug || ""}
        platform={activeShareLink?.platform || ""}
      />
    </div>
  );
};

export default QuickLinkGenerator;
