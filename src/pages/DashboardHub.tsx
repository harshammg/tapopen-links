import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Layout, Briefcase, BookOpen, ArrowRight, Globe, 
  User, Check, Loader2, Palette, Box, Type, MousePointer2, Copy, ExternalLink, QrCode 
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LivePreview } from "@/components/dashboard/LivePreview";

const DashboardHub = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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

  const saveCustomization = async (updates: any) => {
    setSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

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

      const { error } = await supabase
        .from("profiles")
        .update({ customization: newCustomization })
        .eq("id", session.user.id);

      if (error) throw error;
      setProfile({ ...profile, customization: newCustomization });
      toast.success("Appearance updated!");
    } catch (err) {
      toast.error("Failed to update appearance");
    } finally {
      setSaving(false);
    }
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
    { title: "Link Page", description: "Links & Store items", icon: Layout, path: "/dashboard/links", color: "bg-blue-500" },
    { title: "Portfolio", description: "Professional Resume", icon: Briefcase, path: "/dashboard/portfolio", color: "bg-purple-500" },
    { title: "Blogs", description: "Articles & Stories", icon: BookOpen, path: "/dashboard/blogs", color: "bg-emerald-500" }
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
    <div className="max-w-6xl mx-auto px-6 py-12 pb-32">
      <div className="mb-12">
        <h1 className="text-4xl font-bold tracking-tight mb-2">My Dashboard</h1>
        <p className="text-muted-foreground mb-6">Manage your entire digital world and appearance.</p>
        <div className="lg:hidden">
          {actionButtons}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left: Navigation & Appearance */}
        <div className="lg:col-span-8 space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {hubItems.map((item) => (
              <button 
                key={item.title}
                onClick={() => navigate(item.path)}
                className="group p-6 rounded-[2rem] bg-card border border-border hover:border-primary/50 hover:shadow-xl transition-all text-left space-y-4"
              >
                <div className={`w-12 h-12 rounded-2xl ${item.color} flex items-center justify-center text-white shadow-lg`}>
                  <item.icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">{item.title}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-1">{item.description}</p>
                </div>
              </button>
            ))}
          </div>

            <div className="bg-card border border-border rounded-[2.5rem] p-8 shadow-sm space-y-6">
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
                      <sec.icon className="w-4 h-4 opacity-50" />
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
            <div className="bg-card border border-border rounded-[2.5rem] p-8 shadow-sm space-y-6">
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Landing Page Setting */}
            <div className="bg-card border border-border rounded-[2.5rem] p-8 shadow-sm h-full">
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
            <div className="bg-card border border-border rounded-[2.5rem] p-8 shadow-sm h-full">
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
                  value={cust.background?.value || "#ffffff"}
                  onChange={(e) => saveCustomization({ background: { type: "color", value: e.target.value } })}
                  className="w-12 h-12 p-1 rounded-xl cursor-pointer bg-transparent"
                />
                <Input 
                  value={cust.background?.value || "#ffffff"}
                  onChange={(e) => saveCustomization({ background: { type: "color", value: e.target.value } })}
                  className="flex-1 h-12 font-mono text-sm rounded-xl"
                />
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-[2.5rem] p-8 shadow-sm">
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
                      value={cust.buttonColor || "#1d4ed8"}
                      onChange={(e) => saveCustomization({ buttonColor: e.target.value })}
                      className="w-12 h-12 p-1 rounded-xl cursor-pointer bg-transparent"
                    />
                    <Input 
                      value={cust.buttonColor || "#1d4ed8"}
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
                      value={cust.profileTextColor || "#000000"}
                      onChange={(e) => saveCustomization({ profileTextColor: e.target.value })}
                      className="w-12 h-12 p-1 rounded-xl cursor-pointer bg-transparent"
                    />
                    <Input 
                      value={cust.profileTextColor || "#000000"}
                      onChange={(e) => saveCustomization({ profileTextColor: e.target.value })}
                      className="flex-1 h-12 font-mono text-sm rounded-xl"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-4">
                  <label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Button Shape</label>
                  <div className="grid grid-cols-2 gap-2">
                    {["filled", "outline", "soft", "pill"].map(style => (
                      <button 
                        key={style}
                        onClick={() => saveCustomization({ buttonStyle: style })}
                        className={`py-3 rounded-xl border-2 text-[10px] font-bold uppercase transition-all ${cust.buttonStyle === style ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground"}`}
                      >
                        {style}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Corner Rounding</label>
                  <input 
                    type="range" min="0" max="24" 
                    value={cust.cornerRadius || 8}
                    onChange={(e) => saveCustomization({ cornerRadius: parseInt(e.target.value) })}
                    className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                  <div className="flex justify-between text-[10px] font-bold text-muted-foreground uppercase px-1">
                    <span>Sharp</span>
                    <span>Round</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Real-time Live Preview */}
        <div className="lg:col-span-4 sticky top-24">
          <div className="space-y-6">
            <div className="hidden lg:flex flex-col gap-3">
              {actionButtons}
            </div>

            <div className="text-center">
              <h3 className="text-sm font-black uppercase tracking-widest text-primary mb-2">Live Preview</h3>
              <p className="text-[10px] text-muted-foreground">See your changes in real-time</p>
            </div>
            <LivePreview 
              profile={profile} 
              links={links} 
              portfolio={portfolio} 
              blogs={blogs} 
            />
            {saving && (
              <div className="flex items-center justify-center gap-2 text-primary font-black text-[10px] uppercase animate-pulse bg-primary/5 py-3 rounded-2xl border border-primary/10">
                <Loader2 className="w-3 h-3 animate-spin" /> Auto-Saving...
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHub;
