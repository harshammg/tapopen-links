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
      <header className="fixed top-4 left-4 right-4 z-50 bg-background/80 backdrop-blur-lg border border-border px-6 py-3 flex items-center justify-between rounded-full shadow-lg max-w-5xl mx-auto">
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
      <main className="flex-1 overflow-y-auto pt-20">
        <Outlet />
      </main>

      {/* Universal bottom nav (Nav Dock) */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-[400px] z-50 bg-background/80 backdrop-blur-xl border border-border flex items-center justify-around py-3 px-6 rounded-full shadow-2xl">
        {navItems.map((item) => {
          const active = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-2 px-6 py-2 transition-all duration-300 rounded-full ${
                active 
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-105" 
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              <item.icon className={`h-5 w-5 ${active ? "fill-primary-foreground/20" : ""}`} />
              <span className={`text-[10px] font-bold uppercase tracking-widest ${active ? "block" : "hidden md:block"}`}>
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

