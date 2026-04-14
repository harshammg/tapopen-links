import React from "react";
import { Button } from "@/components/ui/button";
import { Copy, Check, Share2, ArrowRight, Trash2, QrCode, Pencil, Eye } from "lucide-react";
import { Link as LinkType } from "@/types";

interface LinkItemProps {
  link: LinkType;
  copied: string | null;
  onCopy: (slug: string) => void;
  onDelete: (slug: string) => void;
  onEdit: (link: LinkType) => void;
  onAnalytics: (link: LinkType) => void;
  onShare: (link: { slug: string; platform: string }) => void;
}

const LinkItem: React.FC<LinkItemProps> = ({ 
  link, 
  copied, 
  onCopy, 
  onDelete, 
  onEdit, 
  onAnalytics, 
  onShare 
}) => {
  return (
    <div className="bg-card border border-border rounded-2xl p-4 flex flex-col gap-3 hover:border-primary transition-all group/item">
      {/* Platform badge + Clicks */}
      <div className="flex items-center justify-between">
        <span className="bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full">
          {link.platform}
        </span>
        <div className="flex items-center gap-2">
          <a
            href={`${window.location.origin}/${link.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 bg-muted/40 hover:bg-muted/60 px-2.5 py-1 rounded-lg transition-all group/preview"
            title="Preview Link"
          >
            <Eye className="h-3 w-3 text-muted-foreground group-hover/preview:text-primary transition-colors" />
            <span className="text-[9px] uppercase font-bold text-muted-foreground tracking-widest">Preview</span>
          </a>
          
          <button
            onClick={() => onAnalytics(link)}
            className="flex items-center gap-1 bg-muted/30 px-2.5 py-1 rounded-lg hover:bg-muted/50 transition-colors group/clicks"
          >
            <span className="text-sm font-bold text-primary">{link.clicks}</span>
            <span className="text-[8px] uppercase font-bold text-muted-foreground tracking-tight flex items-center gap-1">
              Clicks
              <ArrowRight className="h-2 w-2 opacity-0 group-hover/clicks:opacity-100 -translate-x-1 group-hover/clicks:translate-x-0 transition-all" />
            </span>
          </button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-primary rounded-lg transition-colors"
            onClick={() => onEdit(link)}
            title="Edit Link"
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
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
      <div className="flex flex-col gap-2 mt-3">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="flex-[1.5] h-10 rounded-xl font-bold text-[11px] md:text-xs"
            onClick={() => onCopy(link.slug)}
          >
            {copied === link.slug ? <Check className="h-3.5 w-3.5 mr-1.5 text-success" /> : <Copy className="h-3.5 w-3.5 mr-1.5" />}
            {copied === link.slug ? "Copied!" : "Copy Link"}
          </Button>

          <Button
            variant="outline"
            className="flex-1 h-10 px-3 rounded-xl font-bold text-[11px] md:text-xs bg-primary/5 border-primary/20 hover:bg-primary/10 text-primary flex items-center justify-center"
            onClick={() => onShare({ slug: link.slug, platform: link.platform })}
          >
            <Share2 className="h-3.5 w-3.5 mr-1.5" /> Share
          </Button>

          <div className="flex items-center gap-1.5 ml-auto">
            <Button
              variant="outline"
              className="h-10 w-10 p-0 rounded-xl font-bold bg-primary/5 border-primary/20 hover:bg-primary/10 text-primary flex items-center justify-center shrink-0"
              onClick={() => onShare({ slug: link.slug, platform: link.platform })}
              title="Get QR Code"
            >
              <QrCode className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 text-muted-foreground hover:text-destructive rounded-xl transition-colors shrink-0"
              onClick={() => onDelete(link.slug)}
              title="Delete Link"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LinkItem;
