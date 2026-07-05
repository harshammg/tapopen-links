import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, ArrowUpRight, Loader2 } from "lucide-react";

const FORMS_URL = "https://forms.tapopen.online";

export default function FormsDashboard() {
  const navigate = useNavigate();

  useEffect(() => {
    // Open Forms app in new tab, return user to console
    window.open(FORMS_URL, "_blank", "noopener,noreferrer");
    const timer = setTimeout(() => navigate("/console"), 1500);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-[#111827]">
      <div className="max-w-sm w-full text-center space-y-6">

        {/* Icon */}
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-green-50 border border-[#E5E7EB] mx-auto">
          <FileText className="w-7 h-7 text-green-600" />
        </div>

        {/* Text */}
        <div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-green-600 mb-2">Forms · External Product</div>
          <h1 className="text-2xl font-extrabold tracking-tight">Launching Forms</h1>
          <p className="text-sm text-[#6B7280] mt-2 leading-relaxed">
            Forms is an independent TapOpen product hosted at its own domain. Opening it now…
          </p>
        </div>

        {/* Spinner */}
        <Loader2 className="w-5 h-5 text-green-600 animate-spin mx-auto" />

        {/* Manual link fallback */}
        <a
          href={FORMS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-green-600 hover:underline"
        >
          Open manually
          <ArrowUpRight className="w-3.5 h-3.5" />
        </a>

        <p className="text-[10px] text-[#9CA3AF]">Returning you to the Console in a moment…</p>
      </div>
    </div>
  );
}
