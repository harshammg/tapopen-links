import { Github, ArrowUpRight, GitFork, Eye } from "lucide-react";

export default function OpenSource() {
  return (
    <section className="py-24 px-6 bg-[#F8FAFC] border-t border-[#E5E7EB] font-inter text-[#111827]" id="open-source">
      <div className="mx-auto max-w-4xl">

        {/* Header */}
        <div className="mb-12 max-w-2xl">
          <div className="inline-flex items-center gap-2 mb-4 px-3 py-1 border border-[#E5E7EB] rounded-full bg-white">
            <Github className="w-3.5 h-3.5 text-[#111827]" />
            <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-widest">Open Source</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#111827] leading-tight">
            Built in the Open.<br />Open Source by Design.
          </h2>
          <p className="text-sm text-[#6B7280] mt-4 leading-relaxed max-w-xl">
            TapOpen believes great software should be transparent and community-driven.
            Parts of the TapOpen ecosystem are fully open source — inspect the code, contribute improvements,
            report issues, and build upon the platform.
          </p>
          <p className="text-sm text-[#6B7280] mt-3 leading-relaxed max-w-xl">
            Whether you're a student, developer, startup, or contributor, you're welcome to explore
            the project and help shape its future.
          </p>
        </div>

        {/* Repo Card */}
        <div className="grid gap-4 sm:grid-cols-2 mb-10">
          <a
            href="https://github.com/stars/harshammg/lists/tapopen"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col justify-between p-6 bg-[#0d1117] text-white rounded-2xl border border-[#30363d] hover:border-[#58a6ff] transition-all duration-200"
          >
            <div className="flex items-start justify-between mb-4">
              <Github className="w-5 h-5 text-white" />
              <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
            </div>
            <div>
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">harshammg</div>
              <h3 className="text-sm font-bold">TapOpen Open Source List</h3>
              <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                Collection of all open source repositories powering the TapOpen ecosystem. Built for creators, businesses, and developers.
              </p>
            </div>
            <div className="mt-5 flex items-center gap-4 text-[10px] text-slate-500 font-semibold">
              <span className="flex items-center gap-1"><GitFork className="w-3 h-3" /> Fork</span>
              <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> Watch</span>
              <span className="w-2 h-2 rounded-full bg-orange-500"></span>
              <span>TypeScript</span>
            </div>
          </a>

          {/* Contribute CTA card */}
          <div className="flex flex-col justify-between p-6 bg-white rounded-2xl border border-[#E5E7EB]">
            <div>
              <div className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest mb-3">Contribute</div>
              <h3 className="text-base font-extrabold tracking-tight text-[#111827]">Help shape TapOpen.</h3>
              <p className="text-[11px] text-[#6B7280] mt-3 leading-relaxed">
                Found a bug? Have a feature idea? Want to improve the documentation?
                Open a pull request or start a discussion on GitHub.
              </p>
            </div>
            <div className="mt-6 flex flex-col gap-2">
              <a
                href="https://github.com/stars/harshammg/lists/tapopen"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5 h-9 px-4 bg-[#0d1117] text-white text-xs font-bold rounded-full hover:bg-[#1c2128] transition-colors"
              >
                <Github className="w-3.5 h-3.5" />
                View Repositories
              </a>
              <a
                href="https://github.com/stars/harshammg/lists/tapopen"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5 h-9 px-4 border border-[#E5E7EB] text-[#111827] text-xs font-bold rounded-full hover:bg-[#F8FAFC] transition-colors"
              >
                Contribute
              </a>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
