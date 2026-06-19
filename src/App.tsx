import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BackgroundGlow } from "@/components/ui/BackgroundGlow";
import LandingPage from "./pages/LandingPage";
import DashboardLayout from "./components/DashboardLayout";
import QuickLinkGenerator from "./pages/QuickLinkGenerator";
import SettingsPage from "./pages/SettingsPage";
import AuthPage from "./pages/AuthPage";
import RedirectHandler from "./pages/RedirectHandler";
import NotFound from "./pages/NotFound";
import { LinkPage } from "./components/dashboard/LinkPage";
import DashboardHub from "./pages/DashboardHub";
import PortfolioPage from "./pages/PortfolioPage";
import BlogsPage from "./pages/BlogsPage";
import OtherProducts from "./pages/OtherProducts";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BackgroundGlow />
      <Toaster />
      <Sonner />
      <BrowserRouter>
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
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
