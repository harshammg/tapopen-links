import { Zap, Layers, Shield } from "lucide-react";

const pillars = [
  {
    icon: Zap,
    title: "One product, one problem.",
    desc: "Every TapOpen product solves one specific problem exceptionally well. No feature sprawl. No unnecessary complexity.",
  },
  {
    icon: Layers,
    title: "Independent by design.",
    desc: "Instead of combining unrelated features into one application, each product is a standalone experience with its own focus and identity.",
  },
  {
    icon: Shield,
    title: "One account. Everything connected.",
    desc: "Quick Links, Profiles, Forms, and Bulky all share a single unified account and design language — so switching between them feels seamless.",
  },
];

export default function Philosophy() {
  return (
    <section className="bg-white py-24 px-6 font-inter text-[#111827] border-t border-[#E5E7EB]" id="about">
      <div className="mx-auto max-w-4xl">

        {/* Header */}
        <div className="max-w-2xl mb-14">
          <div className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest mb-4">Product Philosophy</div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#111827] leading-tight">
            Built to stay out of your way.
          </h2>
          <p className="text-sm text-[#6B7280] mt-4 leading-relaxed">
            Every TapOpen product is intentionally independent. Rather than combining unrelated features into one bloated application,
            each product is built as a standalone experience — while sharing one unified account system and one consistent design language.
          </p>
        </div>

        {/* Three pillars */}
        <div className="grid gap-6 sm:grid-cols-3">
          {pillars.map((p, i) => {
            const Icon = p.icon;
            return (
              <div key={i} className="flex flex-col gap-3 p-6 border border-[#E5E7EB] rounded-2xl bg-[#F8FAFC]">
                <div className="w-9 h-9 rounded-xl bg-white border border-[#E5E7EB] flex items-center justify-center">
                  <Icon className="w-4 h-4 text-[#111827]" />
                </div>
                <h3 className="text-sm font-bold text-[#111827]">{p.title}</h3>
                <p className="text-[11px] text-[#6B7280] leading-relaxed">{p.desc}</p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
