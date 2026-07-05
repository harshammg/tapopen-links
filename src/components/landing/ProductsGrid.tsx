import { Link2, User, FileText, Send, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function ProductsGrid() {
  const products = [
    {
      name: "Quick Links",
      description: "Short, secure links with instant redirects.",
      icon: Link2,
      href: "/quick-links",
      isExternal: false,
    },
    {
      name: "Profiles",
      description: "Create a beautiful link-in-bio page.",
      icon: User,
      href: "/profiles",
      isExternal: false,
    },
    {
      name: "Forms",
      description: "Simple forms for collecting responses.",
      icon: FileText,
      href: "https://forms.tapopen.online",
      isExternal: true,
    },
    {
      name: "Bulky",
      description: "Send personalized WhatsApp campaigns.",
      icon: Send,
      href: "https://github.com/harshammg/tapopen-bulky",
      isExternal: true,
    },
  ];

  return (
    <section id="products" className="bg-white py-20 px-6 font-inter text-[#111827]">
      <div className="mx-auto max-w-3xl">
        
        {/* Products List Wrapper */}
        <div className="space-y-0">
          {products.map((product, idx) => {
            const Icon = product.icon;
            const isExt = product.isExternal;
            
            const content = (
              <div className="group flex flex-col sm:flex-row sm:items-center sm:justify-between py-8 border-t border-[#E5E7EB] last:border-b last:border-[#E5E7EB] transition-colors duration-200 cursor-pointer">
                
                {/* Product details */}
                <div className="flex items-start gap-4 mb-4 sm:mb-0">
                  <div className="mt-1 text-[#111827]">
                    <Icon className="w-5 h-5 shrink-0 text-[#111827]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[#111827] flex items-center gap-2">
                      {product.name}
                    </h3>
                    <p className="text-sm text-[#6B7280] mt-1 font-normal leading-relaxed">
                      {product.description}
                    </p>
                  </div>
                </div>

                {/* Explore Link */}
                <div className="flex items-center gap-1 text-sm font-semibold text-[#111827] pl-9 sm:pl-0">
                  <span>Explore</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1 duration-200 text-[#111827]" />
                </div>

              </div>
            );

            return isExt ? (
              <a key={idx} href={product.href} target="_blank" rel="noopener noreferrer" className="block">
                {content}
              </a>
            ) : (
              <Link key={idx} to={product.href} className="block">
                {content}
              </Link>
            );
          })}
        </div>

      </div>
    </section>
  );
}
