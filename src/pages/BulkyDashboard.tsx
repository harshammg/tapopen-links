import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Send, ArrowUpRight, Loader2, Github } from "lucide-react";

const BULKY_URL = "https://github.com/harshammg/tapopen-bulky";

export default function BulkyDashboard() {
  const navigate = useNavigate();

  useEffect(() => {
    // Open Bulky GitHub repo in new tab, return user to console
    window.open(BULKY_URL, "_blank", "noopener,noreferrer");
    const timer = setTimeout(() => navigate("/console"), 1500);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-[#111827]">
      <div className="max-w-sm w-full text-center space-y-6">

        {/* Icon */}
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-orange-50 border border-[#E5E7EB] mx-auto">
          <Send className="w-7 h-7 text-orange-600" />
        </div>

        {/* Text */}
        <div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-orange-600 mb-2">Bulky · Open Source</div>
          <h1 className="text-2xl font-extrabold tracking-tight">Opening Bulky</h1>
          <p className="text-sm text-[#6B7280] mt-2 leading-relaxed">
            Bulky is a fully open source TapOpen product. Taking you to the GitHub repository now…
          </p>
        </div>

        {/* Spinner */}
        <Loader2 className="w-5 h-5 text-orange-600 animate-spin mx-auto" />

        {/* Manual link fallback */}
        <a
          href={BULKY_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-600 hover:underline"
        >
          <Github className="w-3.5 h-3.5" />
          Open on GitHub
          <ArrowUpRight className="w-3.5 h-3.5" />
        </a>

        <p className="text-[10px] text-[#9CA3AF]">Returning you to the Console in a moment…</p>
      </div>
    </div>
  );
}
