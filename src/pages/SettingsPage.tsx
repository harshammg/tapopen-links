import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Settings, Shield, Key, Loader2, User, HelpCircle, Bell, Laptop, Cloud } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [profile, setProfile] = useState({
    full_name: "",
    handle: "",
    bio: ""
  });
  const [passwords, setPasswords] = useState({
    new: "",
    confirm: ""
  });
  const [updatingPassword, setUpdatingPassword] = useState(false);

  useEffect(() => {
    async function fetchSettings() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;
        setUserEmail(session.user.email || "");

        const { data } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();

        if (data) {
          setProfile({
            full_name: data.full_name || "",
            handle: data.handle || "",
            bio: data.bio || ""
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchSettings();
  }, []);

  const handleProfileSave = async () => {
    setSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: profile.full_name,
          handle: profile.handle,
          bio: profile.bio
        })
        .eq("id", session.user.id);

      if (error) throw error;
      toast.success("Settings updated");
    } catch {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
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

    setUpdatingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({ 
        password: passwords.new 
      });
      if (error) throw error;
      toast.success("Password updated successfully!");
      setPasswords({ new: "", confirm: "" });
    } catch {
      toast.error("Failed to update password");
    } finally {
      setUpdatingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="w-8 h-8 text-slate-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-10 font-inter text-[#111827]">
      
      {/* Header */}
      <header className="mb-10 border-b border-[#E5E7EB] pb-6">
        <h1 className="text-3xl font-extrabold tracking-tight">Global Account Settings</h1>
        <p className="text-xs text-[#6B7280] mt-1">Manage your workspace configuration, credentials, notifications, and products.</p>
      </header>

      <div className="space-y-10">
        
        {/* Profile Card */}
        <div className="border border-[#E5E7EB] rounded-xl p-6 bg-white space-y-6">
          <h3 className="text-sm font-bold text-[#111827] flex items-center gap-2">
            <User className="w-4 h-4 text-blue-600" />
            User Identity
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wide">Display Name</label>
              <Input 
                value={profile.full_name} 
                onChange={e => setProfile({...profile, full_name: e.target.value})} 
                placeholder="Full Name" 
                className="h-10 rounded-lg text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wide">User Handle</label>
              <Input 
                value={profile.handle} 
                onChange={e => setProfile({...profile, handle: e.target.value})} 
                placeholder="handle" 
                className="h-10 rounded-lg text-xs"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wide">Email address</label>
            <Input 
              value={userEmail} 
              disabled 
              className="h-10 rounded-lg text-xs bg-[#F8FAFC]"
            />
          </div>
          <Button 
            onClick={handleProfileSave} 
            disabled={saving}
            className="bg-black hover:bg-[#111827]/90 text-white text-xs px-4 py-2 font-semibold rounded-lg"
          >
            {saving ? "Saving..." : "Save Profile Details"}
          </Button>
        </div>

        {/* Security / Password Card */}
        <div className="border border-[#E5E7EB] rounded-xl p-6 bg-white space-y-6">
          <h3 className="text-sm font-bold text-[#111827] flex items-center gap-2">
            <Key className="w-4 h-4 text-blue-600" />
            Security & Authentication
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wide">New Password</label>
              <Input 
                type="password"
                value={passwords.new} 
                onChange={e => setPasswords({...passwords, new: e.target.value})} 
                placeholder="••••••••" 
                className="h-10 rounded-lg text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wide">Confirm Password</label>
              <Input 
                type="password"
                value={passwords.confirm} 
                onChange={e => setPasswords({...passwords, confirm: e.target.value})} 
                placeholder="••••••••" 
                className="h-10 rounded-lg text-xs"
              />
            </div>
          </div>
          <Button 
            onClick={handlePasswordUpdate} 
            disabled={updatingPassword}
            className="bg-black hover:bg-[#111827]/90 text-white text-xs px-4 py-2 font-semibold rounded-lg"
          >
            {updatingPassword ? "Updating..." : "Update Security Password"}
          </Button>
        </div>

        {/* Workspace Notifications */}
        <div className="border border-[#E5E7EB] rounded-xl p-6 bg-white space-y-6">
          <h3 className="text-sm font-bold text-[#111827] flex items-center gap-2">
            <Bell className="w-4 h-4 text-blue-600" />
            System Notifications
          </h3>
          <div className="space-y-3">
            {[
              { id: "email_notif", label: "Email alerts", desc: "Send confirmation on new form response" },
              { id: "sms_notif", label: "WhatsApp alerts", desc: "Notify workspace on campaign dispatch" },
            ].map((item) => (
              <div key={item.id} className="flex items-center justify-between py-2 border-b border-[#E5E7EB] last:border-0">
                <div>
                  <div className="text-xs font-bold text-[#111827]">{item.label}</div>
                  <div className="text-[10px] text-[#6B7280] mt-0.5">{item.desc}</div>
                </div>
                <input type="checkbox" defaultChecked className="w-4.5 h-4.5 accent-blue-600 rounded" />
              </div>
            ))}
          </div>
        </div>

        {/* Sessions Active */}
        <div className="border border-[#E5E7EB] rounded-xl p-6 bg-white space-y-6">
          <h3 className="text-sm font-bold text-[#111827] flex items-center gap-2">
            <Laptop className="w-4 h-4 text-blue-600" />
            Active Workspace Sessions
          </h3>
          <div className="flex items-center justify-between text-xs text-[#6B7280] font-medium bg-[#F8FAFC] border border-[#E5E7EB] rounded-xl p-4">
            <div className="flex items-center gap-3">
              <Laptop className="w-5 h-5 text-[#6B7280]" />
              <div>
                <div className="font-bold text-[#111827]">Chrome on Windows</div>
                <div className="text-[10px] text-[#9CA3AF] mt-0.5">Current Session • Active now</div>
              </div>
            </div>
            <span className="bg-blue-50 text-blue-600 text-[8px] font-extrabold px-2 py-0.5 rounded-full">CURRENT</span>
          </div>
        </div>

        {/* Connected Products */}
        <div className="border border-[#E5E7EB] rounded-xl p-6 bg-white space-y-6">
          <h3 className="text-sm font-bold text-[#111827] flex items-center gap-2">
            <Cloud className="w-4 h-4 text-blue-600" />
            Connected Products Ecosystem
          </h3>
          <div className="divide-y divide-[#E5E7EB]">
            {[
              { name: "Quick Links", url: "tapopen.online/quick-links", status: "CONNECTED" },
              { name: "Profiles", url: "tapopen.online/profiles", status: "CONNECTED" },
              { name: "Forms", url: "forms.tapopen.online", status: "CONNECTED" },
              { name: "Bulky", url: "github.com/harshammg/tapopen-bulky", status: "CONNECTED" },
            ].map((prod) => (
              <div key={prod.name} className="flex items-center justify-between py-3">
                <div>
                  <span className="text-xs font-bold text-[#111827]">{prod.name}</span>
                  <span className="text-[10px] text-[#6B7280] block mt-0.5">{prod.url}</span>
                </div>
                <span className="text-[9px] font-bold text-green-600 bg-green-50 border border-[#E5E7EB] px-2 py-0.5 rounded">
                  {prod.status}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
