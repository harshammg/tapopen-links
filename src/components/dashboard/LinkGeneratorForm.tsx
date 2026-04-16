import React from "react";
import { Zap, ClipboardPaste, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PlatformConfig } from "@/types";

interface LinkGeneratorFormProps {
  url: string;
  setUrl: (url: string) => void;
  customSlug: string;
  setCustomSlug: (slug: string) => void;
  isGenerating: boolean;
  onPaste: () => void;
  onGenerate: () => void;
  detectedPlatform?: PlatformConfig;
  aliasError?: string | null;
  setAliasError?: (err: string | null) => void;
}

const LinkGeneratorForm: React.FC<LinkGeneratorFormProps> = ({
  url,
  setUrl,
  customSlug,
  setCustomSlug,
  isGenerating,
  onPaste,
  onGenerate,
  detectedPlatform,
  aliasError,
  setAliasError
}) => {
  return (
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
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
            <button
              type="button"
              onClick={onPaste}
              className="p-1.5 hover:bg-muted rounded-md transition-colors text-muted-foreground hover:text-primary"
              title="Paste from clipboard"
            >
              <ClipboardPaste className="h-4 w-4 md:h-5 md:w-5" />
            </button>
            {isGenerating && <div className="animate-spin rounded-full h-4 w-4 md:h-5 md:w-5 border-b-2 border-primary" />}
          </div>
        </div>

        <div className="space-y-1.5 px-0.5">
          <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">
            Custom Alias (Optional)
          </label>
          <div className="flex items-center gap-1.5 md:gap-2">
            <div className="bg-muted px-2 md:px-3 py-3 rounded-xl text-[10px] md:text-xs font-bold text-muted-foreground border border-border whitespace-nowrap">
              tapopen.online/
            </div>
            <input
              type="text"
              placeholder="my-cool-link"
              value={customSlug}
              onChange={(e) => {
                setCustomSlug(e.target.value);
                if (setAliasError) setAliasError(null);
              }}
              className={`flex-1 min-w-0 bg-background border ${aliasError ? 'border-destructive focus:border-destructive' : 'border-border focus:border-primary'} rounded-xl px-3 md:px-4 py-3 text-sm font-medium transition-all focus:outline-none`}
            />
          </div>
          {aliasError && <p className="text-[10px] text-destructive font-bold uppercase tracking-tight ml-1">{aliasError}</p>}
        </div>

        {detectedPlatform && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/5 border border-primary/20 rounded-full w-max animate-fade-in-up">
            <detectedPlatform.icon className="h-3 w-3 md:h-4 md:w-4 text-primary" />
            <span className="text-[10px] md:text-xs font-medium text-primary uppercase tracking-wider">{detectedPlatform.name} Detected</span>
          </div>
        )}

        <Button
          size="lg"
          className="w-full h-14 text-base font-bold"
          variant="gradient"
          disabled={!url || isGenerating}
          onClick={onGenerate}
        >
          {isGenerating ? "Generating..." : "Generate Deep Link"} <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};

export default LinkGeneratorForm;
