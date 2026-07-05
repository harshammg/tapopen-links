import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronDown, Zap, Link2, User, FileText, Send, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NavbarProps {
  session: any;
}

export default function Navbar({ session }: NavbarProps) {
  const [isProductsOpen, setIsProductsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProductsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const productsList = [
    { name: "Quick Links", icon: Link2, href: "/quick-links" },
    { name: "Profiles", icon: User, href: "/profiles" },
    { name: "Forms", icon: FileText, href: "https://forms.tapopen.online", isExternal: true },
    { name: "Bulky", icon: Send, href: "https://github.com/harshammg/tapopen-bulky", isExternal: true },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-[#E5E7EB] bg-white/95 backdrop-blur-sm font-inter text-[#111827]">
      <div className="mx-auto max-w-5xl px-6">
        <div className="flex h-16 items-center justify-between">
          
          {/* Logo */}
          <div className="flex items-center gap-10">
            <Link to="/" className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#111827] fill-current" />
              <span className="font-semibold text-base tracking-tight text-[#111827]">TapOpen</span>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center gap-8">
              <Link to="/" className="text-sm font-medium text-[#6B7280] hover:text-[#111827] transition-colors">
                Home
              </Link>

              {/* Products Menu */}
              <div 
                className="relative"
                ref={dropdownRef}
                onMouseEnter={() => setIsProductsOpen(true)}
                onMouseLeave={() => setIsProductsOpen(false)}
              >
                <button 
                  onClick={() => navigate("/products")}
                  className="flex items-center gap-1 text-sm font-medium text-[#6B7280] hover:text-[#111827] transition-colors py-2"
                >
                  Products
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isProductsOpen ? "rotate-180" : ""}`} />
                </button>

                {/* Minimal Dropdown Menu */}
                {isProductsOpen && (
                  <div className="absolute left-0 top-full pt-1 w-48">
                    <div className="rounded-xl border border-[#E5E7EB] bg-white p-1.5 shadow-sm">
                      {productsList.map((product) => {
                        const Icon = product.icon;
                        const isExt = product.isExternal;
                        const itemClass = "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-[#6B7280] hover:text-[#111827] hover:bg-[#F8FAFC] transition-colors";
                        
                        return isExt ? (
                          <a key={product.name} href={product.href} target="_blank" rel="noopener noreferrer" className={itemClass} onClick={() => setIsProductsOpen(false)}>
                            <Icon className="w-4 h-4 shrink-0 text-[#6B7280]" />
                            {product.name}
                          </a>
                        ) : (
                          <Link key={product.name} to={product.href} className={itemClass} onClick={() => setIsProductsOpen(false)}>
                            <Icon className="w-4 h-4 shrink-0 text-[#6B7280]" />
                            {product.name}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              <a href="#about" className="text-sm font-medium text-[#6B7280] hover:text-[#111827] transition-colors">
                About
              </a>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="hidden md:flex items-center gap-4">
            {session ? (
              <Button asChild className="bg-black hover:bg-[#111827]/90 text-white rounded-full text-xs px-4 py-2 font-medium">
              <Link to="/console">Console</Link>
              </Button>
            ) : (
              <>
                <Button variant="ghost" asChild className="text-[#6B7280] hover:text-[#111827] hover:bg-transparent font-medium text-sm px-2">
                  <Link to="/auth/login">Login</Link>
                </Button>
                <Button asChild className="bg-black hover:bg-[#111827]/90 text-white rounded-full text-xs px-4 py-2 font-medium">
                  <Link to="/auth/signup">Get Started</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 text-[#6B7280] hover:text-[#111827]"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu Panel */}
      {isMobileMenuOpen && (
        <div className="border-b border-[#E5E7EB] bg-white px-6 py-4 md:hidden animate-fade-in-up font-inter">
          <div className="grid gap-4">
            <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-semibold text-[#111827] py-1">
              Home
            </Link>

            <div className="font-semibold text-xs uppercase tracking-wider text-[#6B7280]">Products</div>
            <div className="grid gap-2 pl-2">
              <Link to="/products" onClick={() => setIsMobileMenuOpen(false)} className="text-xs font-semibold text-blue-600 underline py-1">
                View All Products
              </Link>
              {productsList.map((product) => {
                const Icon = product.icon;
                const isExt = product.isExternal;
                const content = (
                  <div className="flex items-center gap-2.5 py-1 text-sm font-medium text-[#6B7280] hover:text-[#111827]">
                    <Icon className="w-4 h-4" />
                    {product.name}
                  </div>
                );
                return isExt ? (
                  <a key={product.name} href={product.href} target="_blank" rel="noopener noreferrer">
                    {content}
                  </a>
                ) : (
                  <Link key={product.name} to={product.href} onClick={() => setIsMobileMenuOpen(false)}>
                    {content}
                  </Link>
                );
              })}
            </div>

            <hr className="border-[#E5E7EB]" />

            <a href="#about" onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-medium text-[#6B7280] hover:text-[#111827] py-1">
              About
            </a>

            <hr className="border-[#E5E7EB]" />

            {session ? (
              <Button asChild className="bg-black hover:bg-[#111827]/90 text-white rounded-full text-sm w-full py-2 font-medium">
                <Link to="/console" onClick={() => setIsMobileMenuOpen(false)}>
                  Console
                </Link>
              </Button>
            ) : (
              <div className="grid gap-2">
                <Button variant="outline" asChild className="border-[#E5E7EB] text-[#111827] hover:bg-[#F8FAFC] rounded-full w-full py-2 font-medium">
                  <Link to="/auth/login" onClick={() => setIsMobileMenuOpen(false)}>
                    Login
                  </Link>
                </Button>
                <Button asChild className="bg-black hover:bg-[#111827]/90 text-white rounded-full text-sm w-full py-2 font-medium">
                  <Link to="/auth/signup" onClick={() => setIsMobileMenuOpen(false)}>
                    Get Started
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
