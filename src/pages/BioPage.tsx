import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, GripVertical, Eye, EyeOff, Copy, Check } from "lucide-react";
import { sampleLinks } from "@/lib/data";

const themes = [
  { name: "Dark", bg: "#080810", text: "#F0EEF8" },
  { name: "Light", bg: "#F5F5F7", text: "#1a1a2e" },
  { name: "Violet", bg: "#1a0a3e", text: "#F0EEF8" },
  { name: "Minimal", bg: "#0f0f0f", text: "#ffffff" },
];

const BioPage = () => {
  const [activeTheme, setActiveTheme] = useState(0);
  const [displayName, setDisplayName] = useState("Harsha K");
  const [bio, setBio] = useState("Creator & Developer 🚀");
  const [links, setLinks] = useState(
    sampleLinks.slice(0, 4).map((l) => ({ ...l, visible: true, label: `My ${l.platform}` }))
  );
  const [copied, setCopied] = useState(false);

  const theme = themes[activeTheme];

  const handleCopyBioLink = () => {
    navigator.clipboard.writeText("https://tapopen.app/harsha");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-6 md:p-8">
      <h1 className="text-2xl md:text-3xl font-display font-bold mb-8">Bio Page</h1>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Editor */}
        <div className="space-y-6">
          {/* Profile */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="font-display font-semibold mb-4">Profile</h3>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-full gradient-bg flex items-center justify-center text-primary-foreground text-2xl font-bold">
                {displayName[0]}
              </div>
              <Button variant="outline" size="sm">Upload photo</Button>
            </div>
            <div className="space-y-3">
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Display name"
                className="w-full bg-background border border-border rounded-md px-4 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors"
              />
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Bio"
                rows={2}
                className="w-full bg-background border border-border rounded-md px-4 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors resize-none"
              />
            </div>
          </div>

          {/* Links */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="font-display font-semibold mb-4">Links</h3>
            <div className="space-y-3">
              {links.map((link, i) => (
                <div key={link.slug} className="flex items-center gap-3 bg-background border border-border rounded-md p-3">
                  <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab shrink-0" />
                  <link.icon className="h-4 w-4 shrink-0" style={{ color: link.color }} />
                  <div className="flex-1 min-w-0">
                    <input
                      type="text"
                      value={link.label}
                      onChange={(e) => {
                        const updated = [...links];
                        updated[i].label = e.target.value;
                        setLinks(updated);
                      }}
                      className="bg-transparent text-sm w-full focus:outline-none"
                    />
                    <p className="font-mono text-xs text-muted-foreground truncate">{link.originalUrl}</p>
                  </div>
                  <button
                    onClick={() => {
                      const updated = [...links];
                      updated[i].visible = !updated[i].visible;
                      setLinks(updated);
                    }}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </button>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4">
              <Plus className="h-4 w-4" /> Add Link
            </Button>
          </div>

          {/* Theme */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="font-display font-semibold mb-4">Theme</h3>
            <div className="flex gap-3">
              {themes.map((t, i) => (
                <button
                  key={t.name}
                  onClick={() => setActiveTheme(i)}
                  className={`w-14 h-14 rounded-lg border-2 transition-all ${activeTheme === i ? "border-primary glow" : "border-border"}`}
                  style={{ backgroundColor: t.bg }}
                >
                  <span className="text-xs font-medium" style={{ color: t.text }}>{t.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Phone Preview */}
        <div className="flex flex-col items-center">
          <div className="w-[300px] rounded-[2.5rem] border-4 border-border p-2 bg-card">
            {/* Notch */}
            <div className="flex justify-center mb-2">
              <div className="w-28 h-6 bg-background rounded-full" />
            </div>
            <div className="rounded-[2rem] overflow-hidden" style={{ backgroundColor: theme.bg, minHeight: 520 }}>
              <div className="flex flex-col items-center px-6 py-8">
                <div className="w-20 h-20 rounded-full gradient-bg flex items-center justify-center text-primary-foreground text-3xl font-bold mb-3">
                  {displayName[0]}
                </div>
                <h3 className="font-display font-bold text-lg" style={{ color: theme.text }}>{displayName}</h3>
                <p className="text-sm opacity-70 mb-6" style={{ color: theme.text }}>{bio}</p>
                <div className="w-full space-y-3">
                  {links.filter((l) => l.visible).map((link) => (
                    <button
                      key={link.slug}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-lg border transition-all hover:scale-[1.02]"
                      style={{ borderColor: `${link.color}30`, backgroundColor: `${link.color}08` }}
                    >
                      <link.icon className="h-4 w-4" style={{ color: link.color }} />
                      <span className="text-sm font-medium flex-1 text-left" style={{ color: theme.text }}>{link.label}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-pill bg-success/20 text-success">Opens in app ✓</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <Button variant="outline" className="mt-6" onClick={handleCopyBioLink}>
            {copied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
            {copied ? "Copied!" : "Copy Bio Link"} — tapopen.app/harsha
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BioPage;
