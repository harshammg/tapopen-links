export default function TrustedBy() {
  const companies = [
    { name: "Acme Corp" },
    { name: "Stripe" },
    { name: "Vercel" },
    { name: "Linear" },
    { name: "Notion" },
    { name: "Framer" }
  ];

  return (
    <section className="bg-[#F8FAFC] py-10 px-6 border-b border-[#E5E7EB] font-inter">
      <div className="mx-auto max-w-7xl">
        <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#6B7280] text-center mb-8">
          TRUSTED BY MODERN TEAMS WORLDWIDE
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-16 gap-y-8 opacity-50 grayscale hover:opacity-75 transition-opacity">
          {companies.map((company) => (
            <div key={company.name} className="flex items-center gap-2 select-none">
              <span className="font-extrabold text-lg tracking-tight text-[#111827]">{company.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
