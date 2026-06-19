import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ExternalLink, Blocks, LayoutTemplate, Zap } from "lucide-react";
import { ScrollFadeIn } from "@/components/ScrollFadeIn";

const OtherProducts = () => {
  return (
    <div className="min-h-screen bg-transparent text-white selection:bg-primary/30 overflow-hidden relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[400px] bg-primary/10 blur-[120px] rounded-full pointer-events-none -z-10" />
      
      {/* Nav */}
      <nav className="fixed top-4 left-4 right-4 z-50 glass-panel rounded-[2rem] max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-[0_4px_12px_rgba(139,92,246,0.3)] group-hover:rotate-12 transition-transform">
              <Zap className="w-5 h-5 text-white fill-white" />
            </div>
            <span className="font-display text-xl font-black tracking-tighter text-white">TapOpen</span>
          </Link>
          <Button variant="ghost" size="sm" asChild className="hidden md:flex text-gray-400 hover:text-white font-bold text-[10px] uppercase tracking-widest rounded-xl">
            <Link to="/">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
            </Link>
          </Button>
        </div>
      </nav>

      {/* Content */}
      <main className="pt-28 pb-20 px-6 container mx-auto max-w-5xl">
        <ScrollFadeIn>
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-black uppercase tracking-widest text-primary mb-6">
              <Blocks className="w-3 h-3" /> Ecosystem
            </div>
            <h1 className="text-5xl md:text-7xl font-display font-black tracking-tighter mb-6 text-white leading-[1.1]">
              Our Other <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">Products</span>
            </h1>
            <p className="text-gray-400 max-w-xl mx-auto font-medium text-lg leading-relaxed">
              Explore the rest of the TapOpen ecosystem designed to supercharge your digital workflow.
            </p>
          </div>
        </ScrollFadeIn>

        <ScrollFadeIn delay={200}>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* TapOpen Forms Card */}
            <div className="group relative p-8 md:p-10 glass-panel hover:border-primary/50 transition-all duration-500 hover:shadow-[0_20px_40px_-12px_rgba(139,92,246,0.15)] flex flex-col h-full overflow-hidden rounded-3xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-[50px] rounded-full group-hover:bg-primary/20 transition-colors" />
              
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-purple-600/20 border border-primary/30 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(139,92,246,0.2)]">
                <LayoutTemplate className="w-7 h-7 text-primary" />
              </div>
              
              <h3 className="text-3xl font-black mb-4 tracking-tighter text-white">TapOpen Forms</h3>
              <p className="text-gray-400 leading-relaxed text-base font-medium mb-10 flex-grow">
                Create beautiful, high-converting forms in seconds. Integrate them seamlessly into your TapOpen links or embed them anywhere on the web.
              </p>
              
              <Button asChild className="w-full h-14 rounded-xl text-base font-black uppercase tracking-widest group/btn shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:shadow-[0_0_30px_rgba(139,92,246,0.5)] transition-all">
                <a href="https://forms.tapopen.online/" target="_blank" rel="noopener noreferrer">
                  Open Forms <ExternalLink className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                </a>
              </Button>
            </div>

            {/* Coming Soon Card */}
            <div className="group relative p-8 md:p-10 glass-panel border-dashed border-white/10 flex flex-col items-center justify-center text-center h-full min-h-[400px] rounded-3xl">
              <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6">
                <Zap className="w-7 h-7 text-gray-500" />
              </div>
              <h3 className="text-2xl font-black mb-2 tracking-tighter text-gray-300">More Coming Soon</h3>
              <p className="text-gray-500 font-medium">We're constantly building new tools for creators.</p>
            </div>
          </div>
        </ScrollFadeIn>
      </main>
    </div>
  );
};

export default OtherProducts;
