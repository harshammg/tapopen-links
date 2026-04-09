import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Copy, Check, MoreVertical, TrendingUp, Link2, MousePointerClick, Globe } from "lucide-react";
import { sampleLinks } from "@/lib/data";

const MyLinks = () => {
  const [copied, setCopied] = useState<string | null>(null);
  const [showNewLink, setShowNewLink] = useState(true);
  const [newUrl, setNewUrl] = useState("");

  const handleCopy = (slug: string) => {
    navigator.clipboard.writeText(`https://${slug}`);
    setCopied(slug);
    setTimeout(() => setCopied(null), 2000);
  };

  const detectedPlatform = newUrl.includes("instagram") ? "Instagram" : newUrl.includes("youtube") ? "YouTube" : newUrl.includes("spotify") ? "Spotify" : null;

  const stats = [
    { label: "Total Links", value: "12", icon: Link2 },
    { label: "Total Clicks", value: "3,847", icon: MousePointerClick },
    { label: "App Opens", value: "3,201", icon: TrendingUp, highlight: true },
    { label: "Browser Fallbacks", value: "646", icon: Globe, muted: true },
  ];

  return (
    <div className="p-6 md:p-8 max-w-6xl">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl md:text-3xl font-display font-bold">My Links</h1>
        <Button variant="gradient" onClick={() => setShowNewLink(!showNewLink)}>
          <Plus className="h-4 w-4" /> New Link
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => (
          <div key={s.label} className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <s.icon className={`h-4 w-4 ${s.highlight ? "text-success" : s.muted ? "text-muted-foreground" : "text-primary"}`} />
              <span className="text-xs text-muted-foreground">{s.label}</span>
            </div>
            <p className={`text-2xl font-display font-bold ${s.highlight ? "text-success" : s.muted ? "text-muted-foreground" : ""}`}>
              {s.value}
            </p>
          </div>
        ))}
      </div>

      {/* New Link Panel */}
      {showNewLink && (
        <div className="bg-card border border-primary/20 rounded-lg p-6 mb-8 animate-slide-in-right glow">
          <h3 className="font-display font-semibold mb-4">Create New Deep Link</h3>
          <div className="space-y-4">
            <div>
              <input
                type="text"
                placeholder="Paste your link here..."
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                className="w-full bg-background border border-border rounded-md px-4 py-3 font-mono text-sm focus:outline-none focus:border-primary transition-colors"
              />
              {detectedPlatform && (
                <span className="inline-block mt-2 px-3 py-1 rounded-pill text-xs font-medium gradient-bg text-primary-foreground">
                  {detectedPlatform} detected
                </span>
              )}
            </div>
            {newUrl && (
              <div className="bg-background rounded-md p-3 border border-border">
                <p className="text-xs text-muted-foreground mb-1">Generated deep link:</p>
                <p className="font-mono text-sm text-primary">tapopen.app/your-slug</p>
              </div>
            )}
            <div>
              <input
                type="text"
                placeholder="Custom slug (optional)"
                className="w-full bg-background border border-border rounded-md px-4 py-3 font-mono text-sm focus:outline-none focus:border-primary transition-colors"
              />
            </div>
            <Button variant="gradient">Generate Deep Link</Button>
          </div>
        </div>
      )}

      {/* Links list */}
      <div className="space-y-3">
        {sampleLinks.map((link) => (
          <div key={link.slug} className="bg-card border border-border rounded-lg p-4 md:p-5 card-hover">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${link.color}15` }}>
                <link.icon className="h-5 w-5" style={{ color: link.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm">{link.platform}</span>
                  <span className="text-xs text-muted-foreground">• {link.created}</span>
                </div>
                <p className="font-mono text-xs text-muted-foreground truncate">{link.originalUrl}</p>
                <div className="flex items-center gap-2 mt-1">
                  <p className="font-mono text-xs text-primary">{link.slug}</p>
                  <button onClick={() => handleCopy(link.slug)} className="text-muted-foreground hover:text-primary transition-colors">
                    {copied === link.slug ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>
              <div className="hidden md:flex items-center gap-6">
                <div className="text-right">
                  <p className="text-sm font-medium">{link.clicks.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">clicks</p>
                </div>
                <div className="w-32">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-muted-foreground">App opens</span>
                    <span className="text-success font-medium">{link.appOpenRate}%</span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-success" style={{ width: `${link.appOpenRate}%` }} />
                  </div>
                </div>
                <button className="text-muted-foreground hover:text-foreground transition-colors">
                  <MoreVertical className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyLinks;
