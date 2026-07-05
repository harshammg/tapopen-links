import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronDown, User, ShieldCheck, Palette, FileText, Send, Briefcase, ShoppingCart, Globe, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { supabase } from "@/lib/supabase";

export default function ProfilesLanding() {
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);
  const [session, setSession] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
  }, []);

  const goToProfiles = () => {
    if (session) {
      navigate("/console/profiles");
    } else {
      localStorage.setItem("tapopen_redirect", "/console/profiles");
      navigate("/auth/signup");
    }
  };

  const features = [
    {
      icon: Briefcase,
      title: "Projects & Portfolio",
      desc: "Integrate a beautiful portfolio index directly onto your profile page to show clients and visitors your work.",
    },
    {
      icon: ShoppingCart,
      title: "Store & Digital Sales",
      desc: "Link Gumroad, Lemon Squeezy, or Shopify templates directly with clean visual blocks.",
    },
    {
      icon: FileText,
      title: "Subtle Blogs & Articles",
      desc: "Publish simple, readable markdown blog articles inside the same page view without maintaining a database.",
    },
    {
      icon: Palette,
      title: "Default-Premium Theme Only",
      desc: "No distracting colors, customized typography, or animations. We enforce one highly polished theme optimized for professional trust.",
    },
  ];

  const faqs = [
    {
      q: "Can I use my own profile slug?",
      a: "Yes. When you register, you claim a custom identifier (like tapopen.online/harsha). Slugs are allocated on a first-come, first-served basis.",
    },
    {
      q: "Can I change fonts, colors, or add custom templates?",
      a: "No. TapOpen Profiles relies on one universal, highly optimized, light-themed professional layout. By removing custom styling choices, we ensure fast page load speeds and premium readability.",
    },
    {
      q: "Can I connect a custom domain?",
      a: "Yes. Pro users can route custom domains (such as youname.com) to point to their TapOpen profile page cleanly.",
    },
    {
      q: "How many projects or blog articles can I add?",
      a: "You can add unlimited portfolio items, store lists, and blog posts to help represent your projects completely.",
    },
  ];

  return (
    <div className="min-h-screen bg-white text-[#111827] font-inter selection:bg-blue-50 selection:text-blue-600 overflow-x-hidden relative">
      
      {/* Navbar */}
      <Navbar session={session} />

      {/* Hero Section */}
      <header className="mx-auto max-w-4xl px-6 pt-24 pb-16 text-center">
        <div className="inline-flex rounded-full border border-[#E5E7EB] bg-[#F8FAFC] px-3.5 py-1 text-xs text-blue-600 font-semibold items-center gap-1.5 mb-6">
          <User className="w-3.5 h-3.5" />
          Profiles Product
        </div>
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-[#111827] leading-[1.1] mb-6">
          Create a beautiful<br />link-in-bio page.
        </h1>
        <p className="text-[#6B7280] max-w-xl mx-auto text-sm sm:text-base leading-relaxed mb-10 font-normal">
          Gather your projects, resume, stores, blog articles, and social profiles inside one premium, default-styled page.
        </p>
        <div className="flex justify-center">
          <Button
            onClick={goToProfiles}
            className="bg-black hover:bg-black/90 text-white rounded-full text-xs px-6 h-10 font-semibold shadow-none"
          >
            {session ? "Open Profiles Console" : "Claim Your Link-in-Bio"}
          </Button>
        </div>
      </header>

      {/* Profile Mockup Composition */}
      <section className="bg-white py-8 border-b border-[#E5E7EB] px-6 flex justify-center">
        <div className="w-full max-w-[280px] border border-[#E5E7EB] rounded-2xl p-5 bg-[#F8FAFC] text-center shadow-sm select-none">
          <div className="w-12 h-12 rounded-full bg-slate-200 border-2 border-white mx-auto mb-3 shadow-sm flex items-center justify-center font-bold text-slate-700 text-sm">H</div>
          <div className="text-xs font-bold">Harsha Dev</div>
          <div className="text-[10px] text-[#6B7280] mt-0.5 leading-relaxed">Full-stack software developer building digital workflows.</div>
          
          <div className="mt-4 space-y-2">
            <div className="bg-white border border-[#E5E7EB] rounded-lg py-2 text-[10px] font-semibold">
              💼 View Portfolio
            </div>
            <div className="bg-white border border-[#E5E7EB] rounded-lg py-2 text-[10px] font-semibold">
              🛒 Templates Gumroad Store
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="bg-white py-20 px-6 border-b border-[#E5E7EB]">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-2xl font-extrabold text-[#111827] tracking-tight mb-12 text-center">
            Designed for Simplicity and Speed
          </h2>
          <div className="grid gap-8 sm:grid-cols-2">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div key={idx} className="border border-[#E5E7EB] rounded-xl p-5 bg-white">
                  <div className="inline-flex rounded-lg bg-[#EFF6FF] p-2 text-blue-600 mb-4">
                    <Icon className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-[#111827] mb-2">{feature.title}</h3>
                  <p className="text-xs text-[#6B7280] leading-relaxed font-normal">{feature.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ section */}
      <section className="bg-white py-20 px-6 border-b border-[#E5E7EB]">
        <div className="mx-auto max-w-2xl">
          <h2 className="text-2xl font-extrabold text-[#111827] tracking-tight mb-10 text-center font-inter">
            Profiles FAQ
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
            Build your professional bio page.
          </h2>
          <p className="text-xs text-[#6B7280] mb-8 font-medium max-w-xs mx-auto">
            Choose a slug handle, list your links and templates, and publish your landing page in less than 2 minutes.
          </p>
          <div className="flex justify-center">
            <Button
              onClick={goToProfiles}
              className="bg-black hover:bg-black/90 text-white rounded-full text-xs px-6 h-10 font-semibold flex items-center gap-1 shadow-none"
            >
              {session ? "Open Profiles Console" : "Claim Your Handle"}
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />

    </div>
  );
}
