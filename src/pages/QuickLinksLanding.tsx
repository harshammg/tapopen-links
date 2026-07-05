import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ChevronDown, Link2, Zap, QrCode, BarChart3, ShieldCheck,
  ArrowRight, Loader2, Check, Copy, ExternalLink
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export default function QuickLinksLanding() {
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);
  const [url, setUrl] = useState("");
  const [shortLink, setShortLink] = useState("");
  const [generating, setGenerating] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
  }, []);

  const goToConsole = () => {
    if (session) {
      navigate("/console/quick-links");
    } else {
      localStorage.setItem("tapopen_redirect", "/console/quick-links");
      navigate("/auth/signup");
    }
  };

  const generateShortLink = async () => {
    const trimmed = url.trim();
    if (!trimmed) return;

    // Basic URL validation
    try { new URL(trimmed.startsWith("http") ? trimmed : `https://${trimmed}`); }
    catch { toast.error("Please enter a valid URL."); return; }

    const fullUrl = trimmed.startsWith("http") ? trimmed : `https://${trimmed}`;

    // Not logged in → save URL and redirect to signup
    if (!session || !supabase) {
      localStorage.setItem("pending_tapopen_link", fullUrl);
      localStorage.setItem("tapopen_redirect", "/console/quick-links");
      navigate("/auth/signup");
      return;
    }

    // Logged in → generate directly
    setGenerating(true);
    try {
      const slug = Math.random().toString(36).substr(2, 4).toUpperCase();
      const { error } = await supabase.from("links").insert({
        user_id: session.user.id,
        slug,
        original_url: fullUrl,
        active: true,
        is_quick: true,
      });
      if (error) throw error;
      const generated = `${window.location.origin}/${slug}`;
      setShortLink(generated);
    } catch (err: any) {
      toast.error("Could not generate link. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(shortLink);
    setCopied(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const benefits = [
    {
      icon: Zap,
      title: "Fast Redirects",
      desc: "Our serverless edge network routes traffic instantly, ensuring redirects happen in under 50ms with zero loading screens.",
    },
    {
      icon: BarChart3,
      title: "Detailed Analytics",
      desc: "Track every click's referral origin, geolocation, and device profile in real-time, respecting user privacy.",
    },
    {
      icon: QrCode,
      title: "Dynamic QR Codes",
      desc: "Download static high-definition vector QR codes automatically for every shortened link you generate.",
    },
    {
      icon: ShieldCheck,
      title: "Four-character Hash",
      desc: "Clean, random hashes like tapopen.online/A7X9 are generated with zero custom aliases, keeping links brief and elegant.",
    },
  ];

  const faqs = [
    {
      q: "Where are shortened links hosted?",
      a: "All shortened links continue to use our short root domain (e.g. tapopen.online/A7X9). This dedicated landing page exists only to describe the Quick Links product capabilities.",
    },
    {
      q: "Can I customize the link alias?",
      a: "No. In order to guarantee the fastest routing speeds and clean aesthetics, TapOpen generates random 4-character hashes (like /A7X9) without custom string overrides.",
    },
    {
      q: "Are the QR codes high resolution?",
      a: "Yes. Every link generates a dynamic, vector-ready SVG QR code that can be scaled to any size for print marketing or digital assets.",
    },
    {
      q: "Are redirect links secure?",
      a: "Absolutely. TapOpen filters destinations against phishing and malware databases before compiling redirects, protecting your audience.",
    },
  ];

  return (
    <div className="min-h-screen bg-white text-[#111827] font-inter selection:bg-blue-50 selection:text-blue-600 overflow-x-hidden relative">

      {/* Navbar */}
      <Navbar session={session} />

      {/* ── Hero + Inline Generator ── */}
      <header className="mx-auto max-w-2xl px-6 pt-24 pb-16 text-center">
        <div className="inline-flex rounded-full border border-[#E5E7EB] bg-[#F8FAFC] px-3.5 py-1 text-xs text-blue-600 font-semibold items-center gap-1.5 mb-6">
          <Link2 className="w-3.5 h-3.5" />
          Quick Links
        </div>
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-[#111827] leading-[1.1] mb-5">
          Short, secure links<br />with instant redirects.
        </h1>
        <p className="text-[#6B7280] max-w-lg mx-auto text-sm leading-relaxed mb-10 font-normal">
          Paste any long URL below. We'll shorten it instantly — no account needed to try.
        </p>

        {/* ── Inline Generator ── */}
        <div className="bg-[#F8FAFC] border border-[#E5E7EB] rounded-2xl p-5 text-left">
          <div className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest mb-3">
            Paste your long URL
          </div>

          {!shortLink ? (
            <div className="flex gap-2">
              <input
                type="url"
                value={url}
                onChange={e => setUrl(e.target.value)}
                onKeyDown={e => e.key === "Enter" && generateShortLink()}
                placeholder="https://your-long-url.com/page?with=params"
                className="flex-1 h-11 px-4 rounded-xl bg-white border border-[#E5E7EB] text-sm text-[#111827] font-medium focus:outline-none focus:border-blue-500 transition-colors placeholder:text-[#9CA3AF]"
              />
              <Button
                onClick={generateShortLink}
                disabled={generating || !url.trim()}
                className="h-11 px-5 bg-[#111827] hover:bg-black text-white rounded-xl text-xs font-bold shrink-0 disabled:opacity-50 shadow-none"
              >
                {generating
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : <><Zap className="w-3.5 h-3.5 mr-1.5" />Shorten</>
                }
              </Button>
            </div>
          ) : (
            /* Success state */
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-white border border-[#E5E7EB] rounded-xl">
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wider mb-0.5">Your short link</div>
                  <div className="text-sm font-bold text-blue-600 truncate">{shortLink}</div>
                </div>
                <button
                  onClick={copyLink}
                  className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-[#F8FAFC] border border-[#E5E7EB] text-[10px] font-bold text-[#111827] hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600 transition-all shrink-0"
                >
                  {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => { setShortLink(""); setUrl(""); }}
                  className="flex-1 h-9 border border-[#E5E7EB] rounded-xl text-[11px] font-bold text-[#6B7280] hover:bg-[#F8FAFC] transition-colors"
                >
                  Shorten another
                </button>
                <Button
                  onClick={goToConsole}
                  className="flex-1 h-9 bg-[#111827] hover:bg-black text-white rounded-xl text-[11px] font-bold shadow-none"
                >
                  <ExternalLink className="w-3 h-3 mr-1.5" />
                  {session ? "Manage all links" : "Save & manage links"}
                </Button>
              </div>
            </div>
          )}

          {/* Nudge line */}
          {!shortLink && (
            <p className="mt-3 text-[10px] text-[#9CA3AF] text-center">
              {session
                ? "Link will be saved to your Quick Links console."
                : "No account needed to try. Sign up free to save and manage your links."}
            </p>
          )}
        </div>
      </header>

      {/* Mini Mockup Visual */}
      <section className="bg-white py-8 border-b border-[#E5E7EB] px-6">
        <div className="mx-auto max-w-lg border border-[#E5E7EB] rounded-2xl p-6 bg-[#F8FAFC]">
          <div className="flex justify-between items-center mb-4">
            <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wide">Quick Links Console</span>
            <span className="bg-green-50 text-green-600 text-[9px] font-bold px-2 py-0.5 rounded">LIVE</span>
          </div>
          <div className="space-y-3">
            <div className="bg-white border border-[#E5E7EB] rounded-lg p-2.5 text-xs text-[#6B7280] truncate">
              https://github.com/tapopen/platform-redesign-details
            </div>
            <div className="flex items-center justify-between border-t border-[#E5E7EB] pt-3">
              <span className="text-xs font-bold text-blue-600">tapopen.online/A7X9</span>
              <div className="flex gap-2">
                <span className="text-[10px] font-semibold text-[#6B7280]">Clicks: 14.8K</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="bg-white py-20 px-6 border-b border-[#E5E7EB]">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-2xl font-extrabold text-[#111827] tracking-tight mb-12 text-center">
            How Quick Links Works
          </h2>
          <div className="grid gap-8 sm:grid-cols-2">
            {benefits.map((benefit, idx) => {
              const Icon = benefit.icon;
              return (
                <div key={idx} className="border border-[#E5E7EB] rounded-xl p-5 bg-white">
                  <div className="inline-flex rounded-lg bg-[#EFF6FF] p-2 text-blue-600 mb-4">
                    <Icon className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-[#111827] mb-2">{benefit.title}</h3>
                  <p className="text-xs text-[#6B7280] leading-relaxed font-normal">{benefit.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-white py-20 px-6 border-b border-[#E5E7EB]">
        <div className="mx-auto max-w-2xl">
          <h2 className="text-2xl font-extrabold text-[#111827] tracking-tight mb-10 text-center">
            Questions about Quick Links
          </h2>
          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFAQ === idx;
              return (
                <div key={idx} className="border border-[#E5E7EB] rounded-xl overflow-hidden bg-white hover:border-[#111827] transition-all">
                  <button
                    onClick={() => setOpenFAQ(isOpen ? null : idx)}
                    className="w-full flex items-center justify-between p-5 text-left text-xs sm:text-sm font-bold text-[#111827]"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`w-3.5 h-3.5 text-[#6B7280] transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: "auto" }}
                        exit={{ height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="p-5 pt-0 border-t border-[#E5E7EB] text-xs text-[#6B7280] leading-relaxed font-normal">
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-white py-20 px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-extrabold text-[#111827] tracking-tight mb-4">
            Simplify your redirection flow.
          </h2>
          <p className="text-xs text-[#6B7280] mb-8 font-medium max-w-xs mx-auto">
            Get instant redirects, detailed geographic analytics, and clean short links under your profile workspace.
          </p>
          <Button
            onClick={goToConsole}
            className="bg-black hover:bg-black/90 text-white rounded-full text-xs px-6 h-10 font-semibold flex items-center gap-1.5 shadow-none mx-auto"
          >
            {session ? "Open Quick Links Console" : "Get Started Free"}
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
}
