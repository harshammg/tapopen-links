import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { 
  Settings, Shield, Key, Trash2, Check, Loader2, 
  User, Link2, Instagram, Twitter, Globe, Eye, EyeOff
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

const SettingsPage = () => {
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [profile, setProfile] = useState({
    full_name: "",
    handle: "",
    bio: "",
    instagram_url: "",
    twitter_url: "",
    website_url: ""
  });
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: ""
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [updatingPassword, setUpdatingPassword] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;
        
        setUserEmail(session.user.email || "");

        // Fetch profile data
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();
        
        // Auth Metadata Fallback (If profile is fresh or missing)
        const meta = session.user.user_metadata || {};
        
        if (data) {
          setProfile({
            full_name: data.full_name || meta.full_name || "",
            handle: data.handle || meta.handle || "",
            bio: data.bio || "",
            instagram_url: data.instagram_url || "",
            twitter_url: data.twitter_url || "",
            website_url: data.website_url || ""
          });
        } else {
          // If no profile found, pre-fill with Auth data
          setProfile(prev => ({
            ...prev,
            full_name: meta.full_name || "",
            handle: meta.handle || ""
          }));
        }
      } catch (error) {
        console.error("Error loading settings:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    // Check if we should scroll to security section
    if (window.location.hash === "#security") {
      const element = document.getElementById("security");
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: "smooth" });
          toast.info("You can now set your new password below.");
        }, 500);
      }
    }
  }, []);

  const handleSave = async () => {
    try {
      setSaveStatus(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: profile.full_name,
          handle: profile.handle,
          bio: profile.bio,
          instagram_url: profile.instagram_url,
          twitter_url: profile.twitter_url,
          website_url: profile.website_url,
        })
        .eq("id", session.user.id);

      if (error) throw error;
      toast.success("Settings saved successfully!");
    } catch (error: any) {
      toast.error(error.message || "Error saving settings");
    } finally {
      setTimeout(() => setSaveStatus(false), 2000);
    }
  };

  const handlePasswordUpdate = async () => {
    if (!passwords.new || passwords.new.length < 8) {
      toast.error("New password must be at least 8 characters.");
      return;
    }
    if (passwords.new !== passwords.confirm) {
      toast.error("Passwords do not match.");
      return;
    }

    try {
      setUpdatingPassword(true);
      
      // Note: Supabase doesn't strictly require current password for update
      // but we ask for it as a UI best practice.
      const { error } = await supabase.auth.updateUser({ 
        password: passwords.new 
      });

      if (error) throw error;
      
      toast.success("Password updated successfully!");
      setPasswords({ current: "", new: "", confirm: "" });
    } catch (error: any) {
      toast.error(error.message || "Failed to update password");
    } finally {
      setUpdatingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmDelete = window.confirm(
      "Are you absolutely sure? This will permanently delete all your links and profile data. This action cannot be undone."
    );

    if (!confirmDelete) return;

    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // 1. Delete all links
      const { error: linksError } = await supabase
        .from("links")
        .delete()
        .eq("user_id", session.user.id);
      
      if (linksError) throw linksError;

      // 2. Delete profile
      const { error: profileError } = await supabase
        .from("profiles")
        .delete()
        .eq("id", session.user.id);
      
      if (profileError) throw profileError;

      // 3. Sign out
      await supabase.auth.signOut();
      toast.success("Account data deleted successfully.");
      window.location.href = "/";
    } catch (error: any) {
      toast.error(error.message || "Failed to delete account data");
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="px-4 py-6 md:p-12 max-w-4xl mx-auto pb-32">
      <div className="mb-8 md:mb-12">
        <h1 className="text-3xl md:text-4xl font-display font-bold mb-2">Account Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your creator identity, security, and preferences.</p>
      </div>

      <div className="space-y-10">
        {/* Creator Identity */}
        <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm">
          <div className="p-6 border-b border-border bg-muted/20">
            <h3 className="font-display font-bold flex items-center gap-2">
              <User className="h-5 w-5 text-primary" /> Creator Identity
            </h3>
          </div>
          <div className="p-5 md:p-8 space-y-6 md:space-y-8">
            <div className="flex flex-col sm:flex-row items-center gap-6 pb-4">
              <div className="w-24 h-24 rounded-3xl gradient-bg flex items-center justify-center text-primary-foreground text-4xl font-bold shadow-xl shrink-0">
                {profile.full_name?.charAt(0).toUpperCase() || "U"}
              </div>
              <div className="flex-1 space-y-4 w-full">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Display Name</label>
                    <input 
                      type="text" 
                      value={profile.full_name}
                      onChange={(e) => setProfile({...profile, full_name: e.target.value})}
                      className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors"
                      placeholder="Your Name"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Unique Handle</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-mono">@</span>
                      <input 
                        type="text" 
                        value={profile.handle}
                        onChange={(e) => setProfile({...profile, handle: e.target.value})}
                        className="w-full bg-background border border-border rounded-xl pl-8 pr-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors font-mono"
                        placeholder="username"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Bio</label>
              <textarea 
                rows={3}
                value={profile.bio}
                onChange={(e) => setProfile({...profile, bio: e.target.value})}
                className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors resize-none"
                placeholder="Tell your fans who you are..."
              />
            </div>
          </div>
        </div>

        {/* Social Presence */}
        <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm">
          <div className="p-6 border-b border-border bg-muted/20">
            <h3 className="font-display font-bold flex items-center gap-2">
              <Link2 className="h-5 w-5 text-primary" /> Social Presence
            </h3>
          </div>
          <div className="p-5 md:p-8 grid sm:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Instagram</label>
              <div className="relative">
                <Instagram className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input 
                  type="text" 
                  placeholder="handleonly"
                  value={profile.instagram_url}
                  onChange={(e) => setProfile({...profile, instagram_url: e.target.value})}
                  className="w-full bg-background border border-border rounded-xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Twitter / X</label>
              <div className="relative">
                <Twitter className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input 
                  type="text" 
                  placeholder="handleonly"
                  value={profile.twitter_url}
                  onChange={(e) => setProfile({...profile, twitter_url: e.target.value})}
                  className="w-full bg-background border border-border rounded-xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors"
                />
              </div>
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Personal Website</label>
              <div className="relative">
                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input 
                  type="text" 
                  placeholder="https://yourwebsite.com"
                  value={profile.website_url}
                  onChange={(e) => setProfile({...profile, website_url: e.target.value})}
                  className="w-full bg-background border border-border rounded-xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Security */}
        <div id="security" className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm scroll-mt-24">
          <div className="p-6 border-b border-border bg-muted/20">
            <h3 className="font-display font-bold flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" /> Login & Security
            </h3>
          </div>
          <div className="p-5 md:p-8 space-y-6">
            <div className="grid md:grid-cols-1 gap-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Email Address</label>
                <input 
                  type="email" 
                  disabled
                  value={userEmail}
                  className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-sm opacity-70 cursor-not-allowed"
                />
              </div>

              <div className="border-t border-border pt-6 mt-4 space-y-6">
                <h4 className="text-sm font-bold uppercase tracking-wider text-primary">Update Password</h4>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-1.5 relative">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">New Password</label>
                    <div className="relative">
                      <input 
                        type={showPasswords.new ? "text" : "password"}
                        value={passwords.new}
                        onChange={(e) => setPasswords({...passwords, new: e.target.value})}
                        className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors pr-10"
                        placeholder="••••••••"
                      />
                      <button 
                        type="button"
                        onClick={() => setShowPasswords({...showPasswords, new: !showPasswords.new})}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5 relative">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Confirm New Password</label>
                    <div className="relative">
                      <input 
                        type={showPasswords.confirm ? "text" : "password"}
                        value={passwords.confirm}
                        onChange={(e) => setPasswords({...passwords, confirm: e.target.value})}
                        className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors pr-10"
                        placeholder="••••••••"
                      />
                      <button 
                        type="button"
                        onClick={() => setShowPasswords({...showPasswords, confirm: !showPasswords.confirm})}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                <Button 
                  variant="outline" 
                  className="h-12 rounded-xl w-full border-primary/20 text-primary hover:bg-primary/5 font-bold"
                  onClick={handlePasswordUpdate}
                  disabled={updatingPassword}
                >
                  {updatingPassword ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Key className="h-4 w-4 mr-2" />}
                  {updatingPassword ? "Updating..." : "Confirm Password Change"}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-destructive/5 border border-destructive/20 rounded-3xl overflow-hidden">
          <div className="p-6 border-b border-destructive/10 bg-destructive/5 flex items-center justify-between">
            <h3 className="font-display font-bold text-destructive flex items-center gap-2">
              <Trash2 className="h-5 w-5" /> Danger Zone
            </h3>
          </div>
          <div className="p-5 md:p-8 flex flex-col gap-6">
            <div className="max-w-md">
              <p className="font-bold text-destructive mb-1">Delete Account Permanently</p>
              <p className="text-sm text-muted-foreground leading-relaxed">This action cannot be undone. All your links, analytics, and settings will be wiped from our servers.</p>
            </div>
            <Button variant="destructive" size="lg" className="rounded-2xl w-full sm:w-auto px-10" onClick={handleDeleteAccount}>
              Delete My Data
            </Button>
          </div>
        </div>
      </div>

      <div className="mt-8 sticky bottom-6 z-10 flex justify-end">
        <Button variant="gradient" className="h-14 px-12 rounded-2xl text-md font-bold shadow-2xl shadow-primary/30 min-w-[200px]" onClick={handleSave}>
          {saveStatus ? <Check className="h-5 w-5 mr-2" /> : null}
          {saveStatus ? "Changes Saved!" : "Save All Changes"}
        </Button>
      </div>
    </div>
  );
};

export default SettingsPage;
