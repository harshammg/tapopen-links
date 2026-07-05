import { useState, useEffect } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { Home, Layout, BarChart3, Settings, LogOut, Zap, User, Briefcase, BookOpen, Link2, FileText, Send, ArrowLeft, Globe } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export default function ConsoleLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    if (!supabase) return;
    async function checkUser() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth/login");
        return;
      }
      setCurrentUser(session.user);
    }
    checkUser();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Logged out successfully");
    navigate("/auth/login");
  };

  const path = location.pathname;

  // Determine current active product workspace details
  let activeProduct = "Hub";
  let activeColor = "border-black";
  let activeDot = "bg-black";
  let sidebarItems: { label: string; icon: any; path: string }[] = [];

  if (path.startsWith("/console/quick-links")) {
    activeProduct = "Quick Links";
    activeColor = "border-blue-600";
    activeDot = "bg-blue-600";
    sidebarItems = [
      { label: "Links Manager", icon: Link2, path: "/console/quick-links" },
    ];
  } else if (
    path.startsWith("/console/profiles") ||
    path.startsWith("/console/links") ||
    path.startsWith("/console/portfolio") ||
    path.startsWith("/console/blogs")
  ) {
    activeProduct = "Profiles";
    activeColor = "border-purple-600";
    activeDot = "bg-purple-600";
    sidebarItems = [
      { label: "Profile Settings", icon: User, path: "/console/profiles" },
      { label: "Links & Stores", icon: Globe, path: "/console/links" },
      { label: "Portfolio Items", icon: Briefcase, path: "/console/portfolio" },
      { label: "Markdown Blogs", icon: BookOpen, path: "/console/blogs" },
    ];
  } else if (path.startsWith("/console/forms")) {
    activeProduct = "Forms";
    activeColor = "border-green-600";
    activeDot = "bg-green-600";
    sidebarItems = [];
  } else if (path.startsWith("/console/bulky")) {
    activeProduct = "Bulky";
    activeColor = "border-orange-600";
    activeDot = "bg-orange-600";
    sidebarItems = [];
  }

  // Base navigation sidebar items (Settings is global account settings)
  const globalSidebarItems = [
    { label: "Global Settings", icon: Settings, path: "/console/settings" },
  ];

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-white font-inter text-[#111827]">
      
      {/* ---------------- MOBILE TOP BAR ---------------- */}
      <header className="md:hidden sticky top-0 z-40 h-16 bg-white border-b border-[#E5E7EB] px-6 flex items-center justify-between">
        <Link to="/console" className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-[#111827] fill-current" />
          <span className="font-bold text-sm">TapOpen Console</span>
        </Link>
        <button onClick={handleLogout} className="text-xs font-semibold text-red-600">
          Sign Out
        </button>
      </header>

      {/* ---------------- DESKTOP SIDEBAR ---------------- */}
      <aside className="hidden md:flex flex-col fixed left-0 top-0 bottom-0 z-40 w-64 border-r border-[#E5E7EB] bg-white p-6 justify-between select-none">
        <div className="space-y-8">
          {/* Logo & Product indicator */}
          <div>
            <Link to="/console" className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#111827] fill-current" />
              <span className="font-bold text-base tracking-tight">TapOpen</span>
            </Link>
            
            {/* Tag detailing the current product workspace */}
            <div className="mt-3 flex items-center gap-2 px-2.5 py-1 border border-[#E5E7EB] rounded-lg w-max bg-[#F8FAFC]">
              <span className={`w-1.5 h-1.5 rounded-full ${activeDot}`}></span>
              <span className="text-[10px] font-bold text-[#6B7280]">{activeProduct}</span>
            </div>
          </div>

          {/* Product Back Navigation */}
          {activeProduct !== "Hub" && (
            <div>
              <Link
                to="/console"
                className="flex items-center gap-2 rounded-lg border border-[#E5E7EB] px-3 py-2 text-xs font-bold text-[#6B7280] hover:text-[#111827] hover:bg-[#F8FAFC] transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to Console
              </Link>
            </div>
          )}

          {/* Sidebar Navigation */}
          <nav className="space-y-1.5">
            {sidebarItems.map((item) => {
              const active = path === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold border transition-all ${
                    active 
                      ? `${activeColor} bg-[#F8FAFC] text-[#111827]` 
                      : "border-transparent text-[#6B7280] hover:text-[#111827] hover:bg-[#F8FAFC]"
                  }`}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Global Settings & Logout */}
        <div className="space-y-4">
          <nav className="space-y-1.5 border-t border-[#E5E7EB] pt-4">
            {globalSidebarItems.map((item) => {
              const active = path === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold border transition-all ${
                    active 
                      ? "border-black bg-[#F8FAFC] text-[#111827]" 
                      : "border-transparent text-[#6B7280] hover:text-[#111827] hover:bg-[#F8FAFC]"
                  }`}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
          
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2 w-full rounded-lg text-xs font-semibold text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ---------------- MAIN LAYOUT WRAPPER ---------------- */}
      {/* Mobile top spacing, desktop left padding */}
      <main className="flex-1 w-full md:pl-64 min-h-screen bg-[#F8FAFC]">
        <div className="min-h-screen bg-[#F8FAFC]">
          <Outlet />
        </div>
      </main>



    </div>
  );
}
