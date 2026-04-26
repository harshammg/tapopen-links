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
import { motion } from "framer-motion";

const LandingPage = () => {
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
  }, []);

  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-primary/10 overflow-hidden">
      {/* Dynamic Background Glows - Soft Light Version */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-400/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-400/5 rounded-full blur-[120px]" />
      </div>

      {/* Nav */}
      <nav className="fixed top-4 left-4 right-4 z-50 border border-slate-200 bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-[0_8px_32px_rgba(0,0,0,0.04)] max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-[0_4px_12px_rgba(59,130,246,0.3)] group-hover:rotate-12 transition-transform">
              <Zap className="w-5 h-5 text-white fill-white" />
            </div>
            <span className="font-display text-xl font-bold tracking-tighter text-slate-900">TapOpen</span>
          </Link>
          
          <div className="hidden md:flex items-center gap-8 text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">
            <a href="#features" className="hover:text-primary transition-colors">Features</a>
            <a href="#platform" className="hover:text-primary transition-colors">Platforms</a>
          </div>

          <div className="flex gap-4">
            {session ? (
              <Button size="sm" className="bg-slate-900 text-white hover:bg-slate-800 rounded-full font-bold text-[10px] uppercase tracking-widest px-6" asChild>
                <Link to="/dashboard/hub">
                  <LayoutDashboard className="mr-2 h-3.5 w-3.5" /> Dashboard
                </Link>
              </Button>
            ) : (
              <>
                <Button variant="ghost" size="sm" className="hidden sm:flex text-slate-500 hover:text-slate-900 font-bold text-[10px] uppercase tracking-widest" asChild>
                  <Link to="/auth/login">Login</Link>
                </Button>
                <Button size="sm" className="bg-primary hover:bg-primary/90 text-white rounded-full font-bold text-[10px] uppercase tracking-widest px-6 shadow-[0_4px_15px_rgba(59,130,246,0.2)]" asChild>
                  <Link to="/auth/signup">Join Elite</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-48 pb-32 px-6">
        <div className="container mx-auto text-center max-w-5xl">
          <ScrollFadeIn>
            <div className="inline-flex items-center gap-2 bg-slate-50 border border-slate-200 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.3em] mb-8 text-slate-500">
              <Sparkles className="h-3 w-3 text-yellow-500" /> 
              Evolution of the Digital Identity
            </div>
          </ScrollFadeIn>
          
          <ScrollFadeIn delay={100}>
            <h1 className="text-6xl md:text-9xl font-display font-bold mb-8 leading-[0.85] tracking-tighter text-slate-900">
              Your Entire World <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-emerald-600">In One Tap.</span>
            </h1>
          </ScrollFadeIn>

          <ScrollFadeIn delay={200}>
            <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto mb-12 font-medium leading-relaxed">
              Experience the fastest way to share your links, portfolio, and blogs. Native app redirects. Instant QR networking. Professional aesthetic.
            </p>
          </ScrollFadeIn>

          <ScrollFadeIn delay={300}>
            <div className="flex flex-col items-center gap-6">
              <AnonymousGenerator session={session} />
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-30">Press Enter to claim your unique hub</p>
            </div>
          </ScrollFadeIn>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-32 px-6 relative bg-slate-50/50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-24">
            <h2 className="text-4xl md:text-6xl font-display font-bold tracking-tighter mb-6 text-slate-900">Built for the <span className="text-primary">Next Era.</span></h2>
            <p className="text-slate-400 max-w-xl mx-auto font-medium">Everything you need to manage your digital presence in a single, high-performance dashboard.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={Smartphone} 
              title="Native Redirects" 
              desc="Open YouTube, Instagram, and Spotify directly in their native apps. No more login walls." 
              color="text-blue-600"
            />
            <FeatureCard 
              icon={QrCode} 
              title="Live QR Scanner" 
              desc="Scan anyone, connect anywhere. A professional networking suite built into your profile." 
              color="text-purple-600"
            />
            <FeatureCard 
              icon={Briefcase} 
              title="Pro Portfolio" 
              desc="Showcase your best work and professional journey with a stunning, high-end resume layout." 
              color="text-emerald-600"
            />
          </div>
        </div>
      </section>

      {/* Visual Demo Section */}
      <section className="py-32 border-y border-slate-100">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <ScrollFadeIn>
              <div className="space-y-8 text-left">
                <div className="w-12 h-1 bg-primary rounded-full" />
                <h2 className="text-4xl md:text-6xl font-display font-bold tracking-tighter leading-none text-slate-900">
                  One Hub. <br />
                  <span className="opacity-20 text-slate-400">Total Control.</span>
                </h2>
                <div className="space-y-6">
                  <BenefitItem icon={Zap} title="Instant Updates" desc="Change your links or theme and see it live across the world instantly." />
                  <BenefitItem icon={Globe} title="Custom Domains" desc="Use your own branding and personality to stand out from the noise." />
                  <BenefitItem icon={Lock} title="Private Mode" desc="Choose exactly what to show and hide with section visibility toggles." />
                </div>
              </div>
            </ScrollFadeIn>
            
            <ScrollFadeIn delay={200}>
              <div className="relative group">
                <div className="absolute inset-0 bg-primary/5 blur-[80px] opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative bg-white rounded-[3.5rem] border border-slate-200 p-4 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.1)] overflow-hidden aspect-[9/16] max-w-[320px] mx-auto transform group-hover:scale-105 transition-transform duration-700">
                  <div className="absolute top-0 inset-x-0 h-8 bg-white z-10" />
                  <div className="w-full h-full bg-slate-50 rounded-[2.5rem] overflow-hidden flex flex-col items-center pt-12 p-6">
                    <div className="w-16 h-16 rounded-full bg-slate-200 mb-6 animate-pulse" />
                    <div className="w-32 h-4 bg-slate-200 rounded-full mb-2 animate-pulse" />
                    <div className="w-24 h-2 bg-slate-100 rounded-full mb-12 animate-pulse" />
                    <div className="space-y-3 w-full">
                      {[1,2,3,4].map(i => (
                        <div key={i} className="w-full h-10 rounded-xl bg-white border border-slate-100 shadow-sm" />
                      ))}
                    </div>
                    <div className="mt-auto w-full flex gap-2">
                       <div className="flex-1 h-8 rounded-lg bg-primary/10" />
                       <div className="flex-1 h-8 rounded-lg bg-slate-100" />
                    </div>
                  </div>
                </div>
              </div>
            </ScrollFadeIn>
          </div>
        </div>
      </section>

      {/* Platform Marquee */}
      <section id="platform" className="py-32 overflow-hidden border-b border-slate-100">
        <div className="text-center mb-16">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Integrated with every major platform</p>
        </div>
        <div className="flex animate-marquee whitespace-nowrap gap-12 w-max items-center">
          {[...platforms, ...platforms].map((p, i) => (
            <div key={`${p.name}-${i}`} className="flex items-center gap-4 px-10 py-6 rounded-[2.5rem] border border-slate-200 bg-white shadow-sm hover:border-primary/50 transition-colors">
              <p.icon className="h-8 w-8 text-primary" />
              <span className="text-xl font-display font-bold tracking-tighter text-slate-900">{p.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-48 px-6 text-center relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[180px] -z-10" />
        <div className="container mx-auto max-w-4xl">
          <ScrollFadeIn>
            <h2 className="text-5xl md:text-8xl font-display font-bold mb-10 tracking-tighter leading-[0.85] text-slate-900">
              Ready to enter the <br /> <span className="text-primary">Elite tier?</span>
            </h2>
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Button size="lg" className="h-16 px-12 rounded-full text-lg font-black uppercase tracking-widest bg-slate-900 text-white hover:bg-slate-800 shadow-2xl" asChild>
                <Link to={session ? "/dashboard/hub" : "/auth/signup"}>
                  {session ? "Go to Dashboard" : "Join TapOpen Now"}
                </Link>
              </Button>
              <div className="flex flex-col items-start gap-1">
                <div className="flex gap-1">
                  {[1,2,3,4,5].map(i => <Sparkles key={i} className="w-4 h-4 text-yellow-500 fill-yellow-500" />)}
                </div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Trusted by 10,000+ creators</p>
              </div>
            </div>
          </ScrollFadeIn>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-24 px-6 border-t border-slate-100 bg-slate-50">
        <div className="container mx-auto max-w-7xl">
          <div className="grid md:grid-cols-4 gap-12 mb-20">
            <div className="col-span-2 space-y-6">
               <Link to="/" className="flex items-center gap-2 group">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-[0_4px_12px_rgba(59,130,246,0.3)] group-hover:rotate-12 transition-transform">
                  <Zap className="w-5 h-5 text-white fill-white" />
                </div>
                <span className="font-display text-2xl font-bold tracking-tighter text-slate-900">TapOpen</span>
              </Link>
              <p className="text-slate-400 max-w-xs leading-relaxed font-medium">The definitive platform for the next generation of creators, professionals, and digital nomads.</p>
            </div>
            <div>
              <h4 className="text-slate-900 font-bold mb-6 text-sm uppercase tracking-widest">Platform</h4>
              <ul className="space-y-4 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                <li><a href="#" className="hover:text-primary transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Portfolio</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Blogging</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-slate-900 font-bold mb-6 text-sm uppercase tracking-widest">Support</h4>
              <ul className="space-y-4 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                <li><a href="#" className="hover:text-primary transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Terms</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Privacy</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-12 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300">© 2025 TapOpen Inc. Every Tap. Native Power.</p>
            <div className="flex gap-8 text-[10px] font-black uppercase tracking-[0.4em] text-slate-300">
               <a href="#" className="hover:text-slate-900 transition-colors">Twitter</a>
               <a href="#" className="hover:text-slate-900 transition-colors">Instagram</a>
               <a href="#" className="hover:text-slate-900 transition-colors">LinkedIn</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon: Icon, title, desc, color }: { icon: any; title: string; desc: string; color: string }) => (
  <div className="group relative p-8 rounded-[2.5rem] bg-white border border-slate-200 hover:border-primary/20 transition-all hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.05)] text-left">
    <div className={`w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center mb-8 border border-slate-100 group-hover:scale-110 transition-transform ${color}`}>
      <Icon className="w-6 h-6" />
    </div>
    <h3 className="text-2xl font-bold mb-4 tracking-tighter text-slate-900">{title}</h3>
    <p className="text-slate-400 leading-relaxed text-sm font-medium">{desc}</p>
  </div>
);

const BenefitItem = ({ icon: Icon, title, desc }: { icon: any; title: string; desc: string }) => (
  <div className="flex gap-6 items-start">
    <div className="w-10 h-10 rounded-full bg-primary/5 flex items-center justify-center shrink-0">
      <Icon className="w-5 h-5 text-primary" />
    </div>
    <div>
      <h4 className="text-xl font-bold mb-1 tracking-tight text-slate-900">{title}</h4>
      <p className="text-slate-400 text-sm leading-relaxed font-medium">{desc}</p>
    </div>
  </div>
);

export default LandingPage;
