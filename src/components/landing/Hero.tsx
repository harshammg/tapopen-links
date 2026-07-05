import { Link } from "react-router-dom";
import { Zap, Link2, User, FileText, Send, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeroProps {
  session: any;
}

export default function Hero({ session }: HeroProps) {
  const products = [
    { name: "Quick Links", icon: Link2 },
    { name: "Profiles", icon: User },
    { name: "Forms", icon: FileText },
    { name: "Bulky", icon: Send },
  ];

  return (
    <section className="bg-white pt-24 pb-20 px-6 font-inter text-[#111827]">
      <div className="mx-auto max-w-4xl text-center">
        
        {/* Large Headline */}
        <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight text-[#111827] leading-[1.05] mb-8">
          One platform.<br />Four simple products.
        </h1>

        {/* Subheadline */}
        <p className="text-base sm:text-xl text-[#6B7280] leading-relaxed max-w-2xl mx-auto mb-10 font-normal">
          Everything you need to share links, build your online presence, collect information, and connect with your audience.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20 w-full sm:w-auto">
          <Button asChild className="bg-black hover:bg-[#111827]/90 text-white rounded-full text-sm px-6 py-5 font-semibold w-full sm:w-auto shadow-none">
            <Link to={session ? "/console" : "/auth/signup"}>Get Started</Link>
          </Button>
          <Button variant="outline" asChild className="border-[#E5E7EB] text-[#111827] hover:bg-[#F8FAFC] rounded-full text-sm px-6 py-5 font-semibold w-full sm:w-auto">
            <a href="#products">Explore Products</a>
          </Button>
        </div>

        {/* Minimal composition of products with simple icons */}
        <div className="border-t border-[#E5E7EB] pt-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
            {products.map((prod, idx) => {
              const Icon = prod.icon;
              return (
                <div 
                  key={idx}
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-[#E5E7EB] bg-white text-[#6B7280] hover:text-[#111827] hover:border-[#111827] transition-all select-none"
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="text-xs font-semibold">{prod.name}</span>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
}
