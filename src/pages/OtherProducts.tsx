import { Link } from "react-router-dom";
import { Zap, Link2, User, FileText, Send, ArrowRight } from "lucide-react";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

export default function OtherProducts() {
  const products = [
    {
      name: "Quick Links",
      tagline: "Short, secure, trackable links.",
      description: "Fast, reliable URL shortening built with custom analytics tracking and instant vector QR codes for print and web media.",
      icon: Link2,
      exploreUrl: "/quick-links",
      isExternal: false,
      preview: (
        <div className="w-full max-w-[280px] border border-[#E5E7EB] rounded-xl p-4 bg-white text-left text-xs text-[#111827] shadow-sm select-none">
          <div className="font-semibold text-blue-600">tapopen.online/A7X9</div>
          <div className="mt-2 text-[#6B7280]">Redirects to dynamic target destination instantly with zero delays.</div>
        </div>
      )
    },
    {
      name: "Profiles",
      tagline: "A modern link-in-bio page for creators and businesses.",
      description: "Claim a single professional page to list your bios, portfolios, stores, blog posts, and contact cards in a clean, default theme layout.",
      icon: User,
      exploreUrl: "/profiles",
      isExternal: false,
      preview: (
        <div className="w-full max-w-[280px] border border-[#E5E7EB] bg-[#F8FAFC] rounded-xl p-4 text-center text-xs text-[#111827] shadow-sm select-none">
          <div className="w-10 h-10 rounded-full bg-slate-200 mx-auto mb-2"></div>
          <div className="font-bold">tapopen.online/harsha</div>
          <div className="mt-1 text-[10px] text-[#6B7280]">Software Creator</div>
        </div>
      )
    },
    {
      name: "Forms",
      tagline: "Create beautiful forms and collect responses.",
      description: "Build feedback surveys, capture email leads, or register event attendees using a visual form builder hosted at forms.tapopen.online.",
      icon: FileText,
      exploreUrl: "https://forms.tapopen.online",
      isExternal: true,
      preview: (
        <div className="w-full max-w-[280px] border border-[#E5E7EB] bg-white rounded-xl p-4 text-left text-xs text-[#111827] shadow-sm select-none">
          <div className="font-semibold text-[#6B7280] uppercase text-[9px] mb-2">Registration Form</div>
          <div className="h-6 border border-[#E5E7EB] bg-[#F8FAFC] rounded px-2 flex items-center text-[10px] text-[#6B7280]">Email address</div>
          <div className="mt-2 h-6 bg-black rounded flex items-center justify-center text-[10px] text-white font-medium">Submit</div>
        </div>
      )
    },
    {
      name: "Bulky",
      tagline: "Send personalized WhatsApp campaigns.",
      description: "Broadcast personalized messages, delivery tracking, templates, and campaign results safely to contacts using our open-source application.",
      icon: Send,
      exploreUrl: "https://github.com/harshammg/tapopen-bulky",
      isExternal: true,
      preview: (
        <div className="w-full max-w-[280px] border border-[#E5E7EB] bg-white rounded-xl p-4 text-left text-xs text-[#111827] shadow-sm select-none">
          <div className="flex justify-between items-center text-[9px] font-bold text-[#6B7280] mb-2">
            <span>Broadcasting...</span>
            <span className="text-green-600">98% DELIVERED</span>
          </div>
          <div className="h-2 bg-[#F8FAFC] border border-[#E5E7EB] rounded-full overflow-hidden">
            <div className="bg-blue-600 h-full w-[98%]"></div>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-white text-[#111827] font-inter selection:bg-blue-50 selection:text-blue-600 overflow-x-hidden relative">
      
      {/* Navbar */}
      <Navbar session={null} />

      {/* Header Title */}
      <header className="mx-auto max-w-3xl px-6 pt-24 pb-12 text-center border-b border-[#E5E7EB]">
        <span className="text-xs font-bold uppercase tracking-wider text-blue-600 block mb-3">PRODUCT CATALOGUE</span>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-[#111827]">
          The TapOpen Suite
        </h1>
        <p className="text-[#6B7280] mt-4 font-normal max-w-xl mx-auto text-sm sm:text-base leading-relaxed">
          Four independent, high-performance tools engineered to build your digital presence, collect feedback, and communicate at scale.
        </p>
      </header>

      {/* Products Stack */}
      <main className="mx-auto max-w-3xl px-6">
        <div className="divide-y divide-[#E5E7EB]">
          {products.map((prod, idx) => {
            const Icon = prod.icon;
            const isExt = prod.isExternal;

            const rowContent = (
              <div className="group py-16 flex flex-col md:flex-row items-start md:items-center justify-between gap-12">
                
                {/* Text column */}
                <div className="flex-1 space-y-4">
                  <div className="inline-flex rounded-full border border-[#E5E7EB] bg-[#F8FAFC] px-3 py-1 text-xs text-[#6B7280] items-center gap-1.5 select-none font-semibold">
                    <Icon className="w-3.5 h-3.5" />
                    {prod.name}
                  </div>
                  <h2 className="text-2xl font-extrabold text-[#111827] tracking-tight">
                    {prod.tagline}
                  </h2>
                  <p className="text-sm text-[#6B7280] leading-relaxed font-normal">
                    {prod.description}
                  </p>
                  
                  <div className="pt-2">
                    <div className="inline-flex items-center gap-1 text-sm font-semibold text-[#111827] group-hover:underline">
                      Explore Product
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1 duration-200" />
                    </div>
                  </div>
                </div>

                {/* Minimal preview mockup panel */}
                <div className="w-full md:w-auto shrink-0 flex justify-center md:justify-end">
                  {prod.preview}
                </div>

              </div>
            );

            return isExt ? (
              <a key={idx} href={prod.exploreUrl} target="_blank" rel="noopener noreferrer" className="block">
                {rowContent}
              </a>
            ) : (
              <Link key={idx} to={prod.exploreUrl} className="block">
                {rowContent}
              </Link>
            );
          })}
        </div>
      </main>

      {/* Footer */}
      <Footer />

    </div>
  );
}
