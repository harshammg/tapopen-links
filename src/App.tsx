import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BackgroundGlow } from "@/components/ui/BackgroundGlow";
import { Suspense, lazy } from "react";
import { Loader2 } from "lucide-react";

import LandingPage from "./pages/LandingPage";

// Lazy load heavy console components
const ConsoleLayout = lazy(() => import("./components/DashboardLayout"));
const QuickLinkGenerator = lazy(() => import("./pages/QuickLinkGenerator"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));
const AuthPage = lazy(() => import("./pages/AuthPage"));
const RedirectHandler = lazy(() => import("./pages/RedirectHandler"));
const NotFound = lazy(() => import("./pages/NotFound"));
const LinkPage = lazy(() => import("./components/dashboard/LinkPage").then(module => ({ default: module.LinkPage })));
const PortfolioPage = lazy(() => import("./pages/PortfolioPage"));
const BlogsPage = lazy(() => import("./pages/BlogsPage"));
const OtherProducts = lazy(() => import("./pages/OtherProducts"));
const QuickLinksLanding = lazy(() => import("./pages/QuickLinksLanding"));
const ProfilesLanding = lazy(() => import("./pages/ProfilesLanding"));
const TapOpenHub = lazy(() => import("./pages/TapOpenHub"));
const ProfilesDashboard = lazy(() => import("./pages/ProfilesDashboard"));
const FormsDashboard = lazy(() => import("./pages/FormsDashboard"));
const BulkyDashboard = lazy(() => import("./pages/BulkyDashboard"));

const queryClient = new QueryClient();

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
    <div className="flex flex-col items-center gap-8 animate-in fade-in zoom-in duration-500">
      {/* Premium TapOpen Logo / Loader */}
      <div className="relative flex items-center justify-center w-20 h-20">
        <div className="absolute inset-0 border-[3px] border-[#E5E7EB] rounded-2xl rotate-45"></div>
        <div className="absolute inset-0 border-[3px] border-[#111827] rounded-2xl border-t-transparent border-r-transparent animate-spin"></div>
        <div className="w-4 h-4 bg-[#111827] rounded-sm rotate-45 animate-pulse"></div>
      </div>
      
      {/* Brand Text */}
      <div className="flex flex-col items-center gap-2">
        <span className="text-xl font-extrabold tracking-tight text-[#111827]">TapOpen</span>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: '0ms' }}></span>
          <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: '150ms' }}></span>
          <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: '300ms' }}></span>
        </div>
      </div>
    </div>
  </div>
);

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BackgroundGlow />
        <Toaster />
        <Sonner />
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* ── Public Landing Routes ── */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/products" element={<OtherProducts />} />
              <Route path="/quick-links" element={<QuickLinksLanding />} />
              <Route path="/profiles" element={<ProfilesLanding />} />

              {/* ── Auth Routes ── */}
              <Route path="/auth/login" element={<AuthPage mode="login" />} />
              <Route path="/auth/signup" element={<AuthPage mode="signup" />} />

              {/* ── Legacy Auth Redirects ── */}
              <Route path="/login" element={<Navigate to="/auth/login" replace />} />
              <Route path="/signup" element={<Navigate to="/auth/signup" replace />} />
              <Route path="/landing" element={<Navigate to="/" replace />} />

              {/* ── Console (primary workspace) ── */}
              <Route path="/console" element={<ConsoleLayout />}>
                <Route index element={<TapOpenHub />} />
                <Route path="quick-links" element={<QuickLinkGenerator />} />
                <Route path="profiles" element={<ProfilesDashboard />} />
                <Route path="links" element={<LinkPage />} />
                <Route path="portfolio" element={<PortfolioPage />} />
                <Route path="blogs" element={<BlogsPage />} />
                <Route path="forms" element={<FormsDashboard />} />
                <Route path="bulky" element={<BulkyDashboard />} />
                <Route path="settings" element={<SettingsPage />} />
              </Route>

              {/* ── Backward Compatibility: /dashboard/* → /console/* ── */}
              <Route path="/dashboard" element={<Navigate to="/console" replace />} />
              <Route path="/dashboard/hub" element={<Navigate to="/console" replace />} />
              <Route path="/dashboard/quick-links" element={<Navigate to="/console/quick-links" replace />} />
              <Route path="/dashboard/profiles" element={<Navigate to="/console/profiles" replace />} />
              <Route path="/dashboard/links" element={<Navigate to="/console/links" replace />} />
              <Route path="/dashboard/portfolio" element={<Navigate to="/console/portfolio" replace />} />
              <Route path="/dashboard/blogs" element={<Navigate to="/console/blogs" replace />} />
              <Route path="/dashboard/forms" element={<Navigate to="/console/forms" replace />} />
              <Route path="/dashboard/bulky" element={<Navigate to="/console/bulky" replace />} />
              <Route path="/dashboard/settings" element={<Navigate to="/console/settings" replace />} />

              {/* ── Dynamic Slug Handler (short links + public profiles) ── */}
              <Route path="/:slug/*" element={<RedirectHandler />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
