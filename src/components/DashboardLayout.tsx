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
    <div className="flex flex-col md:flex-row min-h-screen bg-transparent relative">
      
      {/* ---------------- MOBILE TOP HEADER ---------------- */}
      <header className="md:hidden fixed top-4 left-4 right-4 z-50 h-[60px] bg-background/80 backdrop-blur-xl border border-border/50 rounded-full px-6 flex items-center justify-between shadow-lg shadow-black/10">
        <Link to="/" className="font-display text-xl font-bold gradient-text">TapOpen</Link>
        <button onClick={handleLogout} className="p-2 text-muted-foreground hover:text-destructive transition-colors">
          <LogOut className="h-5 w-5" />
        </button>
      </header>

      {/* ---------------- DESKTOP LEFT SIDEBAR (72px -> 244px) ---------------- */}
      <aside className="hidden md:flex flex-col fixed left-0 top-0 bottom-0 z-50 w-[72px] xl:w-[244px] bg-background border-r border-border transition-all duration-300">
        <div className="h-[100px] flex items-center px-6">
          <Link to="/" className="font-display text-xl xl:text-2xl font-bold gradient-text block">
            <span className="hidden xl:inline">TapOpen</span>
            <span className="xl:hidden">T</span>
          </Link>
        </div>
        
        <nav className="flex-1 px-3 space-y-2 mt-4">
          {navItems.map((item) => {
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-4 p-3 rounded-xl transition-all ${
                  active ? "font-bold text-primary bg-primary/10" : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                }`}
                title={item.label}
              >
                <item.icon className={`h-6 w-6 shrink-0 ${active ? "text-primary" : ""}`} />
                <span className="hidden xl:block text-sm font-bold tracking-wide">{item.label}</span>
              </Link>
            );
          })}
        </nav>
        
        <div className="p-3 mb-4">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-4 p-3 w-full rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all"
            title="Sign Out"
          >
            <LogOut className="h-6 w-6 shrink-0" />
            <span className="hidden xl:block text-sm font-bold">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ---------------- MAIN CONTENT AREA ---------------- */}
      {/* Mobile: pt-88px (header) + pb-110px (nav). Desktop: pl-72px/244px (sidebar) */}
      <main className="flex-1 w-full pt-[88px] pb-[110px] md:pt-0 md:pb-0 md:pl-[72px] xl:pl-[244px] transition-all duration-300">
        <Outlet />
      </main>

      {/* ---------------- MOBILE BOTTOM NAV ---------------- */}
      <nav className="md:hidden fixed bottom-6 left-6 right-6 z-50 h-[56px] bg-background/80 backdrop-blur-xl border border-border/50 rounded-full flex items-center justify-around px-2 shadow-lg shadow-black/10">
        {navItems.map((item) => {
          const active = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center w-10 h-10 rounded-full transition-all ${
                active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              <item.icon className={`h-4 w-4 ${active ? "fill-primary/20" : ""}`} />
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default DashboardLayout;
