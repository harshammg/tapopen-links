import { useState, useEffect } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { Home, Layout, BarChart3, QrCode, Settings, LogOut, Zap, User } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

const navItems = [
  { label: "Quick Link", icon: Zap, path: "/dashboard" },
  { label: "Settings", icon: Settings, path: "/dashboard/settings" },
];

const DashboardLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [userName, setUserName] = useState("User");

  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/login");
        return;
      }

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("full_name, handle, plan_type")
        .eq("id", session.user.id)
        .single();
      
      if (profile) {
        setUserName(profile.full_name || profile.handle || session.user.email?.split("@")[0] || "User");
      } else {
        setUserName(session.user.email?.split("@")[0] || "User");
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Logged out successfully");
    navigate("/login");
  };

  return (
    <div className="flex flex-col min-h-screen bg-background relative pb-24">
      {/* Universal Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border px-6 py-4 flex items-center justify-between">
        <Link to="/" className="font-display text-xl font-bold gradient-text">TapOpen</Link>
        <button 
          onClick={handleLogout}
          className="p-2 text-muted-foreground hover:text-destructive transition-colors"
          title="Sign Out"
        >
          <LogOut className="h-5 w-5" />
        </button>
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>

      {/* Universal bottom nav (Nav Dock) */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[500px] z-50 bg-background/80 backdrop-blur-xl border-t border-border flex items-center justify-around py-3 px-6 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
        {navItems.map((item) => {
          const active = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center gap-1 transition-all duration-300 ${
                active ? "text-primary scale-110" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <item.icon className={`h-6 w-6 ${active ? "fill-primary/10" : ""}`} />
              <span className={`text-[10px] font-bold uppercase tracking-widest ${active ? "opacity-100" : "opacity-60"}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default DashboardLayout;

