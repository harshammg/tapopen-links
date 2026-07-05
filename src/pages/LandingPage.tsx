import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";

import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import ProductsGrid from "@/components/landing/ProductsGrid";
import Philosophy from "@/components/landing/Philosophy";
import OpenSource from "@/components/landing/OpenSource";
import Footer from "@/components/landing/Footer";

export default function LandingPage() {
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
  }, []);

  return (
    <div className="relative w-full min-h-screen bg-white text-[#111827] font-inter selection:bg-blue-50 selection:text-blue-600 overflow-x-hidden z-10">

      {/* Navigation */}
      <Navbar session={session} />

      {/* Hero Section */}
      <Hero session={session} />

      {/* Products Row Catalogue */}
      <ProductsGrid />

      {/* Product Philosophy */}
      <Philosophy />

      {/* Open Source Section */}
      <OpenSource />

      {/* Final CTA Section */}
      <section className="bg-white py-24 px-6 border-t border-[#E5E7EB] font-inter text-[#111827]">
        <div className="mx-auto max-w-2xl text-center">

          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#111827] mb-8">
            Choose the product that fits your workflow.
          </h2>

          <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-3">
            <Button asChild variant="outline" className="border-[#E5E7EB] text-[#111827] hover:bg-[#F8FAFC] rounded-full text-sm px-6 py-5 font-semibold w-full sm:w-auto">
              <Link to="/quick-links">Quick Links</Link>
            </Button>
            <Button asChild variant="outline" className="border-[#E5E7EB] text-[#111827] hover:bg-[#F8FAFC] rounded-full text-sm px-6 py-5 font-semibold w-full sm:w-auto">
              <Link to="/profiles">Profiles</Link>
            </Button>
            <Button asChild variant="outline" className="border-[#E5E7EB] text-[#111827] hover:bg-[#F8FAFC] rounded-full text-sm px-6 py-5 font-semibold w-full sm:w-auto">
              <a href="https://forms.tapopen.online" target="_blank" rel="noopener noreferrer">Forms</a>
            </Button>
            <Button asChild variant="outline" className="border-[#E5E7EB] text-[#111827] hover:bg-[#F8FAFC] rounded-full text-sm px-6 py-5 font-semibold w-full sm:w-auto">
              <a href="https://github.com/harshammg/tapopen-bulky" target="_blank" rel="noopener noreferrer">Bulky</a>
            </Button>
          </div>

        </div>
      </section>

      {/* Footer */}
      <Footer />

    </div>
  );
}
