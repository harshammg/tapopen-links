import { Outlet, Link, useLocation } from "react-router-dom";
import { Home, Layout, BarChart3, QrCode, Settings, LogOut } from "lucide-react";

const navItems = [
  { label: "My Links", icon: Home, path: "/dashboard" },
  { label: "Bio Page", icon: Layout, path: "/dashboard/bio" },
  { label: "Analytics", icon: BarChart3, path: "/dashboard/analytics" },
  { label: "QR Codes", icon: QrCode, path: "/dashboard/qr" },
  { label: "Settings", icon: Settings, path: "/dashboard/settings" },
];

const DashboardLayout = () => {
  const location = useLocation();

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar - hidden on mobile */}
      <aside className="hidden md:flex flex-col w-64 border-r border-border bg-card">
        <div className="p-6">
          <Link to="/" className="font-display text-xl font-bold gradient-text">TapOpen</Link>
        </div>
        <nav className="flex-1 px-3 space-y-1">
          {navItems.map((item) => {
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-all ${
                  active
                    ? "bg-primary/10 text-primary border-l-2 border-primary font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full gradient-bg flex items-center justify-center text-primary-foreground font-bold text-sm">H</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">Harsha K</p>
              <span className="text-xs gradient-bg text-primary-foreground px-2 py-0.5 rounded-pill font-medium">PRO</span>
            </div>
            <button className="text-muted-foreground hover:text-foreground transition-colors">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border flex">
        {navItems.slice(0, 4).map((item) => {
          const active = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex-1 flex flex-col items-center py-2 text-xs transition-colors ${active ? "text-primary" : "text-muted-foreground"}`}
            >
              <item.icon className="h-5 w-5 mb-0.5" />
              {item.label}
            </Link>
          );
        })}
      </div>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;
