import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Link2, User, FileText, Send, Settings,
  ArrowRight, Loader2, ExternalLink, Github, ArrowUpRight, Sparkles, LayoutGrid, Globe
} from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function TapOpenHub() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("there");
  const [handle, setHandle] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUser() {
      try {
        if (!supabase) { setLoading(false); return; }
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) { navigate("/auth/login"); return; }

        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name, handle")
          .eq("id", session.user.id)
          .single();

        if (profile) {
          setUserName(profile.full_name?.split(" ")[0] || profile.handle || "there");
          setHandle(profile.handle || "");
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchUser();
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="w-7 h-7 text-slate-400 animate-spin" />
      </div>
    );
  }

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="relative min-h-screen bg-[#F8FAFC] text-[#111827] overflow-hidden">
      
      {/* ── Background Glow ── */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-blue-50/80 to-transparent blur-3xl pointer-events-none rounded-full opacity-70"></div>

      <div className="relative max-w-5xl mx-auto px-6 py-12 lg:py-16">

        {/* ── Header ── */}
        <header className="mb-12 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 bg-white/60 backdrop-blur-md border border-[#E5E7EB] rounded-full shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-widest">Workspace</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-[#111827]">
              {greeting}, {userName}.
            </h1>
            <p className="text-base text-[#6B7280] mt-3 max-w-lg font-medium leading-relaxed">
              Welcome to the TapOpen console. Manage your digital identity, deep links, and forms all in one place.
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3 shrink-0 z-10">
            {handle && (
              <a
                href={`/${handle}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm font-bold text-[#111827] bg-white border border-[#E5E7EB] hover:border-black hover:shadow-md rounded-xl px-4 py-2.5 transition-all duration-300"
              >
                <Globe className="w-4 h-4 text-[#6B7280]" />
                View Profile
              </a>
            )}
            <Link
              to="/console/settings"
              className="flex items-center gap-2 text-sm font-bold text-[#111827] bg-white border border-[#E5E7EB] hover:border-black hover:shadow-md rounded-xl px-4 py-2.5 transition-all duration-300"
            >
              <Settings className="w-4 h-4 text-[#6B7280]" />
              Settings
            </Link>
          </div>
        </header>

        {/* ── Bento Grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10 z-10 relative">
          
          {/* Quick Links (Large Hero Card) */}
          <button
            onClick={() => navigate("/console/quick-links")}
            className="group relative flex flex-col text-left p-8 md:col-span-2 bg-white/70 backdrop-blur-xl border border-[#E5E7EB] hover:border-blue-500/50 rounded-3xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-500/10 overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-blue-100/50 to-transparent rounded-full blur-3xl -mr-10 -mt-10 transition-opacity group-hover:opacity-100 opacity-50"></div>
            
            <div className="flex items-start justify-between mb-8 relative">
              <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-600/20">
                <Link2 className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-black tracking-widest px-3 py-1 rounded-full text-blue-600 bg-blue-50 border border-blue-100">
                CORE
              </span>
            </div>
            
            <div className="relative mt-auto">
              <h3 className="text-2xl font-black text-[#111827] mb-2">Quick Links</h3>
              <p className="text-sm text-[#6B7280] leading-relaxed max-w-sm mb-6">
                Create, shorten, and track powerful deep links that automatically route users to native apps on mobile.
              </p>
              <div className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 group-hover:translate-x-1 transition-transform">
                Open Dashboard
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </button>

          {/* Profiles (Tall Card) */}
          <button
            onClick={() => navigate("/console/profiles")}
            className="group relative flex flex-col text-left p-8 md:col-span-1 md:row-span-2 bg-white/70 backdrop-blur-xl border border-[#E5E7EB] hover:border-purple-500/50 rounded-3xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-purple-500/10 overflow-hidden"
          >
            <div className="absolute bottom-0 right-0 w-full h-1/2 bg-gradient-to-t from-purple-50/80 to-transparent rounded-full blur-2xl transition-opacity group-hover:opacity-100 opacity-50"></div>

            <div className="flex items-start justify-between mb-8 relative">
              <div className="w-12 h-12 rounded-2xl bg-purple-600 text-white flex items-center justify-center shadow-lg shadow-purple-600/20">
                <User className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-black tracking-widest px-3 py-1 rounded-full text-purple-600 bg-purple-50 border border-purple-100">
                CORE
              </span>
            </div>
            
            <div className="relative mt-auto">
              <h3 className="text-2xl font-black text-[#111827] mb-2">Profiles</h3>
              <p className="text-sm text-[#6B7280] leading-relaxed mb-8">
                Design a stunning link-in-bio page. Aggregate your links, portfolio, blogs, and store in one highly convertible digital identity.
              </p>
              
              <div className="flex flex-col gap-3 w-full">
                <div className="h-10 w-full bg-white/80 border border-purple-100 rounded-xl flex items-center px-4 gap-3 shadow-sm group-hover:border-purple-300 transition-colors">
                   <div className="w-5 h-5 rounded-md bg-purple-100 flex items-center justify-center"><LayoutGrid className="w-3 h-3 text-purple-600" /></div>
                   <div className="h-2 bg-slate-200 rounded-full w-16"></div>
                </div>
                <div className="h-10 w-full bg-white/80 border border-purple-100 rounded-xl flex items-center px-4 gap-3 shadow-sm group-hover:border-purple-300 transition-colors ml-4">
                   <div className="w-5 h-5 rounded-md bg-blue-100 flex items-center justify-center"><Link2 className="w-3 h-3 text-blue-600" /></div>
                   <div className="h-2 bg-slate-200 rounded-full w-20"></div>
                </div>
              </div>

              <div className="inline-flex items-center gap-2 text-sm font-bold text-purple-600 group-hover:translate-x-1 transition-transform mt-8">
                Edit Profile
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </button>

          {/* Forms (Secondary Card) */}
          <button
            onClick={() => window.open("https://forms.tapopen.online", "_blank")}
            className="group relative flex flex-col text-left p-6 md:col-span-1 bg-white/70 backdrop-blur-xl border border-[#E5E7EB] hover:border-green-500/50 rounded-3xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-green-500/10 overflow-hidden"
          >
            <div className="flex items-start justify-between mb-6 relative">
              <div className="w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center border border-green-100">
                <FileText className="w-5 h-5" />
              </div>
              <span className="text-[9px] font-black tracking-widest px-2.5 py-1 rounded-full text-[#6B7280] bg-[#F8FAFC] border border-[#E5E7EB]">
                EXTERNAL
              </span>
            </div>
            
            <div className="relative mt-auto">
              <h3 className="text-base font-bold text-[#111827] mb-1.5">TapOpen Forms</h3>
              <p className="text-xs text-[#6B7280] leading-relaxed mb-4 line-clamp-2">
                Build beautiful forms, collect responses, and seamlessly integrate with Notion.
              </p>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-green-600 group-hover:translate-x-1 transition-transform">
                Launch App
                <ArrowUpRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </button>

          {/* Bulky (Secondary Card) */}
          <button
            onClick={() => window.open("https://github.com/harshammg/tapopen-bulky", "_blank")}
            className="group relative flex flex-col text-left p-6 md:col-span-1 bg-white/70 backdrop-blur-xl border border-[#E5E7EB] hover:border-orange-500/50 rounded-3xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-orange-500/10 overflow-hidden"
          >
            <div className="flex items-start justify-between mb-6 relative">
              <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center border border-orange-100">
                <Send className="w-5 h-5" />
              </div>
              <span className="text-[9px] font-black tracking-widest px-2.5 py-1 rounded-full text-[#6B7280] bg-[#F8FAFC] border border-[#E5E7EB]">
                OPEN SOURCE
              </span>
            </div>
            
            <div className="relative mt-auto">
              <h3 className="text-base font-bold text-[#111827] mb-1.5">Bulky Connect</h3>
              <p className="text-xs text-[#6B7280] leading-relaxed mb-4 line-clamp-2">
                Dispatch personalized WhatsApp broadcast campaigns with real-time delivery tracking.
              </p>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-600 group-hover:translate-x-1 transition-transform">
                View on GitHub
                <ArrowUpRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </button>

        </div>

        {/* ── Open Source Callout ── */}
        <div className="relative overflow-hidden border border-black/10 rounded-3xl bg-gradient-to-br from-[#111827] to-[#1F2937] p-8 text-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 shadow-2xl shadow-black/20">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 bg-white/10 rounded-lg backdrop-blur-sm">
                <Github className="w-4 h-4 text-white" />
              </div>
              <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Community</span>
            </div>
            <h3 className="text-xl font-black tracking-tight mb-2">Built in the Open.</h3>
            <p className="text-sm text-slate-400 leading-relaxed max-w-xl">
              Parts of TapOpen are fully open source. Explore the code, contribute improvements, or build on top of the TapOpen platform infrastructure.
            </p>
          </div>
          
          <a
            href="https://github.com/stars/harshammg/lists/tapopen"
            target="_blank"
            rel="noopener noreferrer"
            className="relative z-10 inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white text-[#111827] text-sm font-bold hover:bg-slate-100 hover:scale-105 transition-all shadow-lg shrink-0"
          >
            View GitHub Repositories
            <ArrowUpRight className="w-4 h-4" />
          </a>
        </div>

      </div>
    </div>
  );
}
