import React from "react";
import { Zap, ClipboardPaste, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PlatformConfig } from "@/types";

interface LinkGeneratorFormProps {
  url: string;
  setUrl: (url: string) => void;
  customSlug?: string;
  setCustomSlug?: (slug: string) => void;
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
  aliasError,
  setAliasError,
  isGenerating,
  onPaste,
  onGenerate,
  detectedPlatform,
}) => {
  return (
    <div className="bg-[#F8FAFC] border border-[#E5E7EB] rounded-2xl p-6 shadow-sm relative overflow-hidden text-left">
      <div className="flex items-center justify-between mb-4">
        <div className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest">
          Create New Redirect
        </div>
        {detectedPlatform && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white border border-[#E5E7EB] rounded-full shadow-sm animate-fade-in-up">
            <detectedPlatform.icon className="h-3 w-3 text-blue-600" />
            <span className="text-[9px] font-bold text-[#6B7280] uppercase tracking-wider">{detectedPlatform.name} Detected</span>
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-[2]">
          <input
            type="url"
            inputMode="url"
            placeholder="Paste your long link here..."
            value={url}
            disabled={isGenerating}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={e => e.key === "Enter" && onGenerate()}
            className="w-full h-12 px-4 pr-10 rounded-xl bg-white border border-[#E5E7EB] text-sm text-[#111827] font-medium focus:outline-none focus:border-blue-500 transition-colors placeholder:text-[#9CA3AF] disabled:opacity-50"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
            <button
              type="button"
              onClick={onPaste}
              className="p-1 hover:bg-[#F8FAFC] rounded transition-colors text-[#9CA3AF] hover:text-[#111827]"
              title="Paste from clipboard"
            >
              <ClipboardPaste className="h-4 w-4" />
            </button>
          </div>
        </div>

        {setCustomSlug && (
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Custom alias (optional)"
              value={customSlug || ""}
              disabled={isGenerating}
              onChange={(e) => {
                setCustomSlug(e.target.value);
                if (setAliasError) setAliasError(null);
              }}
              onKeyDown={e => e.key === "Enter" && onGenerate()}
              className={`w-full h-12 px-4 rounded-xl bg-white border ${aliasError ? 'border-red-500' : 'border-[#E5E7EB]'} text-sm text-[#111827] font-medium focus:outline-none focus:border-blue-500 transition-colors placeholder:text-[#9CA3AF] disabled:opacity-50`}
            />
            {aliasError && (
              <div className="absolute -bottom-5 left-1 text-[10px] text-red-500 font-semibold">
                {aliasError}
              </div>
            )}
          </div>
        )}

        <Button
          onClick={() => onGenerate()}
          disabled={!url || isGenerating}
          className="h-12 px-6 bg-[#111827] hover:bg-black text-white rounded-xl text-xs font-bold shrink-0 disabled:opacity-50 shadow-none"
        >
          {isGenerating
            ? <><Loader2 className="w-4 h-4 mr-1.5 animate-spin" />Generating</>
            : <><Zap className="w-3.5 h-3.5 mr-1.5" />Shorten Link</>
          }
        </Button>
      </div>
    </div>
  );
};

export default LinkGeneratorForm;
