import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BackgroundGlow } from "@/components/ui/BackgroundGlow";
import { Suspense, lazy } from "react";
import { Loader2 } from "lucide-react";

import LandingPage from "./pages/LandingPage";

// Lazy load heavy dashboard components
const DashboardLayout = lazy(() => import("./components/DashboardLayout"));
const QuickLinkGenerator = lazy(() => import("./pages/QuickLinkGenerator"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));
const AuthPage = lazy(() => import("./pages/AuthPage"));
const RedirectHandler = lazy(() => import("./pages/RedirectHandler"));
const NotFound = lazy(() => import("./pages/NotFound"));
const LinkPage = lazy(() => import("./components/dashboard/LinkPage").then(module => ({ default: module.LinkPage })));
const DashboardHub = lazy(() => import("./pages/DashboardHub"));
const PortfolioPage = lazy(() => import("./pages/PortfolioPage"));
const BlogsPage = lazy(() => import("./pages/BlogsPage"));
const OtherProducts = lazy(() => import("./pages/OtherProducts"));

const queryClient = new QueryClient();

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="flex flex-col items-center gap-4">
      <Loader2 className="w-8 h-8 text-primary animate-spin" />
      <span className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground animate-pulse">Loading Application...</span>
    </div>
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BackgroundGlow />
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/products" element={<OtherProducts />} />
            <Route path="/auth/login" element={<AuthPage mode="login" />} />
            <Route path="/auth/signup" element={<AuthPage mode="signup" />} />
            {/* Legacy redirects */}
            <Route path="/login" element={<Navigate to="/auth/login" replace />} />
            <Route path="/signup" element={<Navigate to="/auth/signup" replace />} />
            <Route path="/landing" element={<Navigate to="/" replace />} />
            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route index element={<QuickLinkGenerator />} />
              <Route path="hub" element={<DashboardHub />} />
              <Route path="links" element={<LinkPage />} />
              <Route path="portfolio" element={<PortfolioPage />} />
              <Route path="blogs" element={<BlogsPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>
            <Route path="/:slug/*" element={<RedirectHandler />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
