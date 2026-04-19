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
  onGenerate: (skip?: boolean) => void;
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
        <div className="space-y-4">
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
        </div>

        <div className="space-y-3 px-0.5">
          <div className="flex justify-between items-center">
            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">
              Custom Alias (Optional)
            </label>
            <span className="text-[10px] text-primary font-bold uppercase tracking-wider">tapopen.online/</span>
          </div>
          <input
            type="text"
            placeholder="my-cool-link"
            value={customSlug}
            disabled={isGenerating}
            onChange={(e) => {
              setCustomSlug(e.target.value);
              if (setAliasError) setAliasError(null);
            }}
            className={`w-full bg-background border ${aliasError ? 'border-destructive focus:border-destructive' : 'border-border focus:border-primary'} rounded-xl px-4 py-3 text-sm font-medium transition-all focus:outline-none`}
          />
          {aliasError && (
            <div className="mt-2 animate-fade-in">
              <p className="text-[10px] text-destructive font-bold uppercase tracking-tight ml-1">{aliasError}</p>
            </div>
          )}
        </div>

        {detectedPlatform && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/5 border border-primary/20 rounded-full w-max animate-fade-in-up">
            <detectedPlatform.icon className="h-3 w-3 md:h-4 md:w-4 text-primary" />
            <span className="text-[10px] md:text-xs font-medium text-primary uppercase tracking-wider">{detectedPlatform.name} Detected</span>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            size="lg"
            className="flex-[2] h-16 md:h-18 lg:h-14 text-lg sm:text-base font-bold"
            variant="gradient"
            disabled={!url || isGenerating}
            onClick={() => onGenerate()}
          >
            {isGenerating ? "Generating..." : "Generate Deep Link"} <ArrowRight className="ml-2 h-5 w-5" />
          </Button>

          {aliasError && (
            <Button 
              size="lg"
              variant="outline" 
              className="flex-1 h-16 md:h-18 lg:h-14 text-base sm:text-sm font-bold border-destructive/30 text-destructive hover:bg-destructive/5 hover:text-destructive rounded-xl flex items-center justify-center gap-2"
              onClick={() => onGenerate(true)}
              disabled={isGenerating}
            >
              <Zap className="h-4 w-4" /> Clear & Generate
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default LinkGeneratorForm;
