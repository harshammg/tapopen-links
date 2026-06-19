import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Layout, Briefcase, BookOpen, ArrowRight, Globe, Eye,
  User, Check, Loader2, Palette, Box, Type, MousePointer2, Copy, ExternalLink, QrCode 
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const DashboardHub = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showMobilePreview, setShowMobilePreview] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [links, setLinks] = useState<any[]>([]);
  const [portfolio, setPortfolio] = useState<any[]>([]);
  const [blogs, setBlogs] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;
        
        const { data: profileData } = await supabase.from("profiles").select("*").eq("id", session.user.id).single();
        if (profileData) setProfile(profileData);

        const { data: linkData } = await supabase.from("links").select("*").eq("user_id", session.user.id).order("sort_order");
        if (linkData) setLinks(linkData);

        const { data: portData } = await supabase.from("portfolio_items").select("*").eq("user_id", session.user.id).order("created_at", { ascending: false });
        if (portData) setPortfolio(portData);

        const { data: blogData } = await supabase.from("blog_posts").select("*").eq("user_id", session.user.id).order("created_at", { ascending: false });
        if (blogData) setBlogs(blogData);

      } catch (err) { console.error(err); } finally { setLoading(false); }
    };
    fetchData();
  }, []);

  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);

  const saveCustomization = async (updates: any) => {
    // 1. INSTANT Optimistic Update for Real-Time Live Preview
    const newCustomization = {
      ...(profile?.customization || {
        background: { type: "color", value: "#ffffff" },
        buttonStyle: "filled",
        buttonColor: "#1d4ed8",
        buttonTextColor: "auto",
        cornerRadius: 8,
        profileTextColor: "dark"
      }),
      ...updates
    };

    setProfile((prev: any) => ({ ...prev, customization: newCustomization }));

    // 2. Debounced Network Request
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    
    saveTimerRef.current = setTimeout(async () => {
      setSaving(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const { error } = await supabase
          .from("profiles")
          .update({ customization: newCustomization })
          .eq("id", session.user.id);

        if (error) throw error;
        // Silent save for seamless experience
      } catch (err) {
        toast.error("Failed to sync appearance");
      } finally {
        setSaving(false);
      }
    }, 500);
  };

  const saveProfile = async (updates: any) => {
    setSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", session.user.id);

      if (error) throw error;
      setProfile({ ...profile, ...updates });
      toast.success("Profile updated!");
    } catch (err) {
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const hubItems = [
    { title: "Link Page", description: "Links & Store items", icon: Layout, path: "/dashboard/links" },
    { title: "Portfolio", description: "Professional Resume", icon: Briefcase, path: "/dashboard/portfolio" },
    { title: "Blogs", description: "Articles & Stories", icon: BookOpen, path: "/dashboard/blogs" }
  ];

  if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>;

  const cust = profile?.customization || {};

  const actionButtons = (
    <div className="grid grid-cols-2 gap-3">
      <Button 
        variant="outline" 
        className="h-11 rounded-2xl font-bold border-border bg-card hover:bg-muted"
        onClick={() => {
          const url = `${window.location.origin}/${profile?.handle}`;
          navigator.clipboard.writeText(url);
          toast.success("Link copied to clipboard!");
        }}
      >
        <Copy className="w-4 h-4 mr-2" /> Copy Link
      </Button>
      <Button 
        className="h-11 rounded-2xl font-bold shadow-xl bg-primary text-primary-foreground hover:bg-primary/90"
        onClick={() => window.open(`/${profile?.handle}`, "_blank")}
      >
        <ExternalLink className="w-4 h-4 mr-2" /> View Live
      </Button>
    </div>
  );

  return (
    <>


    <div className="flex flex-col xl:flex-row justify-center gap-[32px] px-4 md:px-6 py-8 md:py-12 pb-32 max-w-[1000px] mx-auto w-full">
      
      {/* ---------------- CENTER FEED CONTENT (max 600px) ---------------- */}
      <div className="flex-1 w-full max-w-[600px] mx-auto space-y-10">
        <div className="mb-6 md:mb-12">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">My Dashboard</h1>
          <p className="text-sm md:text-base text-muted-foreground mb-6">Manage your entire digital world and appearance.</p>
          <div className="xl:hidden">
            {actionButtons}
          </div>
        </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {hubItems.map((item) => (
              <button 
                key={item.title}
                onClick={() => navigate(item.path)}
                className="group p-6 glass-panel hover:border-primary/50 transition-all text-left space-y-4"
              >
                <div>
                  <h3 className="font-bold text-lg">{item.title}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-1">{item.description}</p>
                </div>
              </button>
            ))}
          </div>

            <div className="glass-panel p-8 space-y-6">
              <h3 className="text-sm font-black uppercase tracking-widest text-primary flex items-center gap-2">
                <Layout className="w-4 h-4" /> Section Visibility
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { id: "links", label: "Link Page", icon: Globe },
                  { id: "portfolio", label: "Portfolio", icon: Briefcase },
                  { id: "blogs", label: "Blogs", icon: BookOpen },
                  { id: "qr", label: "QR Code", icon: QrCode }
                ].map((sec) => (
                  <div key={sec.id} className="flex items-center justify-between p-4 rounded-2xl bg-muted/50 border border-border">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold">{sec.label}</span>
                    </div>
                    <input 
                      type="checkbox" 
                      className="w-5 h-5 accent-primary rounded-lg"
                      checked={profile?.customization?.sections_visibility?.[sec.id] !== false}
                      onChange={(e) => {
                        const newVisibility = {
                          ...(profile?.customization?.sections_visibility || { links: true, portfolio: true, blogs: true }),
                          [sec.id]: e.target.checked
                        };
                        const newCustomization = {
                          ...(profile?.customization || {}),
                          sections_visibility: newVisibility
                        };
                        setProfile({ ...profile, customization: newCustomization });
                        saveProfile({ customization: newCustomization });
                      }}
                    />
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-muted-foreground ml-1">Unchecked sections will be hidden from your public profile menu.</p>
            </div>

            {/* Profile Basic Info */}
            <div className="glass-panel p-8 space-y-6">
            <h3 className="text-sm font-black uppercase tracking-widest text-primary flex items-center gap-2">
              <User className="w-4 h-4" /> Profile Info
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Display Name</label>
                <Input 
                  value={profile?.full_name || ""} 
                  onChange={e => setProfile({...profile, full_name: e.target.value})} 
                  onBlur={e => saveProfile({ full_name: e.target.value })}
                  placeholder="Your Name" 
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Public Handle</label>
                <Input 
                  value={profile?.handle || ""} 
                  onChange={e => setProfile({...profile, handle: e.target.value})} 
                  onBlur={e => saveProfile({ handle: e.target.value })}
                  placeholder="handle" 
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Bio</label>
              <Input 
                value={profile?.bio || ""} 
                onChange={e => setProfile({...profile, bio: e.target.value})} 
                onBlur={e => saveProfile({ bio: e.target.value })}
                placeholder="Tell the world about yourself..." 
              />
            </div>
          </div>

          {/* Theme Presets */}
          <div className="glass-panel p-8">
            <h3 className="text-sm font-black uppercase tracking-widest text-primary mb-6 flex items-center gap-2">
              <Palette className="w-4 h-4" /> Theme Presets
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button 
                onClick={() => saveCustomization({ background: { type: "color", value: "#ffffff" }, profileTextColor: "#000000", buttonColor: "#000000", buttonTextColor: "auto" })}
                className="p-6 rounded-2xl border-2 border-border hover:border-primary hover:scale-[1.02] active:scale-[0.98] transition-all text-left bg-white text-black shadow-md"
              >
                <h4 className="font-bold text-lg">Light</h4>
                <p className="text-xs opacity-60">Clean and bright</p>
              </button>
              <button 
                onClick={() => saveCustomization({ background: { type: "color", value: "#000000" }, profileTextColor: "#ffffff", buttonColor: "#ffffff", buttonTextColor: "auto" })}
                className="p-6 rounded-2xl border-2 border-border hover:border-primary hover:scale-[1.02] active:scale-[0.98] transition-all text-left bg-black text-white shadow-md"
              >
                <h4 className="font-bold text-lg">Dark</h4>
                <p className="text-xs opacity-60">Sleek and professional</p>
              </button>
              <button 
                onClick={() => saveCustomization({ background: { type: "color", value: "#0a0a2a" }, profileTextColor: "#00ffcc", buttonColor: "#ff00ff", buttonTextColor: "auto" })}
                className="p-6 rounded-2xl border-2 border-[#ff00ff]/30 hover:border-[#00ffcc] hover:scale-[1.02] active:scale-[0.98] transition-all text-left bg-[#0a0a2a] shadow-[0_0_15px_rgba(255,0,255,0.2)]"
              >
                <h4 className="font-bold text-lg text-[#00ffcc]">Cyberpunk</h4>
                <p className="text-xs text-[#ff00ff] opacity-80">Neon futuristic</p>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Landing Page Setting */}
            <div className="glass-panel p-8 h-full">
              <h3 className="text-sm font-black uppercase tracking-widest text-primary mb-6 flex items-center gap-2">
                <Globe className="w-4 h-4" /> Default Landing Page
              </h3>
              <div className="grid grid-cols-1 gap-3">
                {["all", "links", "portfolio", "blogs"].map((page) => (
                  <button
                    key={page}
                    onClick={() => saveCustomization({ defaultPage: page })}
                    className={`p-4 rounded-2xl border-2 transition-all flex items-center justify-between ${cust.defaultPage === page ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground"}`}
                  >
                    <span className="text-xs font-bold uppercase">{page === 'all' ? 'All (Hub)' : page}</span>
                    {cust.defaultPage === page && <Check className="w-4 h-4" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Background Selector */}
            <div className="glass-panel p-8 h-full">
              <h3 className="text-sm font-black uppercase tracking-widest text-primary mb-6 flex items-center gap-2">
                <Palette className="w-4 h-4" /> Background Color
              </h3>
              <div className="flex flex-wrap gap-3 mb-6">
                {["#ffffff", "#000000", "#1e293b", "#fff7ed", "#f0fdf4", "#f5f3ff"].map(c => (
                  <button 
                    key={c}
                    onClick={() => saveCustomization({ background: { type: "color", value: c } })}
                    className={`w-10 h-10 rounded-xl border-2 transition-all ${cust.background?.value === c ? "border-primary scale-110 shadow-lg" : "border-transparent"}`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
              <div className="flex items-center gap-4">
                <Input 
                  type="color" 
                  value={cust.background?.value || "#000000"}
                  onChange={(e) => saveCustomization({ background: { type: "color", value: e.target.value } })}
                  className="w-12 h-12 p-1 rounded-xl cursor-pointer bg-transparent"
                />
                <Input 
                  value={cust.background?.value || "#000000"}
                  onChange={(e) => saveCustomization({ background: { type: "color", value: e.target.value } })}
                  className="flex-1 h-12 font-mono text-sm rounded-xl"
                />
              </div>
            </div>
          </div>

          <div className="glass-panel p-8">
            <h3 className="text-sm font-black uppercase tracking-widest text-primary mb-8 flex items-center gap-2">
              <MousePointer2 className="w-4 h-4" /> Button Styles & Branding
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-6">
                <div className="space-y-4">
                  <label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Button Color</label>
                  <div className="flex items-center gap-3">
                    <Input 
                      type="color" 
                      value={cust.buttonColor || "#ffffff"}
                      onChange={(e) => saveCustomization({ buttonColor: e.target.value })}
                      className="w-12 h-12 p-1 rounded-xl cursor-pointer bg-transparent"
                    />
                    <Input 
                      value={cust.buttonColor || "#ffffff"}
                      onChange={(e) => saveCustomization({ buttonColor: e.target.value })}
                      className="flex-1 h-12 font-mono text-sm rounded-xl"
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Profile Text Color</label>
                  <div className="flex items-center gap-3">
                    <Input 
                      type="color" 
                      value={cust.profileTextColor || "#ffffff"}
                      onChange={(e) => saveCustomization({ profileTextColor: e.target.value })}
                      className="w-12 h-12 p-1 rounded-xl cursor-pointer bg-transparent"
                    />
                    <Input 
                      value={cust.profileTextColor || "#ffffff"}
                      onChange={(e) => saveCustomization({ profileTextColor: e.target.value })}
                      className="flex-1 h-12 font-mono text-sm rounded-xl"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ---------------- RIGHT STICKY PANEL (320px) ---------------- */}
        <div className="hidden xl:block w-[320px] shrink-0 relative">
          <div className="sticky top-8 space-y-6 flex flex-col items-center glass-panel p-6 pb-8">
            <div className="flex flex-col gap-3 w-full">
              {actionButtons}
            </div>

            <div className="text-center w-full">
              <h3 className="text-sm font-black uppercase tracking-widest text-primary mb-2">Live Profile</h3>
              <p className="text-[10px] text-muted-foreground">Click the button above to view your live profile in a new tab.</p>
            </div>
            {saving && (
              <div className="flex items-center justify-center gap-2 text-primary font-black text-[10px] uppercase animate-pulse bg-primary/5 w-full py-3 rounded-2xl border border-primary/10">
                <Loader2 className="w-3 h-3 animate-spin" /> Auto-Saving...
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default DashboardHub;
