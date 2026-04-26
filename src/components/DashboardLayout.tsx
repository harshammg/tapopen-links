import { useState, useEffect } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { Home, Layout, BarChart3, QrCode, Settings, LogOut, Zap, User, Briefcase, BookOpen } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

import { linkService } from "@/services/linkService";
import { nanoid } from "nanoid";

const navItems = [
  { label: "Quick Link", icon: Zap, path: "/dashboard" },
  { label: "Dashboard", icon: Layout, path: "/dashboard/hub" },
  { label: "Settings", icon: Settings, path: "/dashboard/settings" },
];

const DashboardLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [userName, setUserName] = useState("User");
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isClaiming, setIsClaiming] = useState(false);

  useEffect(() => {
    if (!supabase) return;
    let isMounted = true;

    const fetchUserData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        // Essential fix for OAuth: Don't bounce if Supabase is still parsing the URL hash or query params!
        if (
          window.location.hash.includes('access_token') || 
          window.location.search.includes('code=') || 
          window.location.search.includes('error=') ||
          window.location.hash.includes('type=recovery')
        ) {
          return;
        }
        navigate("/auth/login");
        return;
      }

      setCurrentUser(session.user);

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("full_name, handle")
        .eq("id", session.user.id)
        .single();
        
      let currentProfile = profile;

      if (error && error.code === 'PGRST116') {
        // No profile found - auto-create one (Crucial for OAuth users)
        const baseHandle = session.user.email?.split('@')[0] || `user_${Math.random().toString(36).substr(2, 5)}`;
        const { data: newProfile } = await supabase.from("profiles").upsert({
          id: session.user.id,
          email: session.user.email,
          handle: baseHandle,
          full_name: session.user.user_metadata?.full_name || baseHandle
        }).select().single();
        
        currentProfile = newProfile;
      }
      
      if (isMounted) setUserName(currentProfile?.full_name || currentProfile?.handle || session.user.email?.split("@")[0] || "User");
    };

    fetchUserData();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        navigate("/auth/login");
      } else if (event === 'SIGNED_IN' && session) {
        fetchUserData();
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Logged out successfully");
    navigate("/auth/login");
  };

  return (
    <div className="flex flex-col min-h-screen bg-background relative pb-28">
      {/* Universal Header */}
      <header className="fixed top-3 left-3 right-3 md:top-4 md:left-4 md:right-4 z-50 bg-background/80 backdrop-blur-lg border border-border px-4 md:px-6 py-3 flex items-center justify-between rounded-full shadow-lg max-w-5xl mx-auto">
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
      <main className="flex-1 overflow-y-auto pt-20 md:pt-24">
        <Outlet />
      </main>

      {/* Universal bottom nav (Nav Dock) */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-2.5rem)] max-w-[400px] z-50 bg-background/80 backdrop-blur-2xl border border-border flex items-center p-1.5 rounded-full shadow-2xl overflow-hidden">
        {navItems.map((item) => {
          const active = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 transition-all duration-300 rounded-full ${
                active 
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 font-bold" 
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
              }`}
            >
              <item.icon className={`h-4 w-4 shrink-0 ${active ? "fill-primary-foreground/20" : ""}`} />
              <span className={`text-[10px] font-black uppercase tracking-widest whitespace-nowrap ${active ? "block" : "hidden sm:block"}`}>
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

