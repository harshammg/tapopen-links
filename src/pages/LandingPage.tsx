import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  ArrowRight, Smartphone, Zap, ClipboardPaste, Share2, 
  Shield, Globe, Lock, CheckCircle2, AlertCircle, 
  LayoutDashboard, QrCode, Briefcase, BookOpen, Sparkles
} from "lucide-react";
import { platforms } from "@/lib/data";
import { ScrollFadeIn } from "@/components/ScrollFadeIn";
import { supabase } from "@/lib/supabase";
import AnonymousGenerator from "@/components/AnonymousGenerator";
import { motion, AnimatePresence } from "framer-motion";

const featuresData = [
  {
    icon: Smartphone,
    title: "Links that open the app",
    desc: "Tired of links opening in slow, logged-out browsers? TapOpen forces Spotify, YouTube, and WhatsApp links to open directly in their native apps. Zero friction, total engagement.",
    color: "text-blue-400",
    dotColor: "bg-blue-400",
    shadow: "shadow-[0_0_10px_rgba(96,165,250,0.5)]"
  },
  {
    icon: Globe,
    title: "One page, every link",
    desc: "Gather your socials, portfolios, and content in one place. Share a single URL that replaces a dozen messy links in your bio.",
    color: "text-purple-400",
    dotColor: "bg-purple-400",
    shadow: "shadow-[0_0_10px_rgba(192,132,252,0.5)]"
  },
  {
    icon: QrCode,
    title: "QR codes for real life",
    desc: "Your networking power, always in your pocket. Anyone can scan your QR code to get all your links instantly. Faster and more professional than any business card.",
    color: "text-green-400",
    dotColor: "bg-green-400",
    shadow: "shadow-[0_0_10px_rgba(74,222,128,0.5)]"
  }
];

const LandingPage = () => {
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
  }, []);

  const [activeFeatureIndex, setActiveFeatureIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeatureIndex((current) => (current + 1) % featuresData.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-transparent text-white selection:bg-primary/30 overflow-hidden">
      {/* Nav */}
      <nav className="fixed top-4 left-4 right-4 z-50 glass-panel rounded-[2rem] max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-[0_4px_12px_rgba(139,92,246,0.3)] group-hover:rotate-12 transition-transform">
              <Zap className="w-5 h-5 text-white fill-white" />
            </div>
            <span className="font-display text-xl font-black tracking-tighter text-white">TapOpen</span>
          </Link>
          
          <div className="hidden md:flex items-center gap-8 text-[10px] font-black uppercase tracking-[0.25em] text-gray-400">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#platform" className="hover:text-white transition-colors">Platforms</a>
            <Link to="/products" className="hover:text-white transition-colors">Products</Link>
          </div>

          <div className="flex gap-4">
            {session ? (
              <Button size="sm" className="rounded-xl font-bold text-[10px] uppercase tracking-widest px-6" asChild>
                <Link to="/dashboard/hub">
                  <LayoutDashboard className="mr-2 h-3.5 w-3.5" /> Dashboard
                </Link>
              </Button>
            ) : (
              <>
                <Button variant="ghost" size="sm" className="hidden sm:flex text-gray-400 hover:text-white font-bold text-[10px] uppercase tracking-widest" asChild>
                  <Link to="/auth/login">Login</Link>
                </Button>
                <Button size="sm" className="rounded-xl font-bold text-[10px] uppercase tracking-widest px-6" asChild>
                  <Link to="/auth/signup">Join Elite</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-24 pb-12 md:pt-32 md:pb-16 px-6">
        <div className="container mx-auto text-center max-w-5xl">
          <ScrollFadeIn>
            <div className="inline-flex items-center gap-2 glass-panel px-4 py-2 rounded-full text-[8px] font-black uppercase tracking-[0.3em] mb-8 text-gray-400">
              <Sparkles className="h-3 w-3 text-yellow-500" /> 
              Evolution of Digital Identity
            </div>
          </ScrollFadeIn>
          
          <ScrollFadeIn delay={100}>
            <h1 className="text-4xl sm:text-6xl md:text-9xl font-display font-black mb-8 leading-[1.1] md:leading-[0.85] tracking-tighter text-white">
              One page for <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-green-400">all your links.</span>
            </h1>
          </ScrollFadeIn>

          <ScrollFadeIn delay={200}>
            <p className="text-sm md:text-xl text-gray-400 max-w-2xl mx-auto mb-12 font-medium leading-relaxed">
              Your Instagram, YouTube, Spotify, portfolio - everything in one place. Just share one link and people find everything. No more 'my link is in my bio' confusion.
            </p>
          </ScrollFadeIn>

          <ScrollFadeIn delay={300}>
            <div className="flex flex-col items-center gap-6">
              <AnonymousGenerator session={session} />
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-30 hidden sm:block">Get your free page</p>
            </div>
          </ScrollFadeIn>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-12 md:py-16 px-6 relative">
        <div className="container mx-auto max-w-6xl">
          {/* Mobile Header Layout */}
          <div className="md:hidden mb-16 pl-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-black uppercase tracking-widest text-primary mb-6">
              <Zap className="w-3 h-3" /> Core Features
            </div>
            <h2 className="text-4xl font-display font-black tracking-tighter leading-[1.1] text-white mb-6">
              Unlock the <br />
              power of <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">TapOpen.</span>
            </h2>
            <div className="border-l-2 border-primary/50 pl-4 py-1">
              <p className="text-gray-400 text-sm font-medium leading-relaxed">
                Everything you need to manage your digital presence in a single, high-performance dashboard.
              </p>
            </div>
          </div>

          {/* Desktop Header Layout */}
          <div className="hidden md:block text-center mb-24">
            <h2 className="text-6xl font-display font-black tracking-tighter mb-6 text-white leading-[1.1]">
              What you can do with <span className="text-primary">TapOpen</span>
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto font-medium text-base leading-relaxed">
              Everything you need to manage your digital presence in a single, high-performance dashboard.
            </p>
          </div>

          <div className="relative max-w-2xl mx-auto h-[380px] md:h-[350px]">
            {/* Pagination / Dots */}
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 flex gap-6 z-20">
              {featuresData.map((f, i) => (
                <button 
                  key={i} 
                  onClick={() => setActiveFeatureIndex(i)}
                  className={`w-3 h-3 rounded-full transition-all duration-500 cursor-pointer ${activeFeatureIndex === i ? `${f.dotColor} ring-4 ring-background ${f.shadow} scale-125` : 'bg-white/20 hover:bg-white/40'}`} 
                />
              ))}
            </div>

            {/* Connecting line behind dots */}
            <div className="absolute -top-[34px] left-1/2 -translate-x-1/2 w-48 h-[2px] bg-gradient-to-r from-transparent via-white/10 to-transparent z-10" />

            {/* Slideshow */}
            <div className="relative w-full h-full">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeFeatureIndex}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4 }}
                  className="absolute inset-x-0"
                >
                  <FeatureCard 
                    icon={featuresData[activeFeatureIndex].icon} 
                    title={featuresData[activeFeatureIndex].title} 
                    desc={featuresData[activeFeatureIndex].desc} 
                    color={featuresData[activeFeatureIndex].color} 
                  />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>

      {/* Visual Demo Section */}
      <section className="py-12 md:py-16 border-y border-white/10">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <ScrollFadeIn>
              <div className="space-y-8 text-left">
                <div className="w-12 h-1 bg-primary rounded-full" />
                <h2 className="text-4xl md:text-6xl font-display font-black tracking-tighter leading-tight md:leading-none text-white">
                  One Hub. <br />
                  <span className="opacity-40 text-gray-400">Show your work too.</span>
                </h2>
                <div className="space-y-6">
                  <BenefitItem icon={Briefcase} title="Show your work too" desc="Add your projects, resume, and experience to the same page. No need to build a separate portfolio website." />
                  <BenefitItem icon={Sparkles} title="Changes go live instantly" desc="Update a link once and it changes everywhere. No need to reshare anything." />
                  <BenefitItem icon={Lock} title="Hide what you don't need" desc="Don't want to show your portfolio right now? Just toggle it off. You control what people see." />
                  <BenefitItem icon={Globe} title="Use your own domain" desc="Use yourname.com instead of tapopen.co/yourname. Looks cleaner when sending it to clients or colleges." />
                </div>
              </div>
            </ScrollFadeIn>
            
            <ScrollFadeIn delay={200}>
              <div className="relative group hidden lg:block">
                <div className="absolute inset-0 bg-primary/20 blur-[80px] opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative glass-panel-heavy p-4 overflow-hidden aspect-[9/16] max-w-[320px] mx-auto transform group-hover:scale-105 transition-transform duration-700">
                  <div className="absolute top-0 inset-x-0 h-8 glass-panel border-none rounded-none z-10" />
                  <div className="w-full h-full bg-background rounded-[2rem] border border-white/10 overflow-hidden flex flex-col items-center pt-12 p-6">
                    <div className="w-16 h-16 rounded-full bg-white/10 mb-6 animate-pulse" />
                    <div className="w-32 h-4 bg-white/10 rounded-full mb-2 animate-pulse" />
                    <div className="w-24 h-2 bg-white/5 rounded-full mb-12 animate-pulse" />
                    <div className="space-y-3 w-full">
                      {[1,2,3,4].map(i => (
                        <div key={i} className="w-full h-10 rounded-xl glass-panel border-none shadow-sm" />
                      ))}
                    </div>
                    <div className="mt-auto w-full flex gap-2">
                       <div className="flex-1 h-8 rounded-lg bg-primary/20" />
                       <div className="flex-1 h-8 rounded-lg bg-white/10" />
                    </div>
                  </div>
                </div>
              </div>
            </ScrollFadeIn>
          </div>
        </div>
      </section>

      {/* Platform Marquee */}
      <section id="platform" className="py-12 md:py-16 overflow-hidden border-b border-white/10 relative">
        <div className="absolute left-0 top-0 bottom-0 w-20 md:w-40 bg-gradient-to-r from-[#0A0A0B] to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-20 md:w-40 bg-gradient-to-l from-[#0A0A0B] to-transparent z-10 pointer-events-none" />

        <div className="text-center mb-16 relative z-20">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400">Works with every app you already use</p>
        </div>
        
        <div className="space-y-6 relative z-0 flex flex-col items-center">
          {/* Row 1 */}
          <div className="flex animate-marquee whitespace-nowrap gap-6 w-max items-center hover:[animation-play-state:paused]">
            {[...platforms, ...platforms, ...platforms, ...platforms].map((p, i) => (
              <div key={`row1-${p.name}-${i}`} className="flex items-center gap-3 px-6 py-3 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors cursor-default">
                <p.icon className="h-5 w-5" style={{ color: p.color }} />
                <span className="text-sm font-display font-bold tracking-tight text-white">{p.name}</span>
              </div>
            ))}
          </div>

          {/* Row 2 (Reverse) */}
          <div className="flex animate-marquee-reverse whitespace-nowrap gap-6 w-max items-center hover:[animation-play-state:paused]">
            {[...platforms.slice().reverse(), ...platforms.slice().reverse(), ...platforms.slice().reverse(), ...platforms.slice().reverse()].map((p, i) => (
              <div key={`row2-${p.name}-${i}`} className="flex items-center gap-3 px-6 py-3 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors cursor-default">
                <p.icon className="h-5 w-5" style={{ color: p.color }} />
                <span className="text-sm font-display font-bold tracking-tight text-white">{p.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-12 md:py-16 px-6 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[180px] -z-10" />
        <div className="container mx-auto max-w-4xl">
          <ScrollFadeIn>
            <h2 className="text-4xl md:text-8xl font-display font-black mb-10 tracking-tighter leading-tight md:leading-[0.85] text-white">
              Set it up in <br /> <span className="text-primary">2 minutes. Free.</span>
            </h2>
            <p className="text-lg text-gray-400 mb-10 font-medium">Pick a name, add your links, share one URL. That's it.</p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Button size="lg" className="h-16 px-12 rounded-xl text-lg font-black uppercase tracking-widest shadow-2xl" asChild>
                <Link to={session ? "/dashboard/hub" : "/auth/signup"}>
                  {session ? "Go to Dashboard" : "Create my page"}
                </Link>
              </Button>

            </div>
          </ScrollFadeIn>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-24 px-6 border-t border-white/10 bg-background">
        <div className="container mx-auto max-w-7xl">
          <div className="grid md:grid-cols-4 gap-12 mb-20">
            <div className="col-span-2 space-y-6">
               <Link to="/" className="flex items-center gap-2 group">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-[0_4px_12px_rgba(139,92,246,0.3)] group-hover:rotate-12 transition-transform">
                  <Zap className="w-5 h-5 text-white fill-white" />
                </div>
                <span className="font-display text-2xl font-black tracking-tighter text-white">TapOpen</span>
              </Link>
              <p className="text-white font-bold text-sm">One page for all your links.</p>
              <p className="text-gray-400 max-w-xs leading-relaxed font-medium">Links that open apps, not broken browsers.</p>
            </div>
            <div>
              <h4 className="text-white font-bold mb-6 text-sm uppercase tracking-widest">Platform</h4>
              <ul className="space-y-4 text-gray-400 text-[10px] font-black uppercase tracking-widest">
                <li><a href="#" className="hover:text-primary transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Portfolio</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Blogging</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-6 text-sm uppercase tracking-widest">Support</h4>
              <ul className="space-y-4 text-gray-400 text-[10px] font-black uppercase tracking-widest">
                <li><a href="#" className="hover:text-primary transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Terms</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Privacy</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-12 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500">© 2025 TapOpen. Every link, working right.</p>
            <div className="flex gap-8 text-[10px] font-black uppercase tracking-[0.4em] text-gray-500">
               <a href="#" className="hover:text-white transition-colors">Twitter</a>
               <a href="#" className="hover:text-white transition-colors">Instagram</a>
               <a href="#" className="hover:text-white transition-colors">LinkedIn</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon: Icon, title, desc, color }: { icon: any; title: string; desc: string; color: string }) => (
  <div className="group relative p-8 glass-panel hover:border-primary/50 transition-all hover:shadow-[0_20px_40px_-12px_rgba(139,92,246,0.15)] text-left">
    <div className={`icon-wrapper mb-8 inline-flex group-hover:scale-110 transition-transform`}>
      <Icon className={`w-6 h-6 ${color}`} />
    </div>
    <h3 className="text-2xl font-black mb-4 tracking-tighter text-white">{title}</h3>
    <p className="text-gray-400 leading-relaxed text-sm font-medium">{desc}</p>
  </div>
);

const BenefitItem = ({ icon: Icon, title, desc }: { icon: any; title: string; desc: string }) => (
  <div className="flex gap-6 items-start">
    <div className="icon-wrapper shrink-0">
      <Icon className="w-5 h-5" />
    </div>
    <div>
      <h4 className="text-xl font-black mb-1 tracking-tight text-white">{title}</h4>
      <p className="text-gray-400 text-sm leading-relaxed font-medium">{desc}</p>
    </div>
  </div>
);

export default LandingPage;
