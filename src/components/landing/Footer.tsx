import { Link } from "react-router-dom";
import { Zap } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-white py-12 px-6 border-t border-[#E5E7EB] font-inter text-[#111827]">
      <div className="mx-auto max-w-5xl">
        
        {/* Footer layout */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          
          {/* Logo & Copyright */}
          <div className="flex items-center gap-3">
            <Zap className="w-3.5 h-3.5 text-[#111827] fill-current" />
            <p className="text-xs text-[#6B7280] font-normal">
              © {new Date().getFullYear()} TapOpen.
            </p>
          </div>

          {/* Links */}
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-[#6B7280] font-semibold">
            <Link to="/products" className="hover:text-[#111827] transition-colors">Products</Link>
            <a href="#company" className="hover:text-[#111827] transition-colors">Company</a>
            <a href="#privacy" className="hover:text-[#111827] transition-colors">Privacy</a>
            <a href="#terms" className="hover:text-[#111827] transition-colors">Terms</a>
            <a href="mailto:contact@tapopen.online" className="hover:text-[#111827] transition-colors">Contact</a>
          </div>

        </div>

      </div>
    </footer>
  );
}
