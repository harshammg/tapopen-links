import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, Copy, ExternalLink, Globe, Briefcase, BookOpen, Check, Layout, AlertCircle, Loader2, Eye, Share2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function ProfilesDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<any>({ full_name: "", handle: "", bio: "" });

  useEffect(() => {
    async function fetchProfile() {
      try {
        // Guard: supabase may be null if env vars are not set
        if (!supabase) {
          setLoading(false);
          return;
        }

        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError || !session) {
          navigate("/auth/login");
          return;
        }

        let { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();

        if (error && error.code === 'PGRST116') {
          // No profile row found — auto-create one
          const baseHandle = session.user.email?.split('@')[0]?.replace(/[^a-z0-9_]/gi, '').toLowerCase()
            || `user${Math.random().toString(36).substr(2, 5)}`;

          const { data: newProfile, error: upsertError } = await supabase
            .from("profiles")
            .upsert({
              id: session.user.id,
              email: session.user.email,
              handle: baseHandle,
              full_name: session.user.user_metadata?.full_name || baseHandle,
              bio: ""
            }, { onConflict: 'id' })
            .select()
            .single();

          if (!upsertError && newProfile) {
            data = newProfile;
          }
        }

        if (data) {
          setProfile(data);
        } else {
          setProfile({
            full_name: session.user.user_metadata?.full_name || "User",
            handle: session.user.email?.split('@')[0] || "user",
            bio: ""
          });
        }
      } catch (err) {
        console.error("ProfilesDashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, [navigate]);

  const saveProfile = async (updates: any) => {
    setSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { error } = await supabase
        .from("profiles")
        .upsert({
          id: session.user.id,
          email: session.user.email,
          handle: profile.handle,
          full_name: profile.full_name,
          bio: profile.bio,
          ...updates
        }, { onConflict: 'id' });

      if (error) throw error;
      setProfile((prev: any) => ({ ...prev, ...updates }));
      toast.success("Profile saved");
    } catch (err) {
      toast.error("Failed to sync profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="w-8 h-8 text-slate-500 animate-spin" />
      </div>
    );
  }

  const profileUrl = `${window.location.origin}/${profile?.handle}`;

  return (
    <div className="max-w-5xl mx-auto px-6 py-10 font-inter text-[#111827]">
      
      {/* Header */}
      <header className="mb-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#E5E7EB] pb-6">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-purple-600">Profiles Product</div>
          <h1 className="text-3xl font-extrabold tracking-tight mt-1">Profiles Console</h1>
          <p className="text-xs text-[#6B7280] mt-1">Manage your biographical page links, store items, portfolio resume, and blog posts.</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className="border-[#E5E7EB] text-[#6B7280] hover:bg-[#F8FAFC] rounded-lg text-xs py-2 font-semibold"
            onClick={() => {
              navigator.clipboard.writeText(profileUrl);
              toast.success("Profile URL copied!");
            }}
          >
            <Copy className="w-3.5 h-3.5 mr-1.5" />
            Copy URL
          </Button>
          <Button 
            className="bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs py-2 font-semibold"
            onClick={() => window.open(`/${profile?.handle}`, "_blank")}
          >
            <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
            View Live
          </Button>
        </div>
      </header>

      {/* Grid Content */}
      <div className="grid gap-8 lg:grid-cols-12">
        
        {/* Left Forms */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Shortcuts Launcher to sub-sections */}
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { label: "Link Editor", desc: "URLs & gumroad stores", icon: Globe, path: "/console/links" },
              { label: "Portfolio Items", desc: "Experience & CV items", icon: Briefcase, path: "/console/portfolio" },
              { label: "Markdown Blogs", desc: "Simple profile articles", icon: BookOpen, path: "/console/blogs" },
            ].map((link, idx) => {
              const Icon = link.icon;
              return (
                <button
                  key={idx}
                  onClick={() => navigate(link.path)}
                  className="flex flex-col text-left p-5 border border-[#E5E7EB] hover:border-purple-600 rounded-xl bg-white hover:bg-purple-50/5 transition-all"
                >
                  <Icon className="w-5 h-5 text-purple-600 mb-3" />
                  <span className="text-xs font-bold text-[#111827]">{link.label}</span>
                  <span className="text-[10px] text-[#6B7280] mt-1">{link.desc}</span>
                </button>
              );
            })}
          </div>

          {/* Profile fields card */}
          <div className="border border-[#E5E7EB] rounded-xl p-6 bg-white space-y-6">
            <h3 className="text-sm font-bold text-[#111827] flex items-center gap-2">
              <User className="w-4 h-4 text-purple-600" />
              Biographical Details
            </h3>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wide">Display Name</label>
                <Input 
                  value={profile?.full_name || ""} 
                  onChange={e => setProfile({...profile, full_name: e.target.value})} 
                  onBlur={e => saveProfile({ full_name: e.target.value })}
                  placeholder="Your Name" 
                  className="h-10 rounded-lg text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wide">Public handle slug</label>
                <Input 
                  value={profile?.handle || ""} 
                  onChange={e => setProfile({...profile, handle: e.target.value})} 
                  onBlur={e => saveProfile({ handle: e.target.value })}
                  placeholder="handle" 
                  className="h-10 rounded-lg text-xs"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wide">Biographical Summary</label>
              <Input 
                value={profile?.bio || ""} 
                onChange={e => setProfile({...profile, bio: e.target.value})} 
                onBlur={e => saveProfile({ bio: e.target.value })}
                placeholder="Tell the world about yourself..." 
                className="h-10 rounded-lg text-xs"
              />
            </div>
          </div>

          {/* Profile Pages Visibility Card */}
          <div className="border border-[#E5E7EB] rounded-xl p-6 bg-white space-y-6">
            <div>
              <h3 className="text-sm font-bold text-[#111827] flex items-center gap-2">
                <Layout className="w-4 h-4 text-purple-600" />
                Page Visibility
              </h3>
              <p className="text-xs text-[#6B7280] mt-1">Select which pages are visible on your public profile.</p>
            </div>

            <div className="space-y-4">
              {[
                { id: "links", label: "Links & Stores", desc: "Show your regular links and gumroad products.", icon: Globe },
                { id: "portfolio", label: "Portfolio & Resume", desc: "Show your work experience and education.", icon: Briefcase },
                { id: "blogs", label: "Blogs & Articles", desc: "Show your markdown written articles.", icon: BookOpen },
              ].map(item => {
                const isVisible = profile?.customization?.sections_visibility?.[item.id] !== false;
                const Icon = item.icon;
                return (
                  <div key={item.id} className="flex items-center justify-between p-4 border border-[#E5E7EB] rounded-xl hover:border-purple-200 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-[#F8FAFC] flex items-center justify-center">
                        <Icon className="w-5 h-5 text-[#9CA3AF]" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-[#111827]">{item.label}</div>
                        <div className="text-[10px] text-[#6B7280] mt-0.5">{item.desc}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        const currentVis = profile?.customization?.sections_visibility || { links: true, portfolio: true, blogs: true };
                        const newVis = { ...currentVis, [item.id]: !isVisible };
                        const newCustomization = { ...(profile?.customization || {}), sections_visibility: newVis };
                        setProfile({ ...profile, customization: newCustomization });
                        saveProfile({ customization: newCustomization });
                      }}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${isVisible ? 'bg-purple-600' : 'bg-gray-200'}`}
                    >
                      <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${isVisible ? 'translate-x-5' : 'translate-x-0'}`} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Locked theme banner */}
          <div className="border border-[#E5E7EB] rounded-xl p-5 bg-[#F8FAFC] flex gap-3.5 items-start">
            <AlertCircle className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-[#111827]">Premium Default Layout Active</h4>
              <p className="text-[11px] text-[#6B7280] mt-1 leading-relaxed">
                In order to guarantee instant mobile load times and a premium, clean layout, custom font types, background gradients, cyberpunk neon styles, and animation sets are disabled. Your profile uses the default light theme layout template.
              </p>
            </div>
          </div>

        </div>

        {/* Right Preview column */}
        <div className="lg:col-span-4 flex justify-center lg:justify-end">
          <div className="w-full max-w-[280px] border border-[#E5E7EB] bg-white rounded-2xl p-6 text-center select-none shadow-sm h-max">
            <div className="w-14 h-14 rounded-full bg-slate-200 mx-auto mb-3 flex items-center justify-center font-bold text-slate-700">
              {(profile?.full_name || "").substring(0, 2).toUpperCase() || "H"}
            </div>
            <div className="text-xs font-bold text-[#111827]">{profile?.full_name || "Harsha Dev"}</div>
            <p className="text-[10px] text-[#6B7280] mt-1 px-2 leading-relaxed">{profile?.bio || "Tell the world about yourself..."}</p>

            <div className="mt-6 border-t border-[#E5E7EB] pt-4 text-[10px] text-[#6B7280] font-semibold">
              Live Mock Preview
            </div>
          </div>
        </div>

      </div>

      {/* Mobile Floating Preview Bar */}
      <div className="lg:hidden fixed bottom-6 left-6 right-6 z-40">
        <div className="flex items-center gap-2 bg-white/80 backdrop-blur-md border border-[#E5E7EB] rounded-full shadow-2xl p-1.5">
          <Button 
            onClick={() => window.open(`/${profile?.handle}`, "_blank")}
            className="flex-1 h-11 bg-transparent text-[#111827] font-bold flex items-center justify-center gap-2 hover:bg-black/5 shadow-none rounded-full"
          >
            <Eye className="w-4 h-4" />
            View Preview
          </Button>
          
          <div className="w-px h-6 bg-[#E5E7EB] mx-1"></div>

          <Button
            size="icon"
            onClick={() => {
              navigator.clipboard.writeText(profileUrl);
              toast.success("Profile URL copied!");
            }}
            className="w-11 h-11 shrink-0 bg-transparent text-[#6B7280] hover:text-[#111827] hover:bg-black/5 shadow-none rounded-full"
            title="Copy URL"
          >
            <Copy className="w-4 h-4" />
          </Button>

          <Button
            size="icon"
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: `${profile?.full_name}'s Profile`,
                  url: profileUrl
                }).catch(console.error);
              } else {
                navigator.clipboard.writeText(profileUrl);
                toast.success("Profile URL copied!");
              }
            }}
            className="w-11 h-11 shrink-0 bg-[#111827] text-white hover:bg-black shadow-none rounded-full"
            title="Share"
          >
            <Share2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

    </div>
  );
}
